import React from 'react';
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
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

function Register( {onSwitchToLogin }) {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: yup.object({
      name: yup.string().trim()
        .min(3, 'Name must be at least 3 characters')
        .max(50, 'Name must be at most 50 characters')
        .required('Name is required')
        .matches(/^[a-zA-Z '-,.]+$/, "Name only allows letters, spaces, and ' , ."),
      email: yup.string().trim()
        .email('Enter a valid email')
        .max(50, 'Email must be at most 50 characters')
        .required('Email is required'),
      password: yup.string().trim()
        .min(8, 'Password must be at least 8 characters')
        .max(50, 'Password must be at most 50 characters')
        .required('Password is required')
        .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/, 'Password must contain at least 1 letter and 1 number'),
      confirmPassword: yup.string().trim()
        .required('Confirm password is required')
        .oneOf([yup.ref('password')], 'Passwords must match')
    }),
    onSubmit: async (data) => {
      console.log('Submitting register form:', data);

      data.name = data.name.trim();
      data.email = data.email.trim().toLowerCase();
      data.password = data.password.trim();

      try {
        const res = await http.post('/customer/register', data);
        console.log('Register response:', res.data);
        toast.success('Registration successful');
        // Send them home, same pattern as your current flow
        setTimeout(() => navigate('/'), 1200);
      } catch (err) {
        console.error('Register error:', err);
        toast.error(
          err?.response?.data?.message ||
          err?.response?.data?.errors?.[0] ||
          'Something went wrong. Please try again.'
        );
      }
    }
  });

  return (
    <Box sx={{ backgroundColor: '#f4f6f9', minHeight: '100vh', py: 6 }}>
      <Paper elevation={4} sx={{ maxWidth: 500, margin: '0 auto', p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonOutlineIcon sx={{ fontSize: 30, color: '#444', mr: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            Customer Registration
          </Typography>
        </Box>

        <Typography variant="subtitle1" sx={{ mb: 2, color: 'gray' }}>
          Create your customer account. If you already have one, go to the <strong>Login</strong> page instead.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="dense"
            autoComplete="off"
            label="Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
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
          <TextField
            fullWidth
            margin="dense"
            autoComplete="off"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
            Register
          </Button>

          <Button
            fullWidth
            variant="text"
            sx={{ mt: 1 }}
            onClick={() => {
                if (typeof onSwitchToLogin === 'function') {
                onSwitchToLogin(); // 👈 switch tab inside the panel
                }
            }}
            >
            Already have an account
            </Button>
        </Box>
      </Paper>

      <ToastContainer />
    </Box>
  );
}

export default Register;
