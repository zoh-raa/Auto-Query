// pages/Cart.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, TextField
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import http from "../http";
import UserContext from "../contexts/UserContext";
import { toast } from "react-toastify";

function Cart() {
  const { user } = useContext(UserContext);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (user) {
      http.get("/cart").then((res) => {
        setCartItems(res.data);
      });
    }
  }, [user]);

  const handleQuantityChange = (index, newQty) => {
    const updatedCart = [...cartItems];
    updatedCart[index].quantity = newQty;
    setCartItems(updatedCart);
  };

  const removeItem = (id) => {
    http.delete(`/cart/${id}`).then(() => {
      setCartItems(cartItems.filter((item) => item._id !== id));
      toast.success("Item removed from cart");
    });
  };

  const submitRFQ = () => {
    const rfqData = {
      items: cartItems.map(({ productId, quantity, remarks }) => ({
        productId,
        quantity,
        remarks
      }))
    };

    http.post("/rfq", rfqData).then(() => {
      toast.success("RFQ submitted successfully");
      setCartItems([]);
    });
  };

  if (!user) {
    return (
      <Typography variant="h6" sx={{ mt: 2 }}>
        Please login to view your cart.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ my: 2 }}>Your Cart</Typography>
      {cartItems.length === 0 ? (
        <Typography>No items in cart</Typography>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Part Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Remove</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cartItems.map((item, index) => (
                <TableRow key={item._id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      inputProps={{ min: 1 }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={item.remarks || ""}
                      onChange={(e) => {
                        const updatedCart = [...cartItems];
                        updatedCart[index].remarks = e.target.value;
                        setCartItems(updatedCart);
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => removeItem(item._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={submitRFQ}>
              Submit RFQ
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

export default Cart;
