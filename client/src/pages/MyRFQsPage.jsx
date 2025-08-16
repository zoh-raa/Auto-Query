
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
    if (user) {
      axios.get('/rfq/my')
        .then(res => setRfqs(Array.isArray(res.data) ? res.data : []))
        .catch(err => {
          console.error(err);
          setRfqs([]);
        })
        .finally(() => setLoadingRfqs(false));
    }
  }, [user]);

  const getStatusColor = (status) => {
    if (!status) return 'grey';
    switch (status.toLowerCase()) {
      case 'payment completed': return 'green';
      case 'delivery in process': return 'yellow';
      case 'payment not done': return 'grey';
      case 'under review': return 'blue';
      default: return 'grey';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this RFQ?')) return;
    try {
      await axios.delete(`/rfq/${id}`);
      setRfqs(rfqs.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete RFQ.');
    }
  };

  if (loading || loadingRfqs) return <Typography>Loading...</Typography>;
  if (!Array.isArray(rfqs) || rfqs.length === 0) return <Typography>No RFQs found.</Typography>;

  return (
    <Box p={4} minHeight="100vh" bgcolor="#f9f9f9">
      <Typography variant="h4" gutterBottom align="center">
        My RFQs
      </Typography>
      {rfqs.map((rfq, idx) => (
        <Paper key={rfq.id || idx} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">RFQ Number: {rfq.rfq_number}</Typography>
          <Typography>Status: <span style={{ color: getStatusColor(rfq.status) }}>{rfq.status}</span></Typography>
          <Typography>Remarks: {rfq.remarks}</Typography>
          <Button variant="contained" onClick={() => navigate(`/rfq/${rfq.id}`)} sx={{ mt: 1 }}>View Details</Button>
          <Button variant="outlined" color="error" onClick={() => handleDelete(rfq.id)} sx={{ mt: 1, ml: 2 }}>Delete</Button>
        </Paper>
      ))}
    </Box>
  );
};

export default MyRFQsPage;
