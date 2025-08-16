import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { http } from '../https';
import axios from 'axios';
 // axios instance with base URL set
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, Grid, FormControl,
  InputLabel, Select, MenuItem, Paper, Table, TableHead, TableBody, TableRow, TableCell
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../contexts/UserContext';


const formatDateToDDMMYY = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year.slice(2)}`; // dd-mm-yy
};
function AddDelivery() {
  const location = useLocation();
  const navigate = useNavigate();
  const rfq = location.state?.rfq;
  const selectedProvider = location.state?.provider || '';
  console.log('AddDelivery received provider:', selectedProvider);
  const { user } = useContext(UserContext);

  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    userId: null
  });

  const [delivery, setDelivery] = useState({
    rfqId: '',
    poNumber: '',
    assignedTo: '',
    deliveryDate: '',
    timing: '',

    location: '',
    description: '',
    deliveryProvider: selectedProvider,
    phone: '',
    userId: null,
    status: 'Pending',
  });

  const [products, setProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const userData = user || JSON.parse(localStorage.getItem('user'));
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
  }, [user, selectedProvider]);

  useEffect(() => {
    if (rfq?.id) {
      setDelivery((prev) => ({
        ...prev,
        rfqId: rfq.id
      }));
      fetchRFQData(rfq.id);
    }
  }, [rfq]);

const fetchRFQData = async (rfqIdToFetch) => {
  if (!rfqIdToFetch) return;
  setLoading(true);

  try {
    const token = localStorage.getItem('accessToken');
    const res = await axios.get(`http://localhost:3001/rfq/${rfqIdToFetch}`, {
      headers: { Authorization: `Bearer ${token || ''}` }
    });

    if (res.data) {
      setDelivery((prev) => ({
        ...prev,
        poNumber: res.data.poNumber || prev.poNumber || '',
        location: res.data.location || prev.location || '',
        description: res.data.description || prev.description || '',
      }));

      const mappedProducts = (res.data.RFQItems || res.data.products || []).map(p => ({
        productId: p.product_id || p.id || null,
        item: p.product_name || p.item || 'No name',
        quantity: p.quantity || 0,
        remarks: p.remarks || '',
      }));

      console.log('Mapped Products:', mappedProducts);
      setProducts(mappedProducts);
      toast.success('RFQ products loaded.');
    } else {
      toast.error('RFQ not found.');
      setProducts([]);
    }
  } catch (error) {
    toast.error('Failed to fetch RFQ data: ' + (error.response?.data?.message || error.message));
    setProducts([]);
  } finally {
    setLoading(false);
  }
};

  const handleFetchRfqButton = () => {
    if (!delivery.rfqId) {
      toast.error('Please enter RFQ ID first');
      return;
    }
    fetchRFQData(delivery.rfqId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!delivery.rfqId || !delivery.poNumber || !delivery.location || !delivery.timing) {
      toast.error('Please fill in all required fields (RFQ ID, PO Number, Location, Timing)');
      return;
    }

    // Validate deliveryDate - if required, else set null when empty
    if (!delivery.deliveryDate) {
      toast.error('Please select a delivery date');
      return;
    }

    // Ensure deliveryDate is a valid date string (YYYY-MM-DD)
    const formattedDate = delivery.deliveryDate;
if (!formattedDate) {
  toast.error('Please select a valid delivery date');
  return;
}

    if (products.length === 0) {
      toast.error('No products selected for delivery');
      return;
    }

    setSubmitting(true);

    try {
      // Debug log before sending
      console.log('Submitting delivery:', {
        user: {
          id: userInfo.userId,
          name: userInfo.name,
          email: userInfo.email,
          phone: delivery.phone,
        },
        delivery: {
          rfqId: delivery.rfqId,
          poNumber: delivery.poNumber,
          assignedTo: delivery.assignedTo,
          deliveryDate: formattedDate,
          deliveryProvider: delivery.deliveryProvider,
          timing: delivery.timing,
          location: delivery.location,
          description: delivery.description,
          phone: delivery.phone,
        },
        products,
      });

      const token = localStorage.getItem('accessToken'); // get JWT from localStorage
if (!token) {
  toast.error("You must be logged in to submit a delivery!");
  setSubmitting(false);
  return;
}

const response = await axios.post(
  'http://localhost:3001/api/delivery',
  {
    user: {
      id: userInfo.userId,
      name: userInfo.name,
      email: userInfo.email,
      phone: delivery.phone,
    },
    delivery: {
      rfqId: delivery.rfqId,
      poNumber: delivery.poNumber,
      assignedTo: delivery.assignedTo,
      deliveryDate: formattedDate,
      timing: delivery.timing,
      location: delivery.location,
      description: delivery.description,
      deliveryProvider: delivery.deliveryProvider,
      phone: delivery.phone,
      status: delivery.status,
    },
    products,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,  // <-- include token here
    },
  }
);


      toast.success('Delivery submitted successfully!');
      setOpenDialog(true);

      // Reset form
      setDelivery({
        rfqId: '',
        poNumber: '',
        assignedTo: '',
        deliveryDate: '',
        timing: '',
        location: '',
        description: '',
        deliveryProvider: selectedProvider,
        phone: '',
        userId: userInfo.userId,
        status: 'Pending',
      });
      setProducts([]);
    } catch (error) {
      console.error('Delivery submission error:', error);
      const errorMsg = error.response?.data?.message ||
        error.response?.data?.details ||
        error.message;
      toast.error(`Failed to submit delivery: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box maxWidth="800px" mx="auto" p={3}>
      <Typography variant="h4" gutterBottom>Add Delivery</Typography>

      <form onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>User Information</Typography>
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
              disabled={loading || submitting}
            />
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>Delivery Information</Typography>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} display="flex" alignItems="center">
            <TextField
              fullWidth
              label="RFQ ID *"
              value={delivery.rfqId}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  setDelivery({ ...delivery, rfqId: val === '' ? '' : parseInt(val, 10) });
                }
              }}
              onBlur={() => { if (delivery.rfqId) fetchRFQData(delivery.rfqId); }}
              required
              disabled={loading || submitting}
            />
            <Button
              variant="outlined"
              onClick={handleFetchRfqButton}
              disabled={loading || submitting}
              sx={{ ml: 1, height: '56px' }}
            >
              Fetch Products
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="PO Number *"
              value={delivery.poNumber}
              onChange={(e) => setDelivery({ ...delivery, poNumber: e.target.value })}
              required
              disabled={loading || submitting}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Assigned To"
              value={delivery.assignedTo}
              onChange={(e) => setDelivery({ ...delivery, assignedTo: e.target.value })}
              disabled={loading || submitting}
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
              disabled={loading || submitting}
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
              disabled={loading || submitting}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location *"
              value={delivery.location}
              onChange={(e) => setDelivery({ ...delivery, location: e.target.value })}
              required
              disabled={loading || submitting}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
  <TextField
    select
    fullWidth
    label="Status *"
    value={delivery.status}
    onChange={(e) => setDelivery({ ...delivery, status: e.target.value })}
    required
    disabled={loading || submitting}
  >
    <MenuItem value="Pending">Pending</MenuItem>
    <MenuItem value="In Progress">In Progress</MenuItem>
    <MenuItem value="Delivered">Delivered</MenuItem>
    <MenuItem value="Cancelled">Cancelled</MenuItem>
  </TextField>
</Grid>


          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Delivery Provider"
              value={delivery.deliveryProvider}
              InputProps={{ readOnly: true }}
              disabled={loading || submitting}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={delivery.description}
              onChange={(e) => setDelivery({ ...delivery, description: e.target.value })}
              disabled={loading || submitting}
            />
          </Grid>
        </Grid>

        {products.length > 0 && (
          <Box mt={3} component={Paper} elevation={3}>
            <Typography variant="h6" p={2}>Products in this RFQ</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((prod, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{prod.item}</TableCell>
                    <TableCell>{prod.quantity}</TableCell>
                    <TableCell>{prod.remarks || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            color="success"
            type="submit"
            size="large"
            disabled={loading || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Delivery'}
          </Button>
        </Box>
      </form>

      <ToastContainer position="top-right" autoClose={2000} />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Delivery Submitted</DialogTitle>
        <DialogContent>
          Your delivery of Request For Quote has been submitted successfully.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              navigate('/delivery-management');  // <-- redirect here after submit
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
