import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';
import { http } from '../https';

const StaffRFQPage = () => {
  const { user, loading } = useContext(UserContext);
  const [rfqs, setRfqs] = useState([]);
  const [filteredRfqs, setFilteredRfqs] = useState([]);
  const [loadingRfqs, setLoadingRfqs] = useState(true);
  const [viewingRFQ, setViewingRFQ] = useState(null);
  const [query, setQuery] = useState('');
  const [topProducts, setTopProducts] = useState([]);
  const navigate = useNavigate();

  // Redirect if not staff
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/staff/login');
      } else if (user.role !== 'staff') {
        navigate('/');
      }
    }
  }, [loading, user, navigate]);

  // Fetch RFQs and Top Products
  useEffect(() => {
    const fetchRfqs = async () => {
      if (!user || user.role !== 'staff') return;

      try {
        const token = localStorage.getItem('accessToken');
        const res = await http.get('/rfq/all', {
          headers: { Authorization: `Bearer ${token || ''}` }
        });
        const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data.rfqs) ? res.data.rfqs : []);
        setRfqs(data);
        setFilteredRfqs(data);
      } catch (err) {
        console.error('Failed to fetch RFQs:', err.response?.data || err.message);
      } finally {
        setLoadingRfqs(false);
      }
    };

    const fetchTopProducts = async () => {
      try {
        const res = await http.get('/staff/top-products');
        setTopProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch top products', err);
      }
    };

    fetchRfqs();
    fetchTopProducts();
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
      await http.delete(`/rfq/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setRfqs(prev => prev.filter(r => r.id !== id));
      setFilteredRfqs(prev => prev.filter(r => r.id !== id));
      alert('RFQ deleted successfully!');
    } catch (err) {
      console.error('Failed to delete RFQ', err.response?.data || err.message);
      alert('Failed to delete RFQ.');
    }
  };

  const handleFilter = async () => {
    if (!query) return setFilteredRfqs(rfqs);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await http.post('/staff/query', { query }, { headers: { Authorization: `Bearer ${token}` } });
      setFilteredRfqs(res.data);
    } catch (err) {
      console.error('Filter failed', err);
    }
  };

  const handleFuzzy = async () => {
    if (!query) return setFilteredRfqs(rfqs);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await http.post('/staff/fuzzy', { query }, { headers: { Authorization: `Bearer ${token}` } });
      setFilteredRfqs(res.data);
    } catch (err) {
      console.error('Fuzzy search failed', err);
    }
  };

  const handlePrint = (rfq) => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <h2>RFQ ID: ${rfq.id}</h2>
      <p><strong>Status:</strong> ${rfq.status}</p>
      <p><strong>Created:</strong> ${new Date(rfq.createdAt).toLocaleString()}</p>
      <p><strong>Remarks:</strong> ${rfq.remarks || '-'}</p>
      <p><strong>Customer ID:</strong> ${rfq.customerId || 'N/A'}</p>
      <h3>Items:</h3>
      ${rfq.RFQItems?.map(item => `<p>${item.product_name} x ${item.quantity} (Remarks: ${item.remarks || '-'})</p>`).join('')}
      ${rfq.qr_code ? `<div style="margin-top:10px;text-align:center;"><img src="${rfq.qr_code}" style="max-width:150px;" /></div>` : ''}
    `;
    const newWin = window.open('', '_blank');
    newWin.document.write('<html><head><title>Print RFQ</title></head><body>');
    newWin.document.write(printContent.innerHTML);
    newWin.document.write('</body></html>');
    newWin.document.close();
    newWin.print();
  };

  if (loading || loadingRfqs) return <Box p={3} textAlign="center"><CircularProgress /></Box>;

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>All RFQs (Staff View)</Typography>

      {/* Filter Inputs */}
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          label="Search/Filter RFQs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button variant="contained" onClick={handleFilter}>Keyword Filter</Button>
        <Button variant="outlined" onClick={handleFuzzy}>Fuzzy Search</Button>
      </Stack>

      {/* Top Products */}
      <Box mb={2}>
        <Typography variant="h6">Top Requested Products:</Typography>
        <ul>
          {topProducts.map((p, i) => (
            <li key={i}>{p.product_name} ({p.count})</li>
          ))}
        </ul>
      </Box>

      {/* RFQ List */}
      {filteredRfqs.map(rfq => (
        <Paper key={rfq.id} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6">RFQ ID: {rfq.id}</Typography>
          <Typography>Status: <span style={{ color: getStatusColor(rfq.status) }}>●</span> {rfq.status}</Typography>
          <Typography>Created: {new Date(rfq.createdAt).toLocaleString()}</Typography>
          <Typography>Remarks: {rfq.remarks || '-'}</Typography>
          <Typography>Customer ID: {rfq.customerId || 'N/A'}</Typography>

          <Box mt={1}>
            <Typography variant="subtitle1">Items:</Typography>
            {rfq.RFQItems?.map((item, i) => (
              <Typography key={i}>{item.product_name} x {item.quantity} (Remarks: {item.remarks || '-'})</Typography>
            ))}
          </Box>

          <Stack mt={1} direction="row" spacing={1}>
            <Button variant="contained" onClick={() => setViewingRFQ(rfq)}>View</Button>
            <Button variant="contained" onClick={() => handlePrint(rfq)}>Print</Button>
            <Button variant="outlined" onClick={() => navigate(`/staff/rfqs/edit/${rfq.id}`)}>Edit</Button>
            <Button variant="outlined" color="error" onClick={() => handleDelete(rfq.id)}>Delete</Button>
            <Button variant="contained" onClick={() => navigate('/staff-delivery-management')}>View All Deliveries</Button>
          </Stack>
        </Paper>
      ))}

      {/* Modal */}
      <Dialog open={Boolean(viewingRFQ)} onClose={() => setViewingRFQ(null)} maxWidth="sm" fullWidth>
        <DialogTitle>RFQ Details (ID: {viewingRFQ?.id})</DialogTitle>
        <DialogContent dividers>
          {viewingRFQ && (
            <>
              <Typography>Status: {viewingRFQ.status}</Typography>
              <Typography>Created: {new Date(viewingRFQ.createdAt).toLocaleString()}</Typography>
              <Typography>Remarks: {viewingRFQ.remarks || '-'}</Typography>
              <Typography>Customer ID: {viewingRFQ.customerId || 'N/A'}</Typography>

              <Box mt={2}>
                <Typography variant="h6">Items</Typography>
                {viewingRFQ.RFQItems?.map((item, i) => (
                  <Box key={i} sx={{ borderBottom: '1px solid #ccc', py: 1 }}>
                    <Typography>{item.product_name} x {item.quantity}</Typography>
                    <Typography variant="body2">Remarks: {item.remarks || '-'}</Typography>
                  </Box>
                ))}
              </Box>

              {viewingRFQ.qr_code && (
                <Box mt={2} textAlign="center">
                  <img src={viewingRFQ.qr_code} alt="QR Code" style={{ maxWidth: 150 }} />
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handlePrint(viewingRFQ)}>Print RFQ</Button>
          <Button onClick={() => setViewingRFQ(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffRFQPage;
