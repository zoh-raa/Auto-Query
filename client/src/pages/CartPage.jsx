import React, { useContext, useState } from 'react';
import { CartContext } from '../contexts/CartContext';
import { Button, Typography, IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';


const CartPage = () => {
  const { cart, increaseQty, decreaseQty, removeFromCart } = useContext(CartContext);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreateRFQ = () => {
    setConfirmOpen(false);
    navigate('/rfq-form');
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Shopping Cart</Typography>
      {cart.length === 0 ? (
        <Typography>Your cart is empty.</Typography>
      ) : (
        cart.map(item => (
          <div key={item.productId} style={{ marginBottom: '1rem' }}>
            <Typography>{item.name}</Typography>
            <Button onClick={() => decreaseQty(item.productId)}>-</Button>
            <span>{item.quantity}</span>
            <Button onClick={() => increaseQty(item.productId)}>+</Button>
            <IconButton onClick={() => removeFromCart(item.productId)}><DeleteIcon /></IconButton>
          </div>
        ))
      )}

      {cart.length > 0 && (
        <Button variant="contained" color="primary" onClick={() => setConfirmOpen(true)}>
          Create RFQ
        </Button>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm RFQ</DialogTitle>
        <DialogContent>
          {cart.map(item => (
            <Typography key={item.productId}>
              {item.name} x {item.quantity}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRFQ} variant="contained">Proceed to RFQ Form</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CartPage;
