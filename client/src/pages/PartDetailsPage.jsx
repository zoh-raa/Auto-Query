import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Divider, Stack } from '@mui/material';
import http from '../https';

const PartDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [part, setPart] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/staff/products/${productId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    })
      .then(res => res.json())
      .then(data => setPart(data))
      .catch(() => setPart(null));
  }, [productId]);

  if (!part) return <Typography>Loading...</Typography>;

  return (
    <Box p={4} minHeight="100vh" bgcolor="#f5f5f5">
      <Button variant="outlined" sx={{ mb: 2 }} onClick={() => navigate('/product')}>
        Back
      </Button>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="flex-start">
        {/* Left: Image/Diagram */}
        <Paper
          sx={{
            p: 2,
            minWidth: 320,
            minHeight: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#fff',
            borderRadius: 3,
            boxShadow: 2,
            flex: 1,
            maxWidth: 500,
          }}
        >
          {part.imageUrl ? (
            <Box
              component="img"
              src={`http://localhost:5000/uploads/${part.imageUrl}`}
              alt={part.productName}
              sx={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 2 }}
            />
          ) : (
            <Typography color="text.secondary">No image available</Typography>
          )}
        </Paper>

        {/* Right: Details */}
        <Paper
          sx={{
            p: 3,
            minWidth: 320,
            maxWidth: 400,
            bgcolor: '#fff',
            borderRadius: 3,
            boxShadow: 2,
            flex: 1,
          }}
        >
          <Box mb={2}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {part.productName}
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Brand: <b>{part.productBrand}</b>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Reference Number: <b>{part.productId}</b>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Catalog Part Number: <b>{part.productNumber}</b>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Description: <b>{part.productDescription}</b>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Quantity: <b>{part.quantity}</b>
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>
            SGD ${Number(part.price).toFixed(2)}
          </Typography>       
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, fontWeight: 700, fontSize: 16 }}
            onClick={() => alert('Added to cart!')}
          >
            Add to Cart
          </Button>
        </Paper>
      </Stack>
    </Box>
  );
};

export default PartDetailsPage;