import React, { useEffect, useState, useRef, useContext } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Card, CardContent, Grid, MenuItem, Select, FormControl, InputLabel, TextField
} from '@mui/material';
import { http } from '../https';
import UserContext from '../contexts/UserContext';

const getStatusColor = (status) => {
  switch (status) {
    case 'Delivered': return 'green';
    case 'Pending': return 'orange';
    case 'In Progress': return 'blue';
    case 'Cancelled': return 'red';
    default: return '#555';
  }
};

function StaffDeliveryManagement() {
  const { user } = useContext(UserContext);
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [statusEdit, setStatusEdit] = useState('');
  const [deliveryDateEdit, setDeliveryDateEdit] = useState('');
  const [phoneEdit, setPhoneEdit] = useState('');
  const [saving, setSaving] = useState(false);

  const dialogContentRef = useRef(null);

  useEffect(() => {
    if (user && user.role === 'staff') fetchDeliveries();
  }, [user]);

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token found');
      const res = await http.get('/api/delivery/staff/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeliveries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch deliveries:', err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const token = localStorage.getItem('accessToken');
    if (!window.confirm('Are you sure you want to delete this delivery?')) return;

    try {
      await http.delete(`/api/delivery/staff/${Number(id)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeliveries(prev => prev.filter(delivery => delivery.id !== id));
      alert('Delivery deleted successfully.');
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message);
      alert('Failed to delete delivery.');
    }
  };

  const openViewDialog = (delivery) => {
    document.activeElement.blur();
    setSelectedDelivery(delivery);
    setEditMode(false);
    setOpenDialog(true);
  };

  const openEditDialog = (delivery) => {
    document.activeElement.blur();
    setSelectedDelivery(delivery);
    setStatusEdit(delivery.status || 'Pending');
    setDeliveryDateEdit(delivery.deliveryDate || '');
    setPhoneEdit(delivery?.user?.phone || '');
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedDelivery) return;
    setSaving(true);
    const token = localStorage.getItem('accessToken');
    try {
      await http.put(`/api/delivery/staff/${selectedDelivery.id}`, {
        status: statusEdit,
        deliveryDate: deliveryDateEdit,
        poNumber: selectedDelivery.poNumber,
        assignedTo: selectedDelivery.assignedTo,
        timing: selectedDelivery.timing,
        location: selectedDelivery.location,
        description: selectedDelivery.description,
        deliveryProvider: selectedDelivery.deliveryProvider,
        phone: phoneEdit,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setOpenDialog(false);
      fetchDeliveries();
    } catch (err) {
      console.error('Failed to update delivery', err);
      alert('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrintDialog = () => {
    document.activeElement.blur();
    if (!dialogContentRef.current) return;
    const content = dialogContentRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Delivery Details</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color:#333; }
            h6 { margin-top: 1rem; color:#1976d2; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const isChanged = selectedDelivery && editMode && (
    statusEdit !== (selectedDelivery.status || 'Pending') ||
    deliveryDateEdit !== (selectedDelivery.deliveryDate || '') ||
    phoneEdit !== (selectedDelivery?.user?.phone || '')
  );

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Staff: All Deliveries
      </Typography>

      {deliveries.length === 0 ? (
        <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: 'center' }}>
          No deliveries found.
        </Typography>
      ) : (
        deliveries.map(delivery => (
          <Card
            key={delivery.id}
            sx={{ marginBottom: 2, borderRadius: 2, boxShadow: 3, backgroundColor: '#f9f9f9' }}
          >
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    PO Number: {delivery.poNumber}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', color: getStatusColor(delivery.status) }}
                  >
                    Status: {delivery.status || 'Pending'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', color: '#1976d2' }}
                  >
                    Delivery Date: {delivery.deliveryDate}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', color: '#673ab7' }}
                  >
                    Timing: {delivery.timing}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Assigned To: {delivery.assignedTo}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    RFQ ID: {delivery.rfqId || 'N/A'}
                  </Typography>
                  <Typography variant="body2">Location: {delivery.location}</Typography>
                  <Typography variant="body2">Description: {delivery.description}</Typography>
                  <Typography variant="body2">Delivery Provider: {delivery.deliveryProvider || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>User: {delivery?.user?.name}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Email: {delivery?.user?.email}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Phone: {delivery?.user?.phone}</Typography>
                </Grid>
              </Grid>

              <Button
                variant="outlined"
                color="info"
                onClick={() => openViewDialog(delivery)}
                sx={{ mt: 2, mr: 1 }}
              >
                View
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => openEditDialog(delivery)}
                sx={{ mt: 2, mr: 1 }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleDelete(delivery.id)}
                sx={{ mt: 2 }}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          {editMode ? 'Edit Delivery' : 'View Delivery'}
        </DialogTitle>
        <DialogContent ref={dialogContentRef} sx={{ fontSize: '0.95rem', color: '#333' }}>
          {selectedDelivery && (
            <>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                Delivery Info
              </Typography>
              <Typography><strong>PO Number:</strong> {selectedDelivery.poNumber}</Typography>

              {editMode ? (
                <>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <TextField
                      label="Delivery Date"
                      type="date"
                      value={deliveryDateEdit}
                      onChange={(e) => setDeliveryDateEdit(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </FormControl>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <TextField
                      label="Phone"
                      value={phoneEdit}
                      onChange={(e) => setPhoneEdit(e.target.value)}
                    />
                  </FormControl>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusEdit}
                      label="Status"
                      onChange={(e) => setStatusEdit(e.target.value)}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Delivered">Delivered</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </>
              ) : (
                <>
                  <Typography sx={{ fontWeight: 'bold', color: getStatusColor(selectedDelivery.status) }}>
                    Status: {selectedDelivery.status || 'Pending'}
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Delivery Date: {selectedDelivery.deliveryDate}
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#673ab7' }}>
                    Timing: {selectedDelivery.timing}
                  </Typography>
                </>
              )}
              <Typography><strong>RFQ ID:</strong> {selectedDelivery.rfqId || 'N/A'}</Typography>

              <Typography sx={{ fontWeight: 'bold' }}>Assigned To: {selectedDelivery.assignedTo}</Typography>
              <Typography><strong>Location:</strong> {selectedDelivery.location}</Typography>
              <Typography><strong>Description:</strong> {selectedDelivery.description}</Typography>
              <Typography><strong>Delivery Provider:</strong> {selectedDelivery.deliveryProvider}</Typography>

              <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1976d2', fontWeight: 'bold' }}>
                User Info
              </Typography>
              <Typography sx={{ fontWeight: 'bold' }}>Name: {selectedDelivery?.user?.name}</Typography>
              <Typography sx={{ fontWeight: 'bold' }}>Email: {selectedDelivery?.user?.email}</Typography>
              <Typography sx={{ fontWeight: 'bold' }}>Phone: {selectedDelivery?.user?.phone}</Typography>

              <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1976d2', fontWeight: 'bold' }}>
                Products
              </Typography>
              <Table sx={{ mt: 1 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedDelivery?.products?.map((prod, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{prod.item}</TableCell>
                      <TableCell>{prod.quantity}</TableCell>
                      <TableCell>{prod.remarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {!editMode && (
            <Button onClick={handlePrintDialog} variant="contained" color="primary">
              Print Details
            </Button>
          )}
          <Button onClick={() => setOpenDialog(false)} variant="contained" color="secondary">Close</Button>
          {editMode && (
            <Button
              onClick={handleStatusUpdate}
              variant="contained"
              color="primary"
              disabled={!isChanged || saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default StaffDeliveryManagement;
