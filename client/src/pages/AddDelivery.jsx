// src/pages/AddDelivery.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, Grid, FormControl,
  InputLabel, Select, MenuItem
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../contexts/UserContext';
import { Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';


function AddDelivery() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedProvider = location.state?.provider || '';

  const { user } = useContext(UserContext);

  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    userId: null
  });

  const [delivery, setDelivery] = useState({
    rfqId: '123456',
    poNumber: '',
    assignedTo: '',
    deliveryDate: '',
    timing: '',
    deliveryType: 'Standard',
    location: '',
    description: '',
    deliveryProvider: selectedProvider,
    phone: '',
    userId: null
  });

  const [products, setProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  // Load user info from context or localStorage
  useEffect(() => {
    if (user) {
      setUserInfo({
        name: user.name || '',
        email: user.email || '',
        userId: user.id || null
      });

      setDelivery((prev) => ({
        ...prev,
        userId: user.id || null,
        deliveryProvider: selectedProvider
      }));
    } else {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        setUserInfo({
          name: userData.name || '',
          email: userData.email || '',
          userId: userData.id || null
        });
        setDelivery((prev) => ({
          ...prev,
          userId: userData.id || null,
          deliveryProvider: selectedProvider
        }));
      }
    }
  }, [user, selectedProvider]);

  // Fetch RFQ info on blur (existing behavior)
  const handleRFQBlur = async () => {
    if (!delivery.rfqId) return;
    try {
      const res = await axios.get(`http://localhost:3001/api/rfq/${delivery.rfqId}`);
      if (res.data) {
        setDelivery((prev) => ({
          ...prev,
          poNumber: res.data.poNumber || prev.poNumber,
          location: res.data.location || prev.location,
          description: res.data.description || prev.description,
        }));
        setProducts(res.data.products || []);
      }
    } catch (err) {
      toast.error('Failed to fetch RFQ data: ' + err.message);
      setProducts([]);
    }
  };

  // ALSO add a button to fetch RFQ info on demand, like your original version
  const handleFetchRfqButton = async () => {
    if (!delivery.rfqId) {
      toast.error('Please enter RFQ ID first');
      return;
    }
    await handleRFQBlur();
  };

  // Submit with confirmation dialog (window.confirm)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!delivery.rfqId || !delivery.poNumber || !delivery.location || !delivery.timing) {
      toast.error('Please fill required delivery fields.');
      return;
    }

    const confirmed = window.confirm('Submit this delivery?');
    if (!confirmed) return;

    try {
      const API_BASE = 'http://localhost:3001';
      await axios.post(`${API_BASE}/api/delivery`, {
        user: {
          id: userInfo.userId,
          name: userInfo.name,
          email: userInfo.email,
          phone: delivery.phone,
        },
        delivery,
        products
      });

      toast.success('Delivery submitted!');

      // Reset form
      setDelivery((prev) => ({
        ...prev,
        rfqId: '',
        poNumber: '',
        assignedTo: '',
        deliveryDate: '',
        timing: '',
        location: '',
        description: '',
        phone: '',
        deliveryType: 'Standard',
        deliveryProvider: selectedProvider,
      }));

      setProducts([]);
      setOpenDialog(true);
    } catch (err) {
      toast.error('Failed to submit delivery: ' + err.message);
    }
  };

  return (
    <Box maxWidth="800px" mx="auto" p={3}>
      <Typography variant="h4" gutterBottom>Add Delivery</Typography>

      <form onSubmit={handleSubmit}>
        <Typography variant="h6">User Information</Typography>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Name" value={userInfo.name} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Email" value={userInfo.email} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={delivery.phone}
              onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
            />
          </Grid>
        </Grid>

        <Typography variant="h6">Delivery Information</Typography>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="RFQ ID *"
              value={delivery.rfqId}
              onChange={(e) => setDelivery({ ...delivery, rfqId: e.target.value })}
              onBlur={handleRFQBlur}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} display="flex" alignItems="center">
            <Button variant="outlined" onClick={handleFetchRfqButton}>Fetch Product</Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="PO Number *"
              value={delivery.poNumber}
              onChange={(e) => setDelivery({ ...delivery, poNumber: e.target.value })}
              required
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
              label="Delivery Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={delivery.deliveryDate}
              onChange={(e) => setDelivery({ ...delivery, deliveryDate: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Timing *"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={delivery.timing}
              onChange={(e) => setDelivery({ ...delivery, timing: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location *"
              value={delivery.location}
              onChange={(e) => setDelivery({ ...delivery, location: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Delivery Provider" value={delivery.deliveryProvider} InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Delivery Option</InputLabel>
              <Select
                value={delivery.deliveryType}
                label="Delivery Option"
                onChange={(e) => setDelivery({ ...delivery, deliveryType: e.target.value })}
              >
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Express">Express</MenuItem>
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

        {/* Display products as in your original version */}
        {products.length > 0 && (
  <Box mt={3} component={Paper} elevation={3}>
    <Typography variant="h6" p={2}>Products in this RFQ</Typography>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell><strong>Item</strong></TableCell>
          <TableCell><strong>Quantity</strong></TableCell>
          <TableCell><strong>Target Price</strong></TableCell>
          <TableCell><strong>Specification</strong></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {products.map((prod, idx) => (
          <TableRow key={idx}>
            <TableCell>{prod.item}</TableCell>
            <TableCell>{prod.quantity ?? 'N/A'}</TableCell>
            <TableCell>{prod.targetPrice !== null ? `$${prod.targetPrice}` : 'N/A'}</TableCell>
            <TableCell>{prod.spec || prod.specification || 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
)}

        <Box textAlign="center" mt={4}>
          <Button variant="contained" color="success" type="submit" size="large">
            Submit Delivery
          </Button>
        </Box>
      </form>

      <ToastContainer position="top-right" autoClose={2000} />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Delivery Submitted</DialogTitle>
        <DialogContent>
          Your delivery has been submitted successfully.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              navigate('/delivery-management');
            }}
            variant="contained"
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AddDelivery;
