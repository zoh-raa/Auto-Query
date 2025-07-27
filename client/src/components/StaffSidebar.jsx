import React, { useContext } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SecurityIcon from '@mui/icons-material/Security';
import InventoryIcon from '@mui/icons-material/Inventory';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import UserContext from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import AddBoxIcon from '@mui/icons-material/AddBox';

const StaffSidebar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Box width="260px" bgcolor="#f4f4f4" p={3}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        STAFF {user?.name || 'Unknown'}
      </Typography>
      <Stack spacing={1}>
        <Button
          fullWidth
          startIcon={<PersonOutlineIcon />}
          variant={isActive('/staff/dashboard') ? 'contained' : 'outlined'}
          color="inherit"
          onClick={() => navigate('/staff/dashboard')}
        >
          User management
        </Button>
        <Button
          fullWidth
          startIcon={<SecurityIcon />}
          variant={isActive('/staff/security-logs') ? 'contained' : 'outlined'}
          color="inherit"
          onClick={() => navigate('/staff/security-logs')}
        >
          Security logs
        </Button>
        <Button
          fullWidth
          startIcon={<InventoryIcon />}
          variant={isActive('/staff/create-product') ? 'contained' : 'outlined'}
          color="inherit"
          onClick={() => navigate('/staff/create-product')}
        >
          Add/edit/delete parts
        </Button>
        <Button
          fullWidth
          startIcon={<ListAltIcon />}
          variant="outlined"
          color="inherit"
        >
          Check stock quantity
        </Button>
        <Button
          fullWidth
          startIcon={<ExitToAppIcon />}
          color="error"
          onClick={logout}
        >
          Logout
        </Button>
      </Stack>
    </Box>
  );
};

export default StaffSidebar;
