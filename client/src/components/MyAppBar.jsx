import React, { useContext } from "react";
import UserContext from "../contexts/UserContext";
import { Container, AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom'; // 🔁 FIXED: use 'react-router-dom' not 'react-router'

function MyAppBar() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  const goToDashboard = () => {
    if (!user) return;
    const isStaff = user.email.endsWith("@amsmotors.com"); // 🔁 Customize domain check if needed
    navigate(isStaff ? "/staff/dashboard" : "/customer/dashboard");
  };

  return (
    <AppBar position="static" className="AppBar">
      <Container>
        <Toolbar disableGutters>
         <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
  <img
    src="/ams-logo.png" // 🔁 Image path from public folder
    alt="AMS Logo"
    style={{ height: 40, marginRight: 20, paddingTop: 8, paddingBottom: 8 }}
  />
  <Typography
  variant="h6"
  component="div"
  style={{ paddingTop: 8, paddingBottom: 8 }}
>
  Auto Machinery<br />Singapore Pte Ltd.
</Typography>
</Link>
          <Link to="/tutorials">
            <Typography sx={{ ml: 2 }}>Tutorials</Typography>
          </Link>
          <Link to="/form">
            <Typography sx={{ ml: 2 }}>Form</Typography>
          </Link>
          <Box sx={{ flexGrow: 1 }} />
          {user && (
            <>
              <Typography
                onClick={goToDashboard}
                sx={{ cursor: "pointer", fontWeight: 500, mr: 2 }}
              >
                {user.name}
              </Typography>
              <Button onClick={logout} variant="outlined" color="inherit">Logout</Button>
            </>
          )}
          {!user && (
            <>
              <Link to="/register">
                <Typography sx={{ mr: 2 }}>Register</Typography>
              </Link>
              <Link to="/login">
                <Typography>Login</Typography>
              </Link>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default MyAppBar;
