import React, { useState } from 'react';
import { Box, Dialog, Slide, Tabs, Tab, ToggleButtonGroup, ToggleButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import CustomerLogin from '../pages/Login';
import CustomerRegister from '../pages/Register';
import StaffLogin from '../pages/StaffLogin';
import StaffRegister from '../pages/RegisterStaff';

const SlideAuthPanel = ({ open, onClose }) => {
  const [role, setRole] = useState('customer'); // 'customer' or 'staff'
  const [tab, setTab] = useState(0); // 0 = Login, 1 = Register

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) setRole(newRole);
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const renderForm = () => {
    if (role === 'customer') {
      return tab === 0 ? <CustomerLogin /> : <CustomerRegister />;
    } else {
      return tab === 0 ? <StaffLogin /> : <StaffRegister />;
    }
  };

  return (
    <Dialog
    open={open}
    onClose={onClose}
    fullScreen // ✅ Makes it full-height
    TransitionComponent={Slide}
    TransitionProps={{ direction: "left" }}
    sx={{
        '& .MuiDialog-paper': {
        width: '450px',         // ✅ Fixed width for the panel
        maxWidth: '90vw',
        height: '100vh',        // ✅ Full vertical height
        marginLeft: 'auto',     // ✅ Pushes it to the right
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        }
    }}
    >

      {/* Header: Close Button */}
      <Box display="flex" justifyContent="flex-end" p={1}>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Box>

      {/* Role Selector */}
      <ToggleButtonGroup
        value={role}
        exclusive
        onChange={handleRoleChange}
        sx={{ alignSelf: 'center', mb: 2 }}
      >
        <ToggleButton value="customer">Customer</ToggleButton>
        <ToggleButton value="staff">Staff</ToggleButton>
      </ToggleButtonGroup>

      {/* Tab Selector */}
      <Tabs value={tab} onChange={handleTabChange} centered>
        <Tab label="Login" />
        <Tab label="Sign Up" />
      </Tabs>

      {/* Form Content */}
      <Box p={3} flex={1} overflow="auto">
        {renderForm()}
      </Box>
    </Dialog>
  );
};

export default SlideAuthPanel;
