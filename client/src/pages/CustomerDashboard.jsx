import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';
import http from '../https';

import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Paper
} from '@mui/material';

const CustomerDashboard = () => {
  const { user, setUser } = useContext(UserContext);
  const [editableUser, setEditableUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

useEffect(() => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    navigate('/login');
    return;
  }

  http.get('/customer/auth', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      setUser(res.data.user);
      setEditableUser(res.data.user);
    })
    .catch(err => {
      console.error("❌ Auth error:", err?.response?.data || err.message);
      navigate('/login');
    })
    .finally(() => {
      setLoading(false);
    });
}, []);

  const handleUpdate = async () => {
    try {
      await http.patch(`/customer/${user.id}`, editableUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });


      const res = await http.get('/customer/auth', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });


      if (res.data?.user) {
        setUser(res.data.user);
        setEditableUser(res.data.user);
      }

      setEditMode(false);
      setError("");
      alert('Profile updated successfully!');
    } catch (err) {
      console.error("❌ Update failed:", err?.response?.data || err.message);
      setError("Update failed. Please try again.");
    }
  };

  const handleCancel = () => {
    setEditableUser({ ...user });
    setEditMode(false);
    setError("");
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login');
  };

  if (loading || !editableUser) return <Box p={4}><CircularProgress /></Box>;

  return (
    <Box display="flex" minHeight="100vh">
      {/* Sidebar */}
      <Box width="240px" bgcolor="#f5f5f5" p={3}>
      <Typography fontWeight="bold" mb={2}>{user.name}</Typography>
        <Button
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          onClick={() => navigate('/my-rfqs')}>
           MY RFQS
        </Button>
        <Button fullWidth variant="contained" sx={{ mb: 2 }}>ACCOUNT INFO</Button>
        <Button fullWidth color="error" onClick={handleLogout}>LOGOUT</Button>
      </Box>

      {/* Main Panel */}
      <Box flexGrow={1} p={4}>
        <Typography variant="h5" gutterBottom>Account Info</Typography>
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            fullWidth label="Full name" margin="normal"
            value={editableUser.name}
            onChange={e => setEditableUser({ ...editableUser, name: e.target.value })}
            InputProps={{ readOnly: !editMode }}
          />
          <TextField
            fullWidth label="Phone number" margin="normal"
            value={editableUser.phone || ''}
            onChange={e => setEditableUser({ ...editableUser, phone: e.target.value })}
            InputProps={{ readOnly: !editMode }}
          />
          <TextField
            fullWidth label="Email" margin="normal"
            value={editableUser.email}
            InputProps={{ readOnly: true }}
          />
          <TextField
            fullWidth label="Password" margin="normal"
            type="password"
            value="**************"
            InputProps={{ readOnly: true }}
          />
          <Button variant="outlined" color="success" sx={{ mt: 2, mb: 3 }}>
            CHANGE PASSWORD
          </Button>

          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>Delivery Address</Typography>
          <TextField
            fullWidth label="Delivery Address" margin="normal"
            value={editableUser.address || ''}
            onChange={e => setEditableUser({ ...editableUser, address: e.target.value })}
            InputProps={{ readOnly: !editMode }}
          />

          {!editMode ? (
            <Button variant="outlined" onClick={() => setEditMode(true)} sx={{ mt: 2 }}>
              Edit
            </Button>
          ) : (
            <Stack direction="row" spacing={2} mt={2}>
              <Button variant="contained" onClick={handleUpdate}>Save</Button>
              <Button variant="outlined" color="secondary" onClick={handleCancel}>Cancel</Button>
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default CustomerDashboard;
