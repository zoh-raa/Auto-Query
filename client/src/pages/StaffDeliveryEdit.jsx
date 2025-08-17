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

  // AI states
  const [aiSummary, setAiSummary] = useState('');
  const [aiDelay, setAiDelay] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

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

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress />
    </Box>
  );

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

  // Fetch AI summary and delay risk
  const fetchAiSummary = async () => {
    setLoadingAi(true);
    try {
      const summaryRes = await http.get(`/api/staff/${id}/ai-summary`);
      setAiSummary(summaryRes.data.summary || '');

      const delayRes = await http.get(`/api/staff/${id}/ai-delay`);
      setAiDelay(delayRes.data || null);
    } catch (err) {
      console.error('AI fetch error', err);
      alert('Failed to fetch AI summary');
    } finally {
      setLoadingAi(false);
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

      {/* Save / Cancel Buttons */}
      <Box mt={3} display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={() => navigate('/staff/delivery-management')}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {/* AI Summary Button */}
      <Box mt={2} display="flex" gap={2}>
        <Button
          variant="outlined"
          onClick={fetchAiSummary}
          disabled={loadingAi}
        >
          {loadingAi ? 'Generating AI...' : 'Generate AI Summary'}
        </Button>
      </Box>

      {/* AI Summary Display */}
      {aiSummary && (
        <Box mt={2} p={2} border="1px solid #ccc" borderRadius={2} bgcolor="#f9f9f9">
          <Typography variant="h6">AI Summary:</Typography>
          <Typography>{aiSummary}</Typography>
        </Box>
      )}

      {/* AI Delay Risk Display */}
      {aiDelay && (
        <Box mt={2} p={2} border="1px solid #ccc" borderRadius={2} bgcolor="#fff3e0">
          <Typography variant="h6">Delay Risk:</Typography>
          <Typography>Risk Level: {aiDelay.riskLevel}</Typography>
          <Typography>Score: {aiDelay.riskScore}</Typography>
          <Typography>
            Signals: {aiDelay.signals.overdue && 'Overdue, '}
                     {aiDelay.signals.missingTiming && 'Missing Timing, '}
                     {aiDelay.signals.largeOrder && 'Large Order'}
          </Typography>
        </Box>
      )}

    </Box>
  );
}

export default EditDelivery;
