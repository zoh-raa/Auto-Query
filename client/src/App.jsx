import './App.css';
import MyAppBar from './components/MyAppBar';
import { Container } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { ThemeProvider } from '@mui/material/styles';
import MyTheme from './themes/MyTheme';
import { Toaster } from 'react-hot-toast'; // ✅ Import toaster
import Register from './pages/Register';
import Login from './pages/Login';
import { UserProvider } from './contexts/UserContext';
import HomePage from './pages/HomePage'; // ✅ Correct


function App() {
  return (
    <UserProvider>
      <Router>
        <ThemeProvider theme={MyTheme}>
          <MyAppBar />
          <Toaster position="top-right" /> {/* ✅ Add toaster here */}
          <Container>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Container>
        </ThemeProvider>
      </Router>
    </UserProvider>
  );
}

export default App;
