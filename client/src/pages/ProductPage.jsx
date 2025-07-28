import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProductPage = () => {
  const navigate = useNavigate();
  const [parts, setParts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/staff/products', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setParts(data);
        } else {
          console.error('Invalid response from server:', data);
          setParts([]);
        }
      })

      .catch(() => setParts([]));
  }, []);

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <Box p={4} minHeight="100vh" bgcolor="#f9f9f9">
      <Typography variant="h4" gutterBottom align="center">
        Parts Catalog
      </Typography>

      {parts.length === 0 ? (
        <Typography variant="body1" align="center" paragraph>
          There are currently no parts in stock at the moment. 
          We apologize for the inconvenience.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {parts.map(part => (
            <Grid item xs={12} sm={6} md={4} key={part.productId}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.03)',
                    boxShadow: 8,
                    zIndex: 10,
                  },
                }}
                onClick={() => navigate(`/parts/${part.productId}`)}
                elevation={4}
              >
                {part.imageUrl && (
                  <Box
                    component="img"
                    src={`http://localhost:3001/uploads/${part.imageUrl}`}
                    alt={part.productName}
                    sx={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 2, mb: 2 }}
                  />
                )}
                <Typography variant="h6">{part.productName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  SGD {Number(part.price).toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ProductPage;
