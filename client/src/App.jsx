import './App.css';
import MyAppBar from './components/MyAppBar';
import { Container } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { ThemeProvider } from '@mui/material/styles';
import MyTheme from './themes/MyTheme';
import { Toaster } from 'react-hot-toast'; // ✅ Import toaster
import Register from './pages/Register';
import RegisterStaff from './pages/RegisterStaff';
import Login from './pages/Login';
import StaffLogin from './pages/StaffLogin';
import { UserProvider } from './contexts/UserContext';
import HomePage from './pages/HomePage'; // ✅ Correct
import CustomerDashboard from "./pages/CustomerDashboard"; 
import StaffDashboard from './pages/StaffDashboard';
import SecurityLogs from './pages/SecurityLogs'; // 👈 import it

function App() {
  return (
      <Router>
        <UserProvider>
        <ThemeProvider theme={MyTheme}>
          <MyAppBar />
          <Toaster position="top-right" /> {/* ✅ Add toaster here */}
          <Container>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-staff" element={<RegisterStaff />} />
              <Route path="/login" element={<Login />} />
              <Route path="/staff/login" element={<StaffLogin />} />
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/security-logs" element={<SecurityLogs />} /> {/* ✅ Add this */}
            </Routes>
          </Container>
        </ThemeProvider>
        </UserProvider>
      </Router>
  );
}

export default App;
