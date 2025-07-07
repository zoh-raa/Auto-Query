import React, { useContext } from "react";
import UserContext from "../contexts/UserContext";
import { Container, AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function MyAppBar() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  // Style Link wrapper for spacing
  const linkStyle = {
    marginLeft: '1rem',
    color: 'white',
    textDecoration: 'none',
  };

  return (
    <AppBar position="static" className="AppBar">
      <Container>
        <Toolbar disableGutters>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            <Typography variant="h6" component="div" sx={{ cursor: 'pointer' }}>
              Learning
            </Typography>
          </Link>

          {/* Navigation Links */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 3, flexGrow: 1 }}>
            <Link to="/tutorials" style={linkStyle}>
              <Typography> Tutorials </Typography>
            </Link>
            <Link to="/form" style={linkStyle}>
              <Typography> Form </Typography>
            </Link>
            <Link to="/delivery" style={linkStyle}>
              <Typography> Delivery Manager </Typography>
            </Link>
            <Link to="/select-delivery" style={linkStyle}>
              <Typography> Select Delivery </Typography>
            </Link>
           

            {/* Admin-only link */}
            {user && user.role === 'admin' && (
              <Link to="/admin-delivery" style={linkStyle}>
                <Typography> Admin Delivery </Typography>
              </Link>
            )}
          </Box>

          {/* User Info / Auth */}
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>{user.name}</Typography>
              <Button color="inherit" onClick={logout}>Logout</Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Link to="/register" style={linkStyle}>
                <Typography> Register </Typography>
              </Link>
              <Link to="/login" style={linkStyle}>
                <Typography> Login </Typography>
              </Link>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default MyAppBar;
