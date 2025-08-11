import React, { useContext } from 'react';
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
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../contexts/UserContext';
import SecurityIcon from '@mui/icons-material/Security'; // 👈 Staff icon

function StaffLogin() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const formik = useFormik({
    initialValues: {
      staff_id: '',
      password: ''
    },
    validationSchema: yup.object({
      staff_id: yup.string().required('Staff ID is required'),
      password: yup.string().required('Password is required')
    }),
    onSubmit: async (data) => {
      try {
        const payload = {
          staff_id: data.staff_id.trim(),
          password: data.password.trim()
        };

    const res = await axios.post('http://localhost:3001/staff/login', payload);

        const staffUser = {
          name: res.data.user.name || "Staff",
          email: res.data.user.email,
          role: "staff"
        };

        setUser(staffUser);
        localStorage.setItem("user", JSON.stringify(staffUser));
        localStorage.setItem("accessToken", res.data.accessToken);

        toast.success('Login successful!');
        navigate('/staff/dashboard');

      } catch (err) {
        console.error('❌ Staff login error:', err);
        toast.error(
          err?.response?.data?.message || 'Login failed. Please check your credentials.'
        );
      }
    }
  });

  return (
    <Box sx={{ backgroundColor: '#fdf2f2', minHeight: '100vh', py: 6 }}>
      <Paper elevation={4} sx={{ maxWidth: 500, margin: '0 auto', p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SecurityIcon sx={{ fontSize: 30, color: '#8B0000', mr: 1 }} />
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#8B0000' }}>
            Staff Login Portal
          </Typography>
        </Box>

        <Typography variant="subtitle1" sx={{ mb: 2, color: 'gray' }}>
          This portal is for internal staff only. If you're a customer, please return to the <strong>Customer Login</strong> page.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="dense"
            label="Staff ID"
            name="staff_id"
            value={formik.values.staff_id}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.staff_id && Boolean(formik.errors.staff_id)}
            helperText={formik.touched.staff_id && formik.errors.staff_id}
          />

          <TextField
            fullWidth
            margin="dense"
            label="Password"
            type="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{
              mt: 3,
              backgroundColor: '#8B0000',
              color: 'white',
              '&:hover': {
                backgroundColor: '#5C0000'
              }
            }}
          >
            Login
          </Button>
        </Box>
      </Paper>

      <ToastContainer />
    </Box>
  );
}

export default StaffLogin;
