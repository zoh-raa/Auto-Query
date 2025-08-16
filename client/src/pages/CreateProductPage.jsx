import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Paper, Stack, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import StaffSidebar from '../components/StaffSidebar';
import http from '../https';
const brandOptions = [
  'Honda',
  'Yamaha',
  'Other'
];

const CreateProductPage = () => {
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    productName: '',
    productId: '',
    productNumber: '',
    productDescription: '',
    image: null,
    quantity: '',
    productBrand: '',
    price: '' // <-- added
  });
  const [parts, setParts] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  // Fetch all parts when Edit/Delete tab is active or after creation
  useEffect(() => {
    if (tab === 1) fetchParts();
  }, [tab]);

  const fetchParts = () => {
    fetch('http://localhost:3001/staff/products', {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    })
      .then(res => res.json())
      .then(data => setParts(data))
      .catch(() => setParts([]));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  // Show confirmation dialog instead of uploading immediately
  const handlePreSubmit = (e) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  // upload after confirmation
  const handleSubmit = () => {
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    fetch('http://localhost:5000/staff/products', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: data
    })
      .then(res => res.json())
      .then(result => {
        alert('Product Created!');
        setFormData({
          productName: '',
          productId: '',
          productNumber: '',
          productDescription: '',
          image: null,
          quantity: '',
          productBrand: '',   // <-- add this
          price: ''           // <-- add this
        });
        setConfirmOpen(false);
        fetchParts();
      })
      .catch(err => {
        alert('Failed to create product');
        setConfirmOpen(false);
      });
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this part?')) return;
    try {
      const res = await fetch(`http://localhost:3001/staff/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (res.ok) {
        setParts(parts => parts.filter(part => part.productId !== productId));
        alert('Part deleted.');
      } else {
        alert('Failed to delete part.');
      }
    } catch (err) {
      alert('Error deleting part.');
    }
  };

  // Edit/Delete Parts Tab
  const EditDeleteParts = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Edit/Delete Parts</Typography>
      {parts.length === 0 ? (
        <Typography color="text.secondary">No parts found.</Typography>
      ) : (
        <Box>
          {parts.map(part => (
            <Paper key={part.productId} sx={{ p: 2, mb: 2 }}>
              <Typography fontWeight="bold">{part.productName}</Typography>
              <Typography variant="body2">Reference Number: {part.productId}</Typography>
              <Typography variant="body2">Brand: {part.productBrand}</Typography>
              <Typography variant="body2">Catalog Number: {part.productNumber}</Typography>
              <Typography variant="body2">Quantity: {part.quantity}</Typography>
              <Typography variant="body2">Price: {part.price}</Typography>
              <Typography variant="body2">{part.productDescription}</Typography>
              <Box mt={2} display="flex" gap={1}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => {
                    setFormData({
                      productName: part.productName,
                      productId: part.productId,
                      productNumber: part.productNumber,
                      productDescription: part.productDescription,
                      image: null,
                      quantity: part.quantity,
                      productBrand: part.productBrand,
                      price: part.price
                    });
                    setIsEditing(true);
                    setEditingProductId(part.productId);
                    setTab(0);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleDelete(part.productId)}
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );

  return (
    <Box display="flex" minHeight="100vh" bgcolor="#f5f5f5">
      <StaffSidebar />
      <Box flexGrow={1} p={4} display="flex" justifyContent="center" alignItems="flex-start">
        <Paper
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 950,
            borderRadius: 4,
            boxShadow: 3,
            minHeight: 600,
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ mb: 4 }}
            TabIndicatorProps={{ sx: { height: 3, bgcolor: 'primary.main' } }}
          >
            <Tab label="Add parts" sx={{ fontWeight: 100, fontSize: 15 }} />
            <Tab label="Edit/Delete parts" sx={{ fontWeight: 100, fontSize: 15 }} />
          </Tabs>
          {tab === 0 && (
            <form onSubmit={handlePreSubmit}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Box flex={1}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Part Name:
                    </Typography>
                    <TextField
                      name="productName"
                      fullWidth
                      onChange={handleChange}
                      value={formData.productName}
                      required
                    />
                  </Box>
                  <Box sx={{ minWidth: 220 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Reference Number:
                    </Typography>
                    <TextField
                      name="productId"
                      fullWidth
                      onChange={e => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, '');
                        handleChange({ target: { name: 'productId', value } });
                      }}
                      value={formData.productId}
                      required
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    />
                  </Box>
                  <Box flex={1}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Part Brand:
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel id="brand-label">Select Brand</InputLabel>
                    <Select
                      labelId="brand-label"
                      name="productBrand"
                      value={formData.productBrand}
                      label="Select Brand"
                      onChange={handleChange}
                      required
                    >
                      {brandOptions.map(brand => (
                        <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Catalog Part Number:
                    </Typography>
                    <TextField
                      name="productNumber"
                      fullWidth
                      onChange={handleChange}
                      value={formData.productNumber}
                      required
                    />
                  </Box>
                </Stack>
                <Button variant="outlined" sx={{ width: 200, alignSelf: 'flex-start' }} disabled>
                  Obtain product info
                </Button>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Part Description:
                  </Typography>
                  <TextField
                    name="productDescription"
                    multiline
                    rows={4}
                    fullWidth
                    onChange={handleChange}
                    value={formData.productDescription}
                    required
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Part Image/Diagram:
                  </Typography>
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: 'block', marginBottom: 8 }}
                  />
                </Box>
                <Stack direction="row" spacing={2} alignItems="flex-end">
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Product Quantity:
                    </Typography>
                    <TextField
                      name="quantity"
                      type="number"
                      sx={{ width: 160 }}
                      onChange={e => {
                        // Prevent negative values
                        const value = e.target.value;
                        handleChange({
                          target: {
                            name: 'quantity',
                            value: value === '' ? '' : Math.max(0, Number(value))
                          }
                        });
                      }}
                      value={formData.quantity}
                      required
                      inputProps={{ min: 0 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Price:
                    </Typography>
                    <TextField
                      name="price"
                      type="number"
                      sx={{ width: 120 }}
                      onChange={e => {
                        // Prevent negative values
                        const value = e.target.value;
                        handleChange({
                          target: {
                            name: 'price',
                            value: value === '' ? '' : Math.max(0, Number(value))
                          }
                        });
                      }}
                      value={formData.price}
                      required
                      inputProps={{ min: 0, step: "0.01" }}
                    />
                  </Box>
                  <Box sx={{ pb: 0.5 }}>
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{
                        width: 140,
                        bgcolor: 'success.main',
                        color: 'black',
                        fontWeight: 700,
                        fontSize: 18,
                        '&:hover': { bgcolor: 'success.dark' }
                      }}
                    >
                      Upload
                    </Button>
                  </Box>
                </Stack>
              </Stack>
            </form>
          )}
          {tab === 1 && <EditDeleteParts />}
        </Paper>
      </Box>
      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Part Details</DialogTitle>
        <DialogContent dividers>
          <Typography><b>Part Name:</b> {formData.productName}</Typography>
          <Typography><b>Reference Number:</b> {formData.productId}</Typography>
          <Typography><b>Brand:</b> {formData.productBrand}</Typography>
          <Typography><b>Catalog Part Number:</b> {formData.productNumber}</Typography>
          <Typography><b>Description:</b> {formData.productDescription}</Typography>
          <Typography><b>Quantity:</b> {formData.quantity}</Typography>
          <Typography><b>Image:</b> {formData.image && formData.image.name ? formData.image.name : 'No file selected'}</Typography>
          <Typography><b>Price:</b> {formData.price}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="success">Confirm & Upload</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateProductPage;
