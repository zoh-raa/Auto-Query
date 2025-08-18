import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  TextField,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';
import { http } from '../https';

const MyRFQsPage = () => {
  const { user, loading } = useContext(UserContext);
  const [rfqs, setRfqs] = useState([]);
  const [filteredRfqs, setFilteredRfqs] = useState([]);
  const [loadingRfqs, setLoadingRfqs] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);

  // Fetch RFQs
  useEffect(() => {
    if (!user) return;

    const fetchRfqs = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await http.get('/rfq/my', {
          headers: { Authorization: `Bearer ${token || ''}` }
        });
        const data = Array.isArray(res.data) ? res.data : [];
        setRfqs(data);
        setFilteredRfqs(data);
      } catch (err) {
        console.error(err.response?.data || err.message);
        setRfqs([]);
        setFilteredRfqs([]);
      } finally {
        setLoadingRfqs(false);
      }
    };

    fetchRfqs();
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

  // Keyword filter
  const handleFilter = () => {
    if (!query) return setFilteredRfqs(rfqs);
    const filtered = rfqs.filter(rfq =>
      rfq.RFQItems?.some(item =>
        item.product_name.toLowerCase().includes(query.toLowerCase())
      ) || (rfq.remarks && rfq.remarks.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredRfqs(filtered);
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
      console.error(err.response?.data || err.message);
      alert('Failed to delete RFQ.');
    }
  };

  const handlePrint = (rfq) => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <h2>RFQ ID: ${rfq.id}</h2>
      <p><strong>Status:</strong> ${rfq.status}</p>
      <p><strong>Created:</strong> ${new Date(rfq.createdAt).toLocaleString()}</p>
      <p><strong>Remarks:</strong> ${rfq.remarks || '-'}</p>
      <h3>Items:</h3>
      ${rfq.RFQItems?.map(item =>
        `<p>${item.product_name} x ${item.quantity} (Remarks: ${item.remarks || '-'})</p>`).join('')}
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
    <Box p={3} minHeight="100vh" bgcolor="#f9f9f9">
      <Typography variant="h4" gutterBottom align="center">
        My RFQs
      </Typography>

      {/* Filter Input */}
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          label="Search RFQs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button variant="contained" onClick={handleFilter}>Filter</Button>
      </Stack>

      {filteredRfqs.length === 0 ? (
        <Typography>No RFQs found.</Typography>
      ) : filteredRfqs.map((rfq) => (
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
            <Button variant="contained" onClick={() => handlePrint(rfq)}>Print RFQ</Button>
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
