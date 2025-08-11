import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Stack,
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
  const [loadingRfqs, setLoadingRfqs] = useState(true);
  const [viewingRFQ, setViewingRFQ] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/staff/login');
      } else if (user.role !== 'staff') {
        navigate('/');
      }
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user && user.role === 'staff') {
      axios
        .get('/rfq/all')
        .then((res) => setRfqs(res.data))
        .catch((err) => console.error('Failed to fetch RFQs:', err))
        .finally(() => setLoadingRfqs(false));
    }
  }, [user]);

  const getStatusColor = (status) => {
    if (!status) return 'grey';
    switch (status.toLowerCase()) {
      case 'payment completed':
        return 'green';
      case 'delivery in process':
        return 'orange';
      case 'payment not done':
        return 'grey';
      case 'under review':
        return 'blue';
      default:
        return 'grey';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this RFQ?')) return;
    try {
      await axios.delete(`/rfq/${id}`);
      setRfqs((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert('Failed to delete RFQ.');
    }
  };

  const handleCloseModal = () => {
    setViewingRFQ(null);
  };

  if (loading || loadingRfqs) {
    return (
      <Box p={3} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  if (rfqs.length === 0) {
    return (
      <Box p={3}>
        <Typography>No RFQs found.</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        All RFQs (Staff View)
      </Typography>

      {rfqs.map((rfq) => (
        <Paper key={rfq.id} sx={{ p: 2, mb: 3 }}>
          <Typography>
            <strong>RFQ ID:</strong> {rfq.id}
          </Typography>
          <Typography>
            <strong>Status:</strong>{' '}
            <span style={{ color: getStatusColor(rfq.status) }}>●</span> {rfq.status}
          </Typography>
          <Typography>
            <strong>Created:</strong> {new Date(rfq.createdAt).toLocaleString()}
          </Typography>
          <Typography>
            <strong>Remarks:</strong> {rfq.remarks || '-'}
          </Typography>
          <Typography>
            <strong>Customer ID:</strong> {rfq.customerId || 'N/A'}
          </Typography>

          <Box mt={2}>
            <Typography variant="h6">Items</Typography>
            {rfq.RFQItems &&
              rfq.RFQItems.map((item, i) => (
                <Box key={i} sx={{ borderBottom: '1px solid #ccc', py: 1 }}>
                  <Typography>
                    {item.product_name} x {item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    Remarks: {item.remarks || '-'}
                  </Typography>
                </Box>
              ))}
          </Box>

          {rfq.qr_code && (
            <Box mt={2} textAlign="center">
              <img
                src={rfq.qr_code}
                alt="QR Code"
                style={{ maxWidth: 150, cursor: 'pointer' }}
                onClick={() => window.open(rfq.qr_code, '_blank')}
              />
            </Box>
          )}

          <Stack mt={2} direction="row" spacing={2}>
            <Button variant="contained" onClick={() => setViewingRFQ(rfq)}>
              View
            </Button>
            <Button variant="contained" onClick={() => window.print()}>
              Print
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/staff/rfqs/edit/${rfq.id}`)}
            >
              Edit
            </Button>
            <Button variant="outlined" color="error" onClick={() => handleDelete(rfq.id)}>
              Delete
            </Button>
          </Stack>
        </Paper>
      ))}

      {/* Modal for viewing RFQ */}
      <Dialog open={Boolean(viewingRFQ)} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>RFQ Details (ID: {viewingRFQ?.id})</DialogTitle>
        <DialogContent dividers>
          {viewingRFQ && (
            <>
              <Typography>
                <strong>Status:</strong> {viewingRFQ.status}
              </Typography>
              <Typography>
                <strong>Created:</strong>{' '}
                {new Date(viewingRFQ.createdAt).toLocaleString()}
              </Typography>
              <Typography>
                <strong>Remarks:</strong> {viewingRFQ.remarks || '-'}
              </Typography>
              <Typography>
                <strong>Customer ID:</strong> {viewingRFQ.customerId || 'N/A'}
              </Typography>
              <Box mt={2}>
                <Typography variant="h6">Items</Typography>
                {viewingRFQ.RFQItems?.map((item, i) => (
                  <Box key={i} sx={{ borderBottom: '1px solid #ccc', py: 1 }}>
                    <Typography>
                      {item.product_name} x {item.quantity}
                    </Typography>
                    <Typography variant="body2">
                      Remarks: {item.remarks || '-'}
                    </Typography>
                  </Box>
                ))}
              </Box>
              {viewingRFQ.qr_code && (
                <Box mt={2} textAlign="center">
                  <img
                    src={viewingRFQ.qr_code}
                    alt="QR Code"
                    style={{ maxWidth: 150 }}
                  />
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffRFQPage;
