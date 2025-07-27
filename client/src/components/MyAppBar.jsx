import React, { useContext, useState } from "react";
import UserContext from "../contexts/UserContext";
import { AppBar, Toolbar, Typography, Box, Button, InputBase } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import InventoryIcon from '@mui/icons-material/Inventory';
import { styled, alpha } from '@mui/material/styles';
import '../App.css';
import SlideAuthPanel from './SlideAuthPanel';
import CartIcon from './CartIcon';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 8,
  backgroundColor: alpha('#ffffff', 0.15),
  '&:hover': {
    backgroundColor: alpha('#ffffff', 0.25),
  },
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  width: '100%',
  maxWidth: 300,
  border: '1px solid white',
  color: 'white'
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'white',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
  },
}));

function MyAppBar() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const keyword = e.target.value.trim();
      if (keyword) {
        alert(`Searching for: ${keyword}`);
        e.target.value = "";
      }
    }
  };

  const handleCatalogClick = () => {
    navigate("/product");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#4f4f4f" }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left Section: Logo + Brand + Home + Catalog */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src="/images/logo.png" alt="Logo" style={{ height: 40 }} />
          <Typography variant="h6" fontWeight="bold">Auto Machinery</Typography>
          <Link to="/" style={{ textDecoration: "none", color: "white" }}>
            <Typography>Home</Typography>
          </Link>
          <Button 
            onClick={handleCatalogClick}
            variant="contained"
            startIcon={<InventoryIcon />}
            sx={{ 
              backgroundColor: "#ff7a7a",
              color: "black",
              textTransform: "capitalize",
              borderRadius: "20px",
              fontWeight: "bold",
              paddingX: 2,
              paddingY: 1,
              '&:hover': { 
                backgroundColor: "#ff6b6b"
              }
            }}
          >
            Catalog
          </Button>
        </Box>

        {/* Middle: Search */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search part # / vehicle / VIN"
            inputProps={{ 'aria-label': 'search' }}
            onKeyDown={handleSearch}
          />
        </Search>

        {/* Right: Auth */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {user ? (
            <>
              <Link
                to={user.role === 'staff' ? "/staff/dashboard" : "/customer/dashboard"}
                style={{ textDecoration: "none", color: "white" }}
              >
                <Typography sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                  {user.name || "User"}
                </Typography>
              </Link>

              {/* 👇 NEW BUTTON FOR RFQ FORM */}
              <Button component={Link} to="/rfq-form" state={{ fromNavbar: true }}>
                Create RFQ
              </Button>

              <Button color="inherit" onClick={logout}>Logout</Button>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                sx={{ color: "white", borderColor: "white" }}
                onClick={() => setAuthOpen(true)}
              >
                Login / Register
              </Button>
            </Box>
          )}
        </Box>

        <CartIcon />
      </Toolbar>

      <SlideAuthPanel open={authOpen} onClose={() => setAuthOpen(false)} />
    </AppBar>
  );
}

export default MyAppBar;