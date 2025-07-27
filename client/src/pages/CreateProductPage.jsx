// CreateProductPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Paper, Stack, Tabs, Tab
} from '@mui/material';
import StaffSidebar from '../components/StaffSidebar';

const CreateProductPage = () => {
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    productName: '',
    productId: '',
    productNumber: '',
    productDescription: '',
    image: null,
    quantity: ''
  });
  const [parts, setParts] = useState([]);

  // Fetch all parts when Edit/Delete tab is active or after creation
  useEffect(() => {
    if (tab === 1) fetchParts();
  }, [tab]);

  const fetchParts = () => {
    fetch('http://localhost:3001/staff/products', {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    })
      .then(res => res.json())
      .then(data => setParts(data))
      .catch(() => setParts([]));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    fetch('http://localhost:3001/staff/products', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: data
    })
      .then(res => res.json())
      .then(result => {
        alert('Product Created!');
        setFormData({
          productName: '',
          productId: '',
          productNumber: '',
          productDescription: '',
          image: null,
          quantity: ''
        });
        fetchParts(); // Refresh parts list after creation
      })
      .catch(err => alert('Failed to create product'));
  };

  // Edit/Delete Parts Tab
  const EditDeleteParts = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Edit/Delete Parts</Typography>
      {parts.length === 0 ? (
        <Typography color="text.secondary">No parts found.</Typography>
      ) : (
        <Box>
          {parts.map(part => (
            <Paper key={part.productId} sx={{ p: 2, mb: 2 }}>
              <Typography fontWeight="bold">{part.productName}</Typography>
              <Typography variant="body2">Ref: {part.productId} | Number: {part.productNumber}</Typography>
              <Typography variant="body2">Qty: {part.quantity}</Typography>
              <Typography variant="body2">{part.productDescription}</Typography>
              {/* Add edit/delete buttons here if needed */}
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );

  return (
    <Box display="flex" minHeight="100vh" bgcolor="#f5f5f5">
      <StaffSidebar />
      <Box flexGrow={1} p={4} display="flex" justifyContent="center" alignItems="flex-start">
        <Paper
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 950,
            borderRadius: 4,
            boxShadow: 3,
            minHeight: 600,
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ mb: 4 }}
            TabIndicatorProps={{ sx: { height: 3, bgcolor: 'primary.main' } }}
          >
            <Tab label="Add parts" sx={{ fontWeight: 100, fontSize: 15 }} />
            <Tab label="Edit/Delete parts" sx={{ fontWeight: 100, fontSize: 15 }} />
          </Tabs>
          {tab === 0 && (
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Box flex={1}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Part Name:
                    </Typography>
                    <TextField
                      name="productName"
                      fullWidth
                      onChange={handleChange}
                      required
                    />
                  </Box>
                  <Box sx={{ minWidth: 220 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Reference Number:
                    </Typography>
                    <TextField
                      name="productId"
                      fullWidth
                      onChange={e => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, '');
                        handleChange({ target: { name: 'productId', value } });
                      }}
                      value={formData.productId}
                      required
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Catalog Part Number:
                    </Typography>
                    <TextField
                      name="productNumber"
                      fullWidth
                      onChange={handleChange}
                      required
                    />
                  </Box>
                </Stack>
                <Button variant="outlined" sx={{ width: 200, alignSelf: 'flex-start' }} disabled>
                  Obtain product info
                </Button>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Part Description:
                  </Typography>
                  <TextField
                    name="productDescription"
                    multiline
                    rows={4}
                    fullWidth
                    onChange={handleChange}
                    required
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Part Image/Diagram:
                  </Typography>
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: 'block', marginBottom: 8 }}
                  />
                </Box>
                <Stack direction="row" spacing={2} alignItems="flex-end">
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Product Quantity:
                    </Typography>
                    <TextField
                      name="quantity"
                      type="number"
                      sx={{ width: 160 }}
                      onChange={e => {
                        // Prevent negative values
                        const value = e.target.value;
                        handleChange({
                          target: {
                            name: 'quantity',
                            value: value === '' ? '' : Math.max(0, Number(value))
                          }
                        });
                      }}
                      value={formData.quantity}
                      required
                      inputProps={{ min: 0 }}
                    />
                  </Box>
                  <Box sx={{ pb: 0.5 }}>
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{
                        width: 140,
                        bgcolor: 'success.main',
                        color: 'black',
                        fontWeight: 700,
                        fontSize: 18,
                        '&:hover': { bgcolor: 'success.dark' }
                      }}
                    >
                      Upload
                    </Button>
                  </Box>
                </Stack>
              </Stack>
            </form>
          )}
          {tab === 1 && <EditDeleteParts />}
        </Paper>
      </Box>
    </Box>
  );
};

export default CreateProductPage;
