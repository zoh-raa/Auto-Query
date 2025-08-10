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
import { CartProvider } from './contexts/CartContext';
import CartPage from './pages/CartPage';
import RFQFormPage from './pages/RFQFormPage';
import RFQResultPage from './pages/RFQResultPage';
import MyRFQsPage from './pages/MyRFQsPage';
import CustomerStatus from './pages/CustomerStatus';
import CreateProductPage from './pages/CreateProductPage'; // 👈 import it
import ProductPage from './pages/ProductPage';
import PartDetailsPage from './pages/PartDetailsPage';
import StaffRFQPage from './pages/StaffRFQPage';
import StaffRFQEditPage from './pages/StaffRFQEditPage';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bindNavigator } from "./https"; // adjust path if http.js is in a different folder

function NavigatorBinder() {
  const navigate = useNavigate();
  useEffect(() => {
    bindNavigator(navigate);
  }, [navigate]);
  return null;
}


function App() {
  
  return (
      <Router>
        <NavigatorBinder />
        <UserProvider>
        <CartProvider>
        <ThemeProvider theme={MyTheme}>
          <MyAppBar />
          <Toaster position="top-right" /> {/* ✅ Add toaster here */}
          <Container>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-staff" element={<RegisterStaff />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/rfq-form" element={<RFQFormPage />} />
              <Route path="/staff/login" element={<StaffLogin />} />
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/customer-status" element={<CustomerStatus />} />
              <Route path="/staff/security-logs" element={<SecurityLogs />} /> {/* ✅ Add this */}
              <Route path="/staff/create-product" element={<CreateProductPage />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/parts/:productId" element={<PartDetailsPage />} />
              <Route path="/rfq-result" element={<RFQResultPage />} />
              <Route path="/my-rfqs" element={<MyRFQsPage />} />
              <Route path="/staff/rfqs/edit/:id" element={<StaffRFQEditPage/>}/>
              <Route path="/staff/rfqs" element={<StaffRFQPage/>}/>
              
              
            </Routes>
          </Container>
      </ThemeProvider>
    </CartProvider>
  </UserProvider>
</Router>
  );
}

export default App;
