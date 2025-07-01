import './App.css';
import MyAppBar from './components/MyAppBar';
import { Container } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import MyTheme from './themes/MyTheme';
import Tutorials from './pages/Tutorials';
import AddTutorial from './pages/AddTutorial';
import EditTutorial from './pages/EditTutorial';
import MyForm from './pages/MyForm';
import Register from './pages/Register';
import Login from './pages/Login';
import { UserProvider } from './contexts/UserContext';
import CustomerDashboard from './pages/CustomerDashboard';
import StaffDashboard from './pages/StaffDashboard';  

function App() {
  return (
    <UserProvider>
      <Router>
        <ThemeProvider theme={MyTheme}>
          <MyAppBar/>
          <Container>
            <Routes>
              <Route path={"/"} element={<Tutorials />} />
              <Route path={"/tutorials"} element={<Tutorials />} />
              <Route path={"/addtutorial"} element={<AddTutorial />} />
              <Route path={"/edittutorial/:id"} element={<EditTutorial />} />
              <Route path={"/register"} element={<Register />} />
              <Route path={"/login"} element={<Login />} />
              <Route path={"/form"} element={<MyForm />} />
              <Route path={"/customer/dashboard"} element={<CustomerDashboard />} />
              <Route path={"/staff/dashboard"} element={<StaffDashboard />} />
            </Routes>
          </Container>
        </ThemeProvider>
      </Router>
    </UserProvider>
  );
}

export default App;
