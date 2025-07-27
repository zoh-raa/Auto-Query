import React, { useEffect, useState, useContext } from 'react';
import axios from '../https';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';

const MyRFQsPage = () => {
  const { user, loading } = useContext(UserContext);
  const [rfqs, setRfqs] = useState([]);
  const [loadingRfqs, setLoadingRfqs] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) {
      axios.get('/rfq/my')
        .then(res => setRfqs(res.data))
        .catch(err => console.error(err))
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
    if (!window.confirm("Are you sure you want to delete this RFQ?")) return;
    try {
      await axios.delete(`/rfq/${id}`);
      setRfqs(rfqs.filter(r => r.id !== id));
    } catch (err) {
      alert("Failed to delete RFQ.");
    }
  };

  const printSingleRFQ = (rfq) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const content = `
      <html>
        <head>
          <title>Print RFQ ${rfq.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { margin-bottom: 10px; }
            .item { border-bottom: 1px solid #ccc; padding: 5px 0; }
          </style>
        </head>
        <body>
          <h2>RFQ ID: ${rfq.id}</h2>
          <p><strong>Status:</strong> ${rfq.status}</p>
          <p><strong>Date Created:</strong> ${new Date(rfq.createdAt).toLocaleString()}</p>
          <p><strong>Remarks:</strong> ${rfq.remarks || '-'}</p>
          <h3>Items</h3>
          ${rfq.RFQItems.map(item => `
            <div class="item">
              <p>${item.product_name} x ${item.quantity}</p>
              <p>Remarks: ${item.remarks || '-'}</p>
            </div>
          `).join('')}
          ${rfq.qr_code ? `<img src="${rfq.qr_code}" alt="QR Code" style="margin-top:20px;max-width:150px;" />` : ''}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  if (loading || loadingRfqs) return <Typography>Loading...</Typography>;
  if (rfqs.length === 0) return <Typography>No RFQs found.</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>My RFQs</Typography>
      {rfqs.map(rfq => (
        <Paper key={rfq.id} sx={{ p: 2, mb: 3 }}>
          <Typography><strong>RFQ ID:</strong> {rfq.id}</Typography>
          <Typography>
            <strong>Status:</strong> <span style={{ color: getStatusColor(rfq.status) }}>●</span> {rfq.status}
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
            <Button variant="contained" onClick={() => printSingleRFQ(rfq)}>Print RFQ</Button>
            <Button variant="contained" onClick={() => {
              const win = window.open('', '_blank');
              win.document.write(`<img src="${rfq.qr_code}" alt="QR Code" />`);
              win.document.close();
              win.focus();
              win.print();
              win.close();
            }}>Print QR</Button>
            <Button variant="outlined" color="error" onClick={() => handleDelete(rfq.id)}>Delete RFQ</Button>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default MyRFQsPage;
