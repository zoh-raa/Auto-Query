import ProductDetail from './pages/ProductDetail';
import BrandPage from './pages/BrandPage';
// App.jsx
import React from 'react';
import './App.css';
import MyAppBar from './components/MyAppBar';
import { Container, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import MyTheme from './themes/MyTheme';
import { UserProvider } from './contexts/UserContext';
import { CartProvider } from './contexts/CartContext';
import { bindNavigator } from './https';

import Register from './pages/Register';
import RegisterStaff from './pages/RegisterStaff';
import Login from './pages/Login';
import StaffLogin from './pages/StaffLogin';
import ForgotPassword from './pages/ForgotPassword';
import HomePage from './pages/HomePage';
import CustomerDashboard from "./pages/CustomerDashboard";
import StaffDashboard from './pages/StaffDashboard';
import SecurityLogs from './pages/SecurityLogs';
import CartPage from './pages/CartPage';
import RFQFormPage from './pages/RFQFormPage';
import RFQResultPage from './pages/RFQResultPage';
import MyRFQsPage from './pages/MyRFQsPage';
import CustomerStatus from './pages/CustomerStatus';
import CreateProductPage from './pages/CreateProductPage';
import ProductPage from './pages/ProductPage';
import PartDetailsPage from './pages/PartDetailsPage';
import StaffRFQPage from './pages/StaffRFQPage';
import StaffRFQEditPage from './pages/StaffRFQEditPage';
import SelectDelivery from './pages/SelectDelivery';
import AddDelivery from './pages/AddDelivery';
import CustomerDeliveryManagement from './pages/CustomerDeliveryManagement';
import StaffDeliveryManagement from './pages/StaffDelivery';

import SearchResults from './pages/SearchResults';


import ChatbotBox from './components/ChatBotBox'; // fixed casing

// Navigator binder for react-router-dom v6
function NavigatorBinder() {
  const navigate = useNavigate();

  React.useEffect(() => {
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
          <ChatbotBox />
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
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="/parts/:productId" element={<PartDetailsPage />} />
              <Route path="/rfq-result" element={<RFQResultPage />} />
              <Route path="/my-rfqs" element={<MyRFQsPage />} />
              <Route path="/staff/rfqs/edit/:id" element={<StaffRFQEditPage/>}/>
              <Route path="/staff/rfqs" element={<StaffRFQPage/>}/>
              <Route path="/search" element={<SearchResults />} />
              <Route path="/brand/:brandName" element={<BrandPage />} />
              <Route path="/select-delivery" element={<SelectDelivery />} />
              <Route path="/add-delivery" element={<AddDelivery />} />
              <Route path="/delivery-management" element={<CustomerDeliveryManagement />} />
              <Route path="/staff-delivery-management" element={<StaffDeliveryManagement />} />
             
            </Routes>
          </Container>
      </ThemeProvider>
    </CartProvider>
  </UserProvider>
</Router>
  );
}

export default App;
