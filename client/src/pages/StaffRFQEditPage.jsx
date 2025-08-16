import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { http } from '../https';

const StaffEditRFQPage = () => {
  const { id } = useParams();
  const [rfq, setRfq] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  // Fetch RFQ details
  const fetchRFQ = async () => {
    try {
      const token = localStorage.getItem('accessToken'); // get JWT
      const res = await http.get(`/rfq/${id}`, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      setRfq(res.data);
      setRemarks(res.data.remarks || '');
      setStatus(res.data.status || '');
    } catch (err) {
      console.error('Failed to load RFQ', err);
    }
  };

  // Call fetchRFQ on mount
  useEffect(() => {
    fetchRFQ();
  }, [id]);

  // Submit updated RFQ
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await http.put(
        `/rfq/${id}`,
        { remarks, status },
        { headers: { Authorization: `Bearer ${token || ''}` } }
      );
      alert('RFQ updated successfully!');
      navigate('/staff/rfqs');
    } catch (err) {
      console.error('Failed to update RFQ', err);
      alert('Failed to update RFQ.');
    }
  };

  if (!rfq) return <Typography>Loading...</Typography>;



  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Edit RFQ #{id}
      </Typography>
      <Paper elevation={3} sx={{ p: 2, maxWidth: 600 }}>
        <Stack spacing={2}>
          <TextField
            label="Status"
            fullWidth
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <TextField
            label="Remarks"
            fullWidth
            multiline
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
          <Button variant="contained" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default StaffEditRFQPage;