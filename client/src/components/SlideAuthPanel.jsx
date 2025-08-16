import React, { useState } from 'react';
import { Box, Dialog, Slide, Tabs, Tab, ToggleButtonGroup, ToggleButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import CustomerLogin from '../pages/Login';
import CustomerRegister from '../pages/Register';
import StaffLogin from '../pages/StaffLogin';
import StaffRegister from '../pages/RegisterStaff';
import ForgotPasswordFlow from '../components/ForgotPasswordFlow';


const SlideAuthPanel = ({ open, onClose }) => {
  const [role, setRole] = useState('customer'); // 'customer' or 'staff'
  const [tab, setTab] = useState(0); // 0 = Login, 1 = Register
  const [mode, setMode] = useState('auth');

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) setRole(newRole);
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const renderForm = () => {
    if (mode === 'forgot') {
      return (
        <ForgotPasswordFlow onBack={() => setMode('auth')} />
      );
    }

   if (role === 'customer') {
  return tab === 0
    ? <CustomerLogin onForgot={() => setMode('forgot')} />
    : <CustomerRegister onSwitchToLogin={() => setTab(0)} />; // 👈 add prop
}
 else {
      return tab === 0
        ? <StaffLogin />
        : <StaffRegister />;
    }
  };

  return (
     <Dialog
      open={open}
      onClose={() => { setMode('auth'); onClose?.(); }}
      fullScreen
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'left' }}
      sx={{
        '& .MuiDialog-paper': {
          width: '450px',
          maxWidth: '90vw',
          height: '100vh',
          marginLeft: 'auto',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="flex-end" p={1}>
        <IconButton onClick={() => { setMode('auth'); onClose?.(); }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Hide role and tabs when in forgot mode to keep the flow focused */}
      {mode !== 'forgot' && (
        <>
          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={handleRoleChange}
            sx={{ alignSelf: 'center', mb: 2 }}
          >
            <ToggleButton value="customer">Customer</ToggleButton>
            <ToggleButton value="staff">Staff</ToggleButton>
          </ToggleButtonGroup>

          <Tabs value={tab} onChange={(_e, v) => setTab(v)} centered>
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>
        </>
      )}

      {/* Body */}
      <Box p={3} flex={1} overflow="auto">
        {renderForm()}
      </Box>
    </Dialog>
  );
};

export default SlideAuthPanel;
