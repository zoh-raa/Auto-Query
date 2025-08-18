import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { http } from '../https';

const StaffEditRFQPage = () => {
  const { id } = useParams();
  const [rfq, setRfq] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const fetchRFQ = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await http.get(`/rfq/${id}`, {
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      setRfq(res.data);
      setRemarks(res.data.remarks || '');
      setStatus(res.data.status || '');
    } catch (err) {
      console.error('Failed to load RFQ', err);
    }
  };

  useEffect(() => {
    fetchRFQ();
  }, [id]);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await http.put(`/rfq/${id}`, { remarks, status }, {
        headers: { Authorization: `Bearer ${token || ''}` }
      });
      alert('RFQ updated successfully!');
      navigate('/staff/rfqs');
    } catch (err) {
      console.error('Failed to update RFQ', err);
      alert('Failed to update RFQ.');
    }
  };

  const handlePrint = () => {
    if (!rfq) return;
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <h2>RFQ ID: ${rfq.id}</h2>
      <p><strong>Status:</strong> ${rfq.status}</p>
      <p><strong>Created:</strong> ${new Date(rfq.createdAt).toLocaleString()}</p>
      <p><strong>Remarks:</strong> ${rfq.remarks || '-'}</p>
      <p><strong>Customer ID:</strong> ${rfq.customerId || 'N/A'}</p>
      <h3>Items:</h3>
      ${rfq.RFQItems.map(item => `<p>${item.product_name} x ${item.quantity} (Remarks: ${item.remarks || '-'})</p>`).join('')}
      ${rfq.qr_code ? `<img src="${rfq.qr_code}" style="max-width:150px;" />` : ''}
    `;
    const newWin = window.open('', '_blank');
    newWin.document.write('<html><head><title>Print RFQ</title></head><body>');
    newWin.document.write(printContent.innerHTML);
    newWin.document.write('</body></html>');
    newWin.document.close();
    newWin.print();
  };

  if (!rfq) return <Typography>Loading...</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Edit RFQ #{id}</Typography>
      <Paper elevation={3} sx={{ p: 2, maxWidth: 600 }}>
        <Stack spacing={2}>
          {/* Dropdown for Status */}
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Remarks"
            fullWidth
            multiline
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleSubmit}>Save Changes</Button>
            <Button variant="contained" onClick={handlePrint}>Print RFQ</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default StaffEditRFQPage;
