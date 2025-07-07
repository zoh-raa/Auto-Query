import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
// MUI Components for UI layout and form
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
// Toast for notifications
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddDelivery() {
   // Access passed state (e.g., deliveryProvider from previous page)
  const location = useLocation();
  const selectedProvider = location.state?.provider || '';// Fallback to empty if not passed
 // User info
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    role: '',
  });
// Delivery details (default deliveryProvider taken from navigation state)
  const [delivery, setDelivery] = useState({
    rfqId: '',
    poNumber: '',
    assignedTo: '',
    deliveryDate: '',
    dueDate: '',
    location: '',
    type: 'Private',
    description: '',
    deliveryProvider: selectedProvider,
  });
// Product list state
  const [products, setProducts] = useState([]);
  // Current product being added/edited
  const [currentProduct, setCurrentProduct] = useState({
    item: '',
    quantity: '',
    targetPrice: '',
    spec: '',
  });
  const [editingIndex, setEditingIndex] = useState(null);
 // === Product Functions ===

  // Add or update a product
  const handleAddOrUpdateProduct = () => {
    if (!currentProduct.item.trim()) {
      toast.error('Product item name is required');
      return;
    }

    if (editingIndex !== null) {
       // Update existing product
      const updated = [...products];
      updated[editingIndex] = currentProduct;
      setProducts(updated);
      toast.success(`Product "${currentProduct.item}" updated`);
      setEditingIndex(null);
    } else {
       // Add new product
      setProducts([...products, currentProduct]);
      toast.success(`Product "${currentProduct.item}" added`);
    }
// Reset input
    setCurrentProduct({ item: '', quantity: '', targetPrice: '', spec: '' });
  };
// Delete a product from list
  const handleDeleteProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
    toast.info('Product deleted');
    if (editingIndex === index) {
      setEditingIndex(null);
      setCurrentProduct({ item: '', quantity: '', targetPrice: '', spec: '' });
    }
  };
 // Load product into form for editing
  const handleEditProduct = (index) => {
    setCurrentProduct(products[index]);
    setEditingIndex(index);
  };
// === Form Submit Handler ===
  const handleSubmit = async (e) => {
    e.preventDefault();
// Basic validations
    if (!user.firstName || !user.lastName || !user.phone || !user.email) {
      toast.error('Please fill all user info fields.');
      return;
    }

    if (!delivery.rfqId || !delivery.poNumber || !delivery.location) {
      toast.error('Please fill required delivery fields.');
      return;
    }

    if (!delivery.deliveryProvider) {
      toast.error('Delivery provider is required.');
      return;
    }

    try {
      const API_BASE = 'http://localhost:3001';
// Send data to backend
      await axios.post(`${API_BASE}/api/delivery`, { user, delivery, products });

      toast.success('Delivery submitted successfully!');
 // Reset all form state
      setUser({ firstName: '', lastName: '', phone: '', email: '', company: '', role: '' });
      setDelivery({
        rfqId: '',
        poNumber: '',
        assignedTo: '',
        deliveryDate: '',
        dueDate: '',
        location: '',
        type: 'Private',
        description: '',
        deliveryProvider: '',
      });
      setProducts([]);
      setCurrentProduct({ item: '', quantity: '', targetPrice: '', spec: '' });
      setEditingIndex(null);
    } catch (err) {
      toast.error('Failed to submit delivery: ' + err.message);
    }
  };
 // === Component UI ===
  return (
    <Box maxWidth="800px" mx="auto" p={3}>
      <Typography variant="h4" gutterBottom>
        Add Delivery
      </Typography>

      <form onSubmit={handleSubmit}>
        {/* User Info */}
        <Typography variant="h6" gutterBottom>
          User Information
        </Typography>
        <Grid container spacing={2} mb={3}>
          {[
            { label: 'First Name', name: 'firstName', required: true },
            { label: 'Last Name', name: 'lastName', required: true },
            { label: 'Phone Number', name: 'phone', required: true, type: 'tel' },
            { label: 'Email Address', name: 'email', required: true, type: 'email' },
            { label: 'Company', name: 'company', required: false },
            { label: 'Role', name: 'role', required: false },
          ].map(({ label, name, required, type = 'text' }) => (
            <Grid item xs={12} sm={6} key={name}>
              <TextField
                fullWidth
                label={label + (required ? ' *' : '')}
                type={type}
                value={user[name]}
                required={required}
                onChange={(e) => setUser({ ...user, [name]: e.target.value })}
              />
            </Grid>
          ))}
        </Grid>

        {/* Delivery Info */}
        <Typography variant="h6" gutterBottom>
          Delivery Information
        </Typography>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="RFQ ID *"
              required
              value={delivery.rfqId}
              onChange={(e) => setDelivery({ ...delivery, rfqId: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="PO Number *"
              required
              value={delivery.poNumber}
              onChange={(e) => setDelivery({ ...delivery, poNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Assigned To"
              value={delivery.assignedTo}
              onChange={(e) => setDelivery({ ...delivery, assignedTo: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Delivery Date"
              InputLabelProps={{ shrink: true }}
              value={delivery.deliveryDate}
              onChange={(e) => setDelivery({ ...delivery, deliveryDate: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Due Date"
              InputLabelProps={{ shrink: true }}
              value={delivery.dueDate}
              onChange={(e) => setDelivery({ ...delivery, dueDate: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location *"
              required
              value={delivery.location}
              onChange={(e) => setDelivery({ ...delivery, location: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Delivery Provider"
              value={delivery.deliveryProvider}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Delivery Type</InputLabel>
              <Select
                value={delivery.type}
                label="Delivery Type"
                onChange={(e) => setDelivery({ ...delivery, type: e.target.value })}
              >
                <MenuItem value="Private">Private</MenuItem>
                <MenuItem value="Public">Public</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={delivery.description}
              onChange={(e) => setDelivery({ ...delivery, description: e.target.value })}
            />
          </Grid>
        </Grid>

        {/* Products Input */}
        <Typography variant="h6" gutterBottom>
          Products
        </Typography>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Item *"
              fullWidth
              value={currentProduct.item}
              onChange={(e) =>
                setCurrentProduct({ ...currentProduct, item: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={currentProduct.quantity}
              onChange={(e) =>
                setCurrentProduct({ ...currentProduct, quantity: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Target Price"
              type="number"
              fullWidth
              value={currentProduct.targetPrice}
              onChange={(e) =>
                setCurrentProduct({ ...currentProduct, targetPrice: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Specification"
              fullWidth
              value={currentProduct.spec}
              onChange={(e) =>
                setCurrentProduct({ ...currentProduct, spec: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleAddOrUpdateProduct}
              sx={{ mt: 1 }}
            >
              {editingIndex !== null ? 'Update Product' : 'Add Product'}
            </Button>
          </Grid>
        </Grid>

        {/* Products Table */}
        {products.length > 0 && (
          <>
            <Typography variant="h6" mt={4} mb={2}>
              Products List
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="products table">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Target Price</TableCell>
                    <TableCell>Specification</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{p.item}</TableCell>
                      <TableCell>{p.quantity || '-'}</TableCell>
                      <TableCell>{p.targetPrice || '-'}</TableCell>
                      <TableCell>{p.spec || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="warning"
                          size="small"
                          onClick={() => handleEditProduct(i)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteProduct(i)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Submit Button */}
        <Box textAlign="center" mt={4}>
          <Button variant="contained" color="success" type="submit" size="large">
            Submit Delivery
          </Button>
        </Box>
      </form>
{/* Toast Container for showing notifications */}
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
}

export default AddDelivery;
