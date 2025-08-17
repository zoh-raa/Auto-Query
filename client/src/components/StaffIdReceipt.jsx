import React, { useState } from 'react';
import { Box, Typography, Button, Paper, IconButton, Tooltip, Checkbox, FormControlLabel } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SecurityIcon from '@mui/icons-material/Security';
import { toast } from 'react-toastify';

const StaffIdReceipt = ({ staffId, onGoLogin }) => {
  const [ack, setAck] = useState(false);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(staffId);
      toast.info('Staff ID copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <Paper elevation={4} sx={{ maxWidth: 600, margin: '0 auto', p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SecurityIcon sx={{ fontSize: 32, color: '#8B0000', mr: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#8B0000' }}>
          Your Staff ID
        </Typography>
      </Box>

      <Typography sx={{ mb: 2, color: 'gray' }}>
        Save this ID securely. You will need it to log in.
      </Typography>

      <Box display="flex" alignItems="center" gap={1} sx={{ p: 1.5, border: '1px solid #eee', borderRadius: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>{staffId}</Typography>
        <Tooltip title="Copy">
          <IconButton onClick={copyId}><ContentCopyIcon /></IconButton>
        </Tooltip>
      </Box>

      <FormControlLabel
        control={<Checkbox checked={ack} onChange={e => setAck(e.target.checked)} />}
        label="I have saved this Staff ID and will not forget it."
        sx={{ mb: 2 }}
      />

      <Button
        fullWidth
        variant="contained"
        disabled={!ack}
        onClick={onGoLogin}
        sx={{ backgroundColor: '#8B0000', color: 'white', '&:hover': { backgroundColor: '#5C0000' } }}
      >
        Proceed to Staff Login
      </Button>
    </Paper>
  );
};

export default StaffIdReceipt;
