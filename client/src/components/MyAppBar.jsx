import React, { useContext } from "react";
import UserContext from "../contexts/UserContext";
import { AppBar, Toolbar, Typography, Box, Button, InputBase } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom'; // ✅ Fixed import
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import '../App.css';

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

  return (
    <AppBar position="static" sx={{ backgroundColor: "#4f4f4f" }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left Section: Logo + Brand + Home */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src="/images/logo.png" alt="Logo" style={{ height: 40 }} />
          <Typography variant="h6" fontWeight="bold">Auto Machinery</Typography>
          <Link to="/" style={{ textDecoration: "none", color: "white" }}>
            <Typography>Home</Typography>
          </Link>
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
              <Typography>{user.name}</Typography>
              <Button color="inherit" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  sx={{ color: "white", borderColor: "white" }}
                  component={Link}
                  to="/register"
                >
                  Register
                </Button>
                <Button
                  variant="outlined"
                  sx={{ color: "white", borderColor: "white" }}
                  component={Link}
                  to="/login"
                >
                  Login
                </Button>

              </Box>

            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default MyAppBar;
