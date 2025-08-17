// App.jsx
import React from 'react';
import './App.css';

import { Container, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import MyAppBar from './components/MyAppBar';
import ChatbotBox from './components/ChatBotBox';

import MyTheme from './themes/MyTheme';
import { UserProvider } from './contexts/UserContext';
import { CartProvider } from './contexts/CartContext';
import { bindNavigator } from './https';

// Pages
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import RegisterStaff from './pages/RegisterStaff';
import Login from './pages/Login';
import StaffLogin from './pages/StaffLogin';
import ForgotPassword from './pages/ForgotPassword';
import CustomerDashboard from './pages/CustomerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import CustomerStatus from './pages/CustomerStatus';
import SecurityLogs from './pages/SecurityLogs';
import CartPage from './pages/CartPage';
import RFQFormPage from './pages/RFQFormPage';
import RFQResultPage from './pages/RFQResultPage';
import MyRFQsPage from './pages/MyRFQsPage';
import CreateProductPage from './pages/CreateProductPage';
import ProductPage from './pages/ProductPage';
import ProductDetail from './pages/ProductDetail';
import PartDetailsPage from './pages/PartDetailsPage';
import StaffRFQPage from './pages/StaffRFQPage';
import StaffRFQEditPage from './pages/StaffRFQEditPage';
import SelectDelivery from './pages/SelectDelivery';
import AddDelivery from './pages/AddDelivery';
import CustomerDeliveryManagement from './pages/CustomerDeliveryManagement';
import StaffDeliveryManagement from './pages/StaffDelivery';
import StaffDeliveryEdit from './pages/StaffDeliveryEdit';
import SearchResults from './pages/SearchResults';
import BrandPage from './pages/BrandPage';

// Components
import ForgotPasswordFlow from './components/ForgotPasswordFlow';

// Navigator binder for react router v6
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
            <Toaster position="top-right" />
            <Container>
              <Routes>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/register-staff" element={<RegisterStaff />} />
                <Route path="/login" element={<Login />} />
                <Route path="/staff/login" element={<StaffLogin />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/staff/forgot-password" element={<ForgotPasswordFlow role="staff" />} />

                {/* Customer */}
                <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/rfq-form" element={<RFQFormPage />} />
                <Route path="/rfq-result" element={<RFQResultPage />} />
                <Route path="/my-rfqs" element={<MyRFQsPage />} />
                <Route path="/select-delivery" element={<SelectDelivery />} />
                <Route path="/add-delivery" element={<AddDelivery />} />
                <Route path="/delivery-management" element={<CustomerDeliveryManagement />} />

                {/* Staff */}
                <Route path="/staff/dashboard" element={<StaffDashboard />} />
                <Route path="/staff/customer-status" element={<CustomerStatus />} />
                <Route path="/staff/security-logs" element={<SecurityLogs />} />
                <Route path="/staff/create-product" element={<CreateProductPage />} />
                <Route path="/staff/rfqs" element={<StaffRFQPage />} />
                <Route path="/staff/rfqs/edit/:id" element={<StaffRFQEditPage />} />
                <Route path="/staff-delivery-management" element={<StaffDeliveryManagement />} />
                <Route path="/staff-delivery-edit/:id" element={<StaffDeliveryEdit />} />

                {/* Catalogue */}
                <Route path="/product" element={<ProductPage />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/parts/:productId" element={<PartDetailsPage />} />
                <Route path="/brand/:brandName" element={<BrandPage />} />
                <Route path="/search" element={<SearchResults />} />
              </Routes>
            </Container>
          </ThemeProvider>
        </CartProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
