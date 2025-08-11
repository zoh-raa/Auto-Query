import React, { useContext, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { http } from '../https';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../contexts/UserContext';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; // ✅ Correct

function Login() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      navigate("/customer/dashboard");
    }
  }, [user]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: yup.object({
      email: yup.string().trim()
        .email('Enter a valid email')
        .max(50, 'Email must be at most 50 characters')
        .required('Email is required'),
      password: yup.string().trim()
        .min(8, 'Password must be at least 8 characters')
        .max(50, 'Password must be at most 50 characters')
        .required('Password is required'),
    }),
    onSubmit: async (data) => {
      console.log('🚀 Submitting login with:', data);

      data.email = data.email.trim().toLowerCase();
      data.password = data.password.trim();

      try {
        const res = await http.post('/customer/login', data);
        localStorage.setItem('accessToken', res.data.accessToken);
        setUser(res.data.user);
        toast.success('Login successful!');
        navigate("/customer/dashboard");
      } catch (err) {
        console.error('❌ Login error:', err);
        toast.error(
          err?.response?.data?.message || 'Something went wrong. Try again.'
        );
      }
    },
  });

  return (
    <Box sx={{ backgroundColor: '#f4f6f9', minHeight: '100vh', py: 6 }}>
      <Paper elevation={4} sx={{ maxWidth: 500, margin: '0 auto', p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonOutlineIcon sx={{ fontSize: 30, color: '#444', mr: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            Customer Login Portal
          </Typography>
        </Box>

        <Typography variant="subtitle1" sx={{ mb: 2, color: 'gray' }}>
          Please login using your customer credentials. If you're a staff member, go to the <strong>Staff Login</strong> page instead.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="dense"
            autoComplete="off"
            label="Email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            fullWidth
            margin="dense"
            autoComplete="off"
            label="Password"
            name="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />

          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{
              mt: 3,
              backgroundColor: '#444444',
              color: 'white',
              '&:hover': {
                backgroundColor: '#2c2c2c'
              }
            }}
          >
            Login
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                const decoded = jwtDecode(credentialResponse.credential); // ✅ FIXED LINE
                console.log("✅ Google login success:", decoded);

                try {
                  const res = await http.post('/customer/google-login', {
                    name: decoded.name,
                    email: decoded.email,
                    googleId: decoded.sub,
                  });

                  localStorage.setItem('accessToken', res.data.accessToken);
                  setUser(res.data.user);
                  toast.success('Login successful!');
                  navigate("/customer/dashboard");
                } catch (err) {
                  console.error('❌ Google login error:', err);
                  toast.error('Google login failed. Try again.');
                }
              }}
              onError={() => {
                console.log('❌ Google login failed');
                toast.error('Google login failed. Try again.');
              }}
            />
          </Box>
        </Box>
      </Paper>

      <ToastContainer />
    </Box>
  );
}

export default Login;
