// client/src/pages/RegisterStaff.jsx
import React from 'react';
import {
  Box, Typography, TextField, Button, MenuItem, Paper, Divider
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from '../https';

function RegisterStaff({ onRegistered }) {
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',           // ✅ added
      password: '',
      confirmPassword: '',
      role: 'admin'
    },
    validationSchema: yup.object({
      name: yup.string().trim()
        .min(3, 'Name must be at least 3 characters')
        .max(50, 'Name must be at most 50 characters')
        .required('Name is required')
        .matches(/^[a-zA-Z '-,.]+$/, "Only letters, spaces, and ' , . are allowed"),
      email: yup.string().trim().email('Enter a valid email').max(50).required('Email is required'),
      phone: yup.string().trim()                                 // ✅ added
        .matches(/^\+?[0-9]{8,15}$/, 'Enter a valid phone number')
        .required('Phone number is required'),
      password: yup.string().trim()
        .min(8, 'Password must be at least 8 characters')
        .max(50)
        .required('Password is required')
        .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/, 'Must contain at least 1 letter and 1 number'),
      confirmPassword: yup.string().trim()
        .required('Confirm password is required')
        .oneOf([yup.ref('password')], 'Passwords must match'),
      role: yup.string().oneOf(['admin', 'moderator', 'viewer'], 'Invalid role')
    }),
    onSubmit: async (data) => {
      try {
        const payload = {
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),                 // ✅ send to backend
          password: data.password.trim(),
          role: data.role
        };

        const res = await http.post('/staff/register', payload);
        toast.success(res.data.message || 'Staff registered successfully!');
        localStorage.setItem('accessToken', res.data.accessToken);

        const newId = res?.data?.user?.staff_id;
        if (newId && typeof onRegistered === 'function') {
          onRegistered(newId); // show StaffIdReceipt inside the Slide panel
        } else {
          toast.error('Could not retrieve generated Staff ID');
        }
      } catch (err) {
        console.error('❌ Register staff error:', err);
        toast.error(
          err?.response?.data?.message ||
          err?.response?.data?.errors?.[0] ||
          'Something went wrong. Please try again.'
        );
      }
    }
  });

  return (
    <Box sx={{ backgroundColor: '#fdf2f2', minHeight: '100vh', py: 6 }}>
      <Paper elevation={4} sx={{ maxWidth: 600, margin: '0 auto', p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SecurityIcon sx={{ fontSize: 32, color: '#8B0000', mr: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#8B0000' }}>
            Staff Registration Portal
          </Typography>
        </Box>

        <Typography variant="subtitle1" sx={{ mb: 2, color: 'gray' }}>
          This form is strictly for internal staff registration.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth margin="dense" autoComplete="off"
            label="Name" name="name"
            value={formik.values.name}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <TextField
            fullWidth margin="dense" autoComplete="off"
            label="Email" name="email"
            value={formik.values.email}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          {/* ✅ Phone number field */}
          <TextField
            fullWidth margin="dense" autoComplete="tel" inputMode="tel"
            label="Phone Number" name="phone" placeholder="+6512345678"
            value={formik.values.phone}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
          />
          <TextField
            fullWidth margin="dense" autoComplete="off"
            label="Password" type="password" name="password"
            value={formik.values.password}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <TextField
            fullWidth margin="dense" autoComplete="off"
            label="Confirm Password" type="password" name="confirmPassword"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />
          <TextField
            fullWidth margin="dense" select label="Role" name="role"
            value={formik.values.role}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.role && Boolean(formik.errors.role)}
            helperText={formik.touched.role && formik.errors.role}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="moderator">Moderator</MenuItem>
            <MenuItem value="viewer">Viewer</MenuItem>
          </TextField>

          <Button
            fullWidth variant="contained" type="submit"
            sx={{ mt: 3, backgroundColor: '#8B0000', color: 'white', '&:hover': { backgroundColor: '#5C0000' } }}
          >
            Register Staff
          </Button>
        </Box>
      </Paper>

      <ToastContainer />
    </Box>
  );
}

export default RegisterStaff;