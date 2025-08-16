import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import http from '../https';

const RFQResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // RFQ details should be passed via navigation state from RFQFormPage on submit
  const rfq = location.state?.rfq;

  if (!rfq) {
    return <Typography>No RFQ data to display.</Typography>;
  }

  const handlePrintRFQ = () => {
    window.print();
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', 'Print QR');
    printWindow.document.write(`<img src="${rfq.qr_code}" alt="QR Code" />`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

 const getStatusColor = (status) => {
  if (!status) return 'grey'; // fallback if status is undefined/null

console.log('Status received:', status);

  switch (status.toLowerCase()) {
    case 'payment completed': return 'green';
    case 'delivery in process': return 'yellow';
    case 'payment not done': return 'grey';
    case 'under review': return 'blue';
    default: return 'grey';
  }
};


  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>RFQ Submission Result</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography><strong>RFQ ID:</strong> {rfq.id}</Typography>
        <Typography><strong>Status:</strong> <span style={{ color: getStatusColor(rfq.status) }}>●</span> {rfq.status}</Typography>
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
          <Box mt={3} textAlign="center">
            <img src={rfq.qr_code} alt="QR Code" style={{ maxWidth: 200 }} />
          </Box>
        )}
      </Paper>

      <Box display="flex" gap={2}>
        <Button variant="contained" onClick={handlePrintRFQ}>Print RFQ</Button>
        <Button variant="contained" onClick={handlePrintQR}>Print QR</Button>
        <Button variant="outlined" onClick={() => navigate('/my-rfqs')}>View My RFQs</Button>
        <Button variant="contained" color="secondary" onClick={() => navigate('/select-delivery', { state: { rfq } })}>
          Select Delivery
        </Button>

      </Box>
    </Box>
  );
};

export default RFQResultPage;
