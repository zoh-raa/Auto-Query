import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SecurityIcon from '@mui/icons-material/Security';
import http from '../https';

function RegisterStaff() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      staff_id: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'admin'
    },
    validationSchema: yup.object({
      staff_id: yup.string().trim().required('Staff ID is required').max(30),
      name: yup.string().trim()
        .min(3, 'Name must be at least 3 characters')
        .max(50, 'Name must be at most 50 characters')
        .required('Name is required')
        .matches(/^[a-zA-Z '-,.]+$/, "Only letters, spaces, and ' - , . are allowed"),
      email: yup.string().trim().email('Enter a valid email').max(50).required('Email is required'),
      password: yup.string().trim()
        .min(8, 'Password must be at least 8 characters')
        .max(50)
        .required('Password is required')
        .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/, "Must contain at least 1 letter and 1 number"),
      confirmPassword: yup.string().trim()
        .required('Confirm password is required')
        .oneOf([yup.ref('password')], 'Passwords must match'),
      role: yup.string().oneOf(['admin', 'moderator', 'viewer'], 'Invalid role')
    }),
    onSubmit: async (data) => {
      try {
        const payload = {
          staff_id: data.staff_id.trim(),
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password.trim(),
          role: data.role
        };

        const res = await axios.post('http://localhost:3001/staff/register', payload);
        toast.success(res.data.message || 'Staff registered successfully!');
        localStorage.setItem("accessToken", res.data.accessToken);
        navigate('/');
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
          This form is strictly for internal staff registration. If you're a customer, please use the <strong>Customer Registration</strong> page instead.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth margin="dense" autoComplete="off"
            label="Staff ID"
            name="staff_id"
            value={formik.values.staff_id}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.staff_id && Boolean(formik.errors.staff_id)}
            helperText={formik.touched.staff_id && formik.errors.staff_id}
          />
          <TextField
            fullWidth margin="dense" autoComplete="off"
            label="Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <TextField
            fullWidth margin="dense" autoComplete="off"
            label="Email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            fullWidth margin="dense" autoComplete="off"
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
            fullWidth margin="dense" autoComplete="off"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />
          <TextField
            fullWidth margin="dense"
            select
            label="Role"
            name="role"
            value={formik.values.role}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.role && Boolean(formik.errors.role)}
            helperText={formik.touched.role && formik.errors.role}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="moderator">Moderator</MenuItem>
            <MenuItem value="viewer">Viewer</MenuItem>
          </TextField>

          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{
              mt: 3,
              backgroundColor: '#8B0000',
              color: 'white',
              '&:hover': { backgroundColor: '#5C0000' }
            }}
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
