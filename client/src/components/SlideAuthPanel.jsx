// client/src/components/SlideAuthPanel.jsx
import React, { useState } from 'react';
import { Box, Dialog, Slide, Tabs, Tab, ToggleButtonGroup, ToggleButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import CustomerLogin from '../pages/Login';
import CustomerRegister from '../pages/Register';
import StaffLogin from '../pages/StaffLogin';
import StaffRegister from '../pages/RegisterStaff';
import ForgotPasswordFlow from '../components/ForgotPasswordFlow';
import StaffIdReceipt from '../components/StaffIdReceipt'; // ⬅️ new

const SlideAuthPanel = ({ open, onClose }) => {
  const [role, setRole] = useState('customer'); // 'customer' | 'staff'
  const [tab, setTab] = useState(0); // 0 = Login, 1 = Register
  const [mode, setMode] = useState('auth'); // 'auth' | 'forgot' | 'staff-id'
  const [staffNewId, setStaffNewId] = useState('');

  const handleRoleChange = (_e, newRole) => {
    if (newRole !== null) setRole(newRole);
  };

  const handleTabChange = (_e, newValue) => {
    setTab(newValue);
  };

  const goStaffLogin = () => {
    // jump to staff login within the panel
    setMode('auth');
    setRole('staff');
    setTab(0);
  };

const renderForm = () => {
  if (mode === 'forgot') {
    return (
      <ForgotPasswordFlow
        role={role}
        onBack={() => setMode('auth')}
        onRevealStaffId={(id) => {
          setStaffNewId(id);     // <- save the revealed staff_id
          setMode('staff-id');   // <- switch to the receipt screen
        }}
        onResetComplete={() => {
          // after password reset, send them to Staff Login in-panel
          setMode('auth');
          setRole('staff');
          setTab(0);
        }}
      />
    );
  }

  if (mode === 'staff-id') {
    return <StaffIdReceipt staffId={staffNewId} onGoLogin={goStaffLogin} />;
  }

  if (role === 'customer') {
    return tab === 0
      ? <CustomerLogin onForgot={() => setMode('forgot')} />
      : <CustomerRegister onSwitchToLogin={() => setTab(0)} />;
  } else {
    return tab === 0
      ? <StaffLogin onForgot={() => setMode('forgot')} />
      : (
        <StaffRegister
          onRegistered={(newStaffId) => {
            setStaffNewId(newStaffId);
            setMode('staff-id');
          }}
        />
      );
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

      {/* Hide role/tabs when in forgot or staff-id mode */}
      {mode === 'auth' && (
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

          <Tabs value={tab} onChange={handleTabChange} centered>
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
