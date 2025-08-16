import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Card, CardContent, Grid
} from '@mui/material';
import { http } from '../https';

const getStatusColor = (status) => {
  switch(status) {
    case 'Delivered': return 'green';
    case 'Pending': return 'orange';
    case 'In Progress': return 'blue';
    case 'Cancelled': return 'red';
    default: return '#555';
  }
};

function CustomerDeliveryManagement() {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const dialogContentRef = useRef(null);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await http.get("/api/delivery/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeliveries(res.data);
    } catch (err) {
      console.error("Failed to fetch deliveries", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      await http.delete(`/api/delivery/my/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeliveries(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error("Failed to delete delivery", err);
    }
  };

  const handleView = (delivery) => {
    setSelectedDelivery(delivery);
    setOpenDialog(true);
  };

  const handlePrint = () => {
    if (!selectedDelivery || !dialogContentRef.current) return;
    const content = dialogContentRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Delivery Details</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h6 { margin-top: 1rem; color:#1976d2; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { font-weight: bold; background-color: #f0f0f0; }
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

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>My Deliveries</Typography>

      {deliveries.length === 0 ? (
        <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: 'center' }}>
          No deliveries found.
        </Typography>
      ) : (
        deliveries.map(delivery => (
          <Card key={delivery.id} sx={{ mb: 2, borderRadius: 2, boxShadow: 3, backgroundColor: '#f9f9f9' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>PO Number: {delivery.poNumber}</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: getStatusColor(delivery.status) }}>
                    Status: {delivery.status || 'Pending'}
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Delivery Date: {delivery.deliveryDate}
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#673ab7' }}>
                    Timing: {delivery.timing}
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>Assigned To: {delivery.assignedTo}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    RFQ ID: {delivery.rfqId || 'N/A'}
                  </Typography>
                  <Typography>Location: {delivery.location}</Typography>
                  <Typography>Description: {delivery.description}</Typography>
                  <Typography>Delivery Provider: {delivery.deliveryProvider || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
          <Typography sx={{ fontWeight: 'bold' }}>User: {delivery?.user?.name}</Typography>
          <Typography sx={{ fontWeight: 'bold' }}>Email: {delivery?.user?.email}</Typography>
          <Typography sx={{ fontWeight: 'bold' }}>Phone: {delivery?.user?.phone || delivery.phone}</Typography>
        </Grid>
      </Grid>

              <Button variant="outlined" color="info" sx={{ mt: 2, mr: 1 }} onClick={() => handleView(delivery)}>
                View
              </Button>
              <Button variant="outlined" color="error" sx={{ mt: 2 }} onClick={() => handleDelete(delivery.id)}>
                Delete
              </Button>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Delivery Details
        </DialogTitle>
        <DialogContent ref={dialogContentRef} sx={{ fontSize: '0.95rem', color: '#333' }}>
          {selectedDelivery && (
            <>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>Delivery Info</Typography>
              <Typography><strong>PO Number:</strong> {selectedDelivery.poNumber}</Typography>
              <Typography sx={{ fontWeight: 'bold', color: getStatusColor(selectedDelivery.status) }}>
                Status: {selectedDelivery.status || 'Pending'}
              </Typography>
              <Typography sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                Delivery Date: {selectedDelivery.deliveryDate}
              </Typography>
              <Typography sx={{ fontWeight: 'bold', color: '#673ab7' }}>
                Timing: {selectedDelivery.timing}
              </Typography>
              <Typography><strong>RFQ ID:</strong> {selectedDelivery.rfqId || 'N/A'}</Typography>
              <Typography sx={{ fontWeight: 'bold' }}>Assigned To: {selectedDelivery.assignedTo}</Typography>
              <Typography><strong>Location:</strong> {selectedDelivery.location}</Typography>
              <Typography><strong>Description:</strong> {selectedDelivery.description}</Typography>
              <Typography><strong>Delivery Provider:</strong> {selectedDelivery.deliveryProvider || 'N/A'}</Typography>

              <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', color: '#1976d2' }}>User Info</Typography>
<Typography sx={{ fontWeight: 'bold' }}>Name: {selectedDelivery?.user?.name}</Typography>
<Typography sx={{ fontWeight: 'bold' }}>Email: {selectedDelivery?.user?.email}</Typography>
<Typography sx={{ fontWeight: 'bold' }}>Phone: {selectedDelivery?.user?.phone || selectedDelivery.phone}</Typography>

              <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', color: '#1976d2' }}>Products</Typography>
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
                      <TableCell>{prod.remarks || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePrint} variant="contained" color="primary">Print</Button>
          <Button onClick={() => setOpenDialog(false)} variant="contained" color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CustomerDeliveryManagement;
