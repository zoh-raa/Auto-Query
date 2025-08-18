// pages/CartPage.jsx
import React, { useState, useContext } from 'react';
import {
  Box, Button, Typography, IconButton, Dialog, DialogActions,
  DialogContent, DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { http } from '../https';
import { CartContext } from '../contexts/CartContext';

const CartPage = () => {
  const { cart, increaseQty, decreaseQty, removeFromCart, clearCart } = useContext(CartContext);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const saveCart = async () => {
    try {
      await http.post('/cart', { items: cart });
      toast.success('Cart saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save cart.');
    }
  };

  const handleCreateRFQ = () => {
    setConfirmOpen(false);
    navigate('/rfq-form');
  };

  const handleClearCart = () => {
    clearCart();
    saveCart();
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Shopping Cart</Typography>

      {cart.length === 0 ? (
        <Typography>Your cart is empty.</Typography>
      ) : (
        cart.map(item => (
          <Box key={item.productId} display="flex" alignItems="center" mb={2} p={1} border="1px solid #ddd" borderRadius={2}>
            <img
              src={
                item.imageUrl
                  ? item.imageUrl.startsWith('/images/')
                    ? `http://localhost:3001${item.imageUrl}`
                    : `http://localhost:3001/images/${item.imageUrl}`
                  : item.image && (item.image.startsWith('http') || item.image.startsWith('/'))
                    ? item.image
                    : '/images/no-image.png'
              }
              alt={item.name || 'Product'}
              style={{ width: 80, height: 80, objectFit: 'cover', marginRight: 16 }}
            />
            <Box flexGrow={1}>
              <Typography variant="subtitle1">{item.name || 'Unknown Product'}</Typography>
              <Typography variant="body2">Price: ${!isNaN(Number(item.price)) ? Number(item.price).toFixed(2) : '0.00'}</Typography>
              <Typography variant="body2">Remarks: {item.remarks || '-'}</Typography>
              <Typography variant="body2">Subtotal: {!isNaN(Number(item.price)) ? (Number(item.price) * item.quantity).toFixed(2) : '0.00'}</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Button onClick={() => decreaseQty(item.productId)}>-</Button>
              <Typography mx={1}>{item.quantity}</Typography>
              <Button onClick={() => increaseQty(item.productId)}>+</Button>
              <IconButton onClick={() => { removeFromCart(item.productId); saveCart(); }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ))
      )}

      {cart.length > 0 && (
        <Box mt={3} display="flex" flexDirection="column" gap={2}>
          <Typography variant="h6">Total: ${cartTotal.toFixed(2)}</Typography>
          <Box display="flex" gap={2}>
            <Button variant="contained" color="primary" onClick={saveCart}>Save Cart</Button>
            <Button variant="outlined" color="secondary" onClick={handleClearCart}>Clear Cart</Button>
            <Button variant="contained" onClick={() => setConfirmOpen(true)}>Create RFQ</Button>
          </Box>
        </Box>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm RFQ</DialogTitle>
        <DialogContent>
          {cart.map(item => (
            <Typography key={item.productId}>{item.name || 'Product'} x {item.quantity}</Typography>
          ))}
          <Typography variant="subtitle1">Total: ${cartTotal.toFixed(2)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRFQ} variant="contained">Proceed to RFQ Form</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CartPage;
