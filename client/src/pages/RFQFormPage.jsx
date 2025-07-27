import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import toast from 'react-hot-toast';
import axios from '../https';
import { CartContext } from '../contexts/CartContext';
import UserContext from '../contexts/UserContext';

const RFQFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useContext(CartContext);
  const { user, loading } = useContext(UserContext);

  const fromNavbar = location.state?.fromNavbar === true;
  const [items, setItems] = useState(fromNavbar ? [] : cart);
  const [manualItem, setManualItem] = useState({
    productId: '',
    name: '',
    quantity: 1,
    remarks: '',
  });

  const [comments, setComments] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowLoginPrompt(true);
    }
  }, [loading, user]);

  if (loading) return null;

  const handleAddManualItem = () => {
    if (!manualItem.productId || !manualItem.name || manualItem.quantity <= 0) {
      toast.error("Please fill in Product ID, Name and a valid Quantity.");
      return;
    }
    setItems([...items, manualItem]);
    setManualItem({ productId: '', name: '', quantity: 1, remarks: '' });
  };

  const handleQuantityChange = (index, value) => {
    const qty = parseInt(value);
    if (isNaN(qty) || qty <= 0) return;
    const newItems = [...items];
    newItems[index].quantity = qty;
    setItems(newItems);
  };

  const handleRemarksChange = (index, value) => {
    const newItems = [...items];
    newItems[index].remarks = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Add at least one item before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: user._id,
        items: items.map(({ name, quantity, remarks }) => ({
          product_name: name,
          quantity,
          remarks: remarks || '',
        })),
        comments,
      };

      const res = await axios.post('/rfq', payload);
      if (res.data.qr_code) setQrCode(res.data.qr_code);

      toast.success("RFQ submitted successfully!");
      clearCart();

      navigate('/rfq-result', { state: { rfq: res.data } });
    } catch (error) {
      console.error(error);
      console.error("AxiosError", error.response?.data || error.message);
      toast.error("Failed to submit RFQ.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p={2}>
      {/* --- LOGIN PROMPT DIALOG --- */}
      <Dialog open={showLoginPrompt}>
        <DialogTitle>Login to create RFQ</DialogTitle>
        <DialogContent>
          <Typography>You must be logged in to submit a Request for Quotation.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoginPrompt(false)} color="secondary">
            Stay on this page
          </Button>
          <Button onClick={() => navigate('/login')} variant="contained" color="primary">
            Go to login
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- SHOW FORM ONLY IF LOGGED IN --- */}
      {user && (
        <>
          <Typography variant="h4" gutterBottom>
            Create Request for Quotation
          </Typography>

          <Typography><strong>Name:</strong> {user.name}</Typography>
          <Typography><strong>Email:</strong> {user.email}</Typography>
          <Typography><strong>Phone:</strong> {user.phone || "N/A"}</Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6">Items</Typography>
          {items.length === 0 ? (
            <Typography>No items added yet.</Typography>
          ) : (
            items.map((item, i) => (
              <Box key={i} sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, mb: 2 }}>
                <Typography fontWeight="bold">{item.name} (Product ID: {item.productId})</Typography>
                <TextField
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(i, e.target.value)}
                  fullWidth
                  margin="dense"
                  inputProps={{ min: 1 }}
                />
                <TextField
                  label="Remarks"
                  value={item.remarks || ''}
                  onChange={(e) => handleRemarksChange(i, e.target.value)}
                  fullWidth
                  margin="dense"
                  multiline
                  rows={2}
                />
                <Button variant="outlined" color="error" onClick={() => handleRemoveItem(i)} sx={{ mt: 1 }}>
                  Remove Item
                </Button>
              </Box>
            ))
          )}

          {fromNavbar && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Add Item Manually</Typography>
              <TextField
                label="Product ID"
                fullWidth
                margin="dense"
                value={manualItem.productId}
                onChange={(e) => setManualItem({ ...manualItem, productId: e.target.value })}
              />
              <TextField
                label="Name"
                fullWidth
                margin="dense"
                value={manualItem.name}
                onChange={(e) => setManualItem({ ...manualItem, name: e.target.value })}
              />
              <TextField
                label="Quantity"
                type="number"
                fullWidth
                margin="dense"
                value={manualItem.quantity}
                onChange={(e) => setManualItem({ ...manualItem, quantity: parseInt(e.target.value) || 1 })}
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Remarks"
                fullWidth
                margin="dense"
                value={manualItem.remarks}
                onChange={(e) => setManualItem({ ...manualItem, remarks: e.target.value })}
              />
              <Button variant="outlined" onClick={handleAddManualItem} sx={{ mt: 1 }}>
                Add to RFQ
              </Button>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          <TextField
            label="Additional Comments"
            fullWidth
            multiline
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />

          {qrCode && (
            <Box mt={4} textAlign="center">
              <Typography variant="subtitle1" gutterBottom>
                Scan this QR at store:
              </Typography>
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="QR Code"
                style={{ maxWidth: 150 }}
              />
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit RFQ"}
          </Button>
        </>
      )}
    </Box>
  );
};

export default RFQFormPage;
