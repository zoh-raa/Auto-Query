import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button,
  MenuItem, Select, FormControl, InputLabel, CircularProgress
} from '@mui/material';
import { instance as http } from '../https';

function EditDelivery() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const normalizeStatus = (status) => {
    if (!status) return 'Pending';
    switch (status.trim().toLowerCase().replace(/\s/g, '')) {
      case 'pending': return 'Pending';
      case 'inprogress': return 'In Progress';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return 'Pending';
    }
  };

  useEffect(() => {
    http.get(`/api/staff/delivery/${id}`)
      .then(res => {
        const data = res.data;
        setDelivery({
          ...data,
          status: normalizeStatus(data.status),
          deliveryDate: data.deliveryDate?.slice(0, 10) || '',
          phone: data.phone || data.user?.phone || data.customer?.phone || '',
        });
      })
      .catch(err => {
        console.error('Failed to load delivery', err);
        alert('Failed to load delivery');
        navigate('/staff/delivery-management');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <CircularProgress />;

  const handleChange = (field) => (e) => {
    setDelivery(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await http.put(`/api/staff/delivery/${id}`, {
        status: delivery.status,
        deliveryDate: delivery.deliveryDate,
        assignedTo: delivery.assignedTo,
        location: delivery.location,
        description: delivery.description,
        timing: delivery.timing,
        deliveryProvider: delivery.deliveryProvider,
        phone: delivery.phone,
      });
      alert('Delivery updated successfully!');
      navigate('/staff/delivery-management');
    } catch (err) {
      console.error('Failed to save delivery', err);
      alert('Failed to save delivery');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box maxWidth="600px" mx="auto" p={3}>
      <Typography variant="h4" gutterBottom>Edit Delivery</Typography>

      <TextField
        label="PO Number"
        value={delivery.poNumber || ''}
        fullWidth
        margin="normal"
        disabled
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Status</InputLabel>
        <Select
          value={delivery.status || 'Pending'}
          label="Status"
          onChange={handleChange('status')}
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Delivered">Delivered</MenuItem>
          <MenuItem value="Cancelled">Cancelled</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Delivery Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={delivery.deliveryDate || ''}
        onChange={handleChange('deliveryDate')}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Assigned To"
        value={delivery.assignedTo || ''}
        onChange={handleChange('assignedTo')}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Location"
        value={delivery.location || ''}
        onChange={handleChange('location')}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Description"
        multiline
        rows={3}
        value={delivery.description || ''}
        onChange={handleChange('description')}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Timing"
        type="time"
        InputLabelProps={{ shrink: true }}
        value={delivery.timing || ''}
        onChange={handleChange('timing')}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Delivery Provider"
        value={delivery.deliveryProvider || ''}
        fullWidth
        margin="normal"
        disabled
      />

      <TextField
        label="Phone"
        value={delivery.phone || ''}
        fullWidth
        margin="normal"
        onChange={handleChange('phone')}
      />

      <Box mt={3} display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={() => navigate('/staff/delivery-management')}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
}

export default EditDelivery;
