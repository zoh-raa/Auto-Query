import './App.css'; // Import global styles
import MyAppBar from './components/MyAppBar'; // Top navigation bar component
import ChatbotBox from './components/ChatbotBox'; // Chatbot floating box component
import { Container } from '@mui/material'; // MUI Container for consistent page padding
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // React Router v6 for routing
import { ThemeProvider } from '@mui/material/styles'; // MUI theme provider
import MyTheme from './themes/MyTheme'; // Custom Material UI theme
import UserContext from "./contexts/UserContext"; // Context for user data (imported but unused here)
import Tutorials from './pages/Tutorials'; // Tutorials listing page
import AddTutorial from './pages/AddTutorial'; // Page to add a tutorial
import EditTutorial from './pages/EditTutorial'; // Page to edit a tutorial
import MyForm from './pages/MyForm'; // Custom form page
import Register from './pages/Register'; // User registration page
import Login from './pages/Login'; // User login page

import DeliveryManager from './pages/DeliveryManager'; // Page for managing deliveries
//import DeliveryRequest from './pages/DeliveryRequest'; // Page to request delivery
import AddDelivery from './pages/AddDelivery'; // Page to add delivery details
import SelectDelivery from './pages/SelectDelivery'; // Page to select delivery provider

import AdminDeliveryManager from './pages/AdminDeliveryManager'; // Admin-only delivery management page

import { UserProvider } from './contexts/UserContext'; // Context provider to wrap the app with user info

function App() {
  // Temporary hardcoded user role for demo/demo purposes
  // TODO: Replace with actual user role from authentication context or API
  const userRole = 'admin'; // Possible roles: 'admin', 'customer', 'guest', etc.

  return (
    // Wrap the entire app in UserProvider for user state availability throughout
    <UserProvider>
      {/* Router enables client-side routing */}
      <Router>
        {/* ThemeProvider applies Material UI theming to all child components */}
        <ThemeProvider theme={MyTheme}>
          {/* Top navigation bar */}
          <MyAppBar />
          {/* Chatbot floating UI component */}
          <ChatbotBox />

          {/* Container for page content with horizontal padding */}
          <Container>
            {/* Define routes for different pages */}
            <Routes>
              {/* Delivery-related routes */}
              <Route path="/delivery" element={<DeliveryManager />} />

              <Route path="/select-delivery" element={<SelectDelivery />} />
              <Route path="/add-delivery" element={<AddDelivery />} />

              {/* Admin-only route: if userRole is 'admin', show AdminDeliveryManager, else redirect to home */}
              <Route
                path="/admin-delivery"
                element={
                  userRole === 'admin' ? (
                    <AdminDeliveryManager />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />

              {/* Tutorial-related routes */}
              <Route path="/" element={<Tutorials />} />
              <Route path="/tutorials" element={<Tutorials />} />
              <Route path="/addtutorial" element={<AddTutorial />} />
              <Route path="/edittutorial/:id" element={<EditTutorial />} />

              {/* Authentication pages */}
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              {/* Other pages */}
              <Route path="/form" element={<MyForm />} />
            </Routes>
          </Container>
        </ThemeProvider>
      </Router>
    </UserProvider>
  );
}

export default App;
