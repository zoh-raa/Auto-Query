import React, { useContext } from "react";
import UserContext from "../contexts/UserContext";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom"; // FIXED: react-router-dom, not 'react-router'

function MyAppBar() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  return (
    <AppBar position="static" className="AppBar">
      <Container>
        <Toolbar disableGutters={true} sx={{ display: "flex", gap: 2 }}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Typography variant="h6" component="div">
              Learning
            </Typography>
          </Link>
          <Link
            to="/tutorials"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Typography>Tutorials</Typography>
          </Link>
          <Link to="/form" style={{ textDecoration: "none", color: "inherit" }}>
            <Typography>Form</Typography>
          </Link>
          {user && (
            <Link to="/cart" style={{ textDecoration: "none", color: "inherit" }}>
              <Typography>Cart</Typography>
            </Link>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {user ? (
            <>
              <Typography>{user.name}</Typography>
              <Button onClick={logout} color="inherit">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Typography>Register</Typography>
              </Link>
              <Link
                to="/login"
                style={{ textDecoration: "none", color: "inherit" }}
              >
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
