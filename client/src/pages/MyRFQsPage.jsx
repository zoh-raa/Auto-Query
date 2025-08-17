import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';
import axios from 'axios';

const MyRFQsPage = () => {
  const { user, loading } = useContext(UserContext);
  const [rfqs, setRfqs] = useState([]);
  const [loadingRfqs, setLoadingRfqs] = useState(true);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  // Fetch RFQs with JWT token
  useEffect(() => {
    const fetchRFQs = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('accessToken'); // get JWT
        const res = await axios.get('http://localhost:3001/rfq/my', {
          headers: {
            Authorization: `Bearer ${token || ''}`
          }
        });
        setRfqs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching RFQs:', err.response?.data || err.message);
        setRfqs([]);
      } finally {
        setLoadingRfqs(false);
      }
    };

    fetchRFQs();
  }, [user]);

  const getStatusColor = (status) => {
    if (!status) return 'grey';
    switch (status.toLowerCase()) {
      case 'payment completed': return 'green';
      case 'delivery in process': return 'orange';
      case 'payment not done': return 'red';
      case 'under review': return 'blue';
      default: return 'grey';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this RFQ?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:3001/rfq/${id}`, {
        headers: { Authorization: `Bearer ${token || ''}` }
      });

      // remove from state
      setRfqs((prevRfqs) => prevRfqs.filter((r) => r.id !== id));
      alert('RFQ deleted successfully!');
    } catch (err) {
      console.error('Failed to delete RFQ', err.response?.data || err.message);
      alert('Failed to delete RFQ.');
    }
  };

  if (loading || loadingRfqs) return <Typography>Loading...</Typography>;
  if (!Array.isArray(rfqs) || rfqs.length === 0) return <Typography>No RFQs found.</Typography>;

  return (
    <Box p={3} minHeight="100vh" bgcolor="#f9f9f9">
      <Typography variant="h4" gutterBottom align="center">
        My RFQs
      </Typography>

      {rfqs.map((rfq) => (
        <Paper key={rfq.id} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6">RFQ Number: {rfq.rfq_number || rfq.id}</Typography>
          <Typography>
            <strong>Status:</strong>{" "}
            <span style={{ color: getStatusColor(rfq.status) }}>●</span> {rfq.status}
          </Typography>
          <Typography><strong>Date Created:</strong> {new Date(rfq.createdAt).toLocaleString()}</Typography>
          <Typography><strong>Remarks:</strong> {rfq.remarks || '-'}</Typography>

          <Box mt={2}>
            <Typography variant="h6">Items</Typography>
            {rfq.RFQItems && rfq.RFQItems.map((item, i) => (
              <Box key={i} sx={{ borderBottom: '1px solid #ccc', py: 1 }}>
                <Typography>{item.product_name} x {item.quantity}</Typography>
                <Typography variant="body2">Remarks: {item.remarks || '-'}</Typography>
              </Box>
            ))}
          </Box>

          {rfq.qr_code && (
            <Box mt={2} textAlign="center">
              <img src={rfq.qr_code} alt="QR Code" style={{ maxWidth: 150 }} />
            </Box>
          )}

          <Box mt={2} display="flex" gap={2}>
            <Button variant="contained" onClick={() => window.print()}>Print RFQ</Button>
            <Button variant="outlined" color="error" onClick={() => handleDelete(rfq.id)}>Delete RFQ</Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/select-delivery', { state: { rfq } })}
            >
              Select Delivery
            </Button>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default MyRFQsPage;
