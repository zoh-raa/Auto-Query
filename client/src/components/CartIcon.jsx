import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { Badge, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router';

const CartIcon = () => {
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <IconButton onClick={() => navigate('/cart')} color="inherit">
      <Badge badgeContent={cart.reduce((acc, item) => acc + item.quantity, 0)} color="error">
        <ShoppingCartIcon />
      </Badge>
    </IconButton>
  );
};

export default CartIcon;
