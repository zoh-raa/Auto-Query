// src/pages/AdminDeliveryManager.jsx
import React, { useEffect, useState, useContext } from 'react';
// Import Material-UI components for layout and styling
import { Typography, Box, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
// Import UserContext to get current logged-in user info
import UserContext from '../contexts/UserContext';
// Import your axios/http instance setup to make API requests
import http from '../http';

function AdminDeliveryManager() {
  // Access user object from context to check permissions
  const { user } = useContext(UserContext);
  // State to hold list of deliveries fetched from backend
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    // On component mount, fetch all deliveries from admin API endpoint
    http.get('/admin/deliveries')
      .then(res => setDeliveries(res.data))   // Save received deliveries data to state
      .catch(err => console.error('Error fetching deliveries', err)); // Log any errors
  }, []); // Empty dependency array means this runs once after initial render

  // If user is not logged in or does not have admin role, deny access to this page
  if (!user || user.role !== 'admin') {
    return (
      <Typography>
        You do not have permission to view this page.
      </Typography>
    );
  }

  return (
    // Main container with some margin at top
    <Box sx={{ mt: 4 }}>
      {/* Page heading */}
      <Typography variant="h4" gutterBottom>
        Admin Delivery Management
      </Typography>

      {/* Table displaying list of deliveries */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Delivery ID</TableCell>
            <TableCell>Recipient</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {/* Iterate over deliveries state to render each delivery row */}
          {deliveries.map(delivery => (
            <TableRow key={delivery.id}>
              {/* Delivery details */}
              <TableCell>{delivery.id}</TableCell>
              <TableCell>{delivery.recipientName}</TableCell>
              <TableCell>{delivery.address}</TableCell>
              <TableCell>{delivery.status}</TableCell>
              <TableCell>
                {/* Placeholder buttons for future Edit and Delete functionality */}
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default AdminDeliveryManager;
