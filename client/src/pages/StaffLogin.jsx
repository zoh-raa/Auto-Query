import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function StaffLogin() {
  const navigate = useNavigate();

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
        toast.success('Login successful!');
        localStorage.setItem("accessToken", res.data.accessToken);
        navigate('/staff/dashboard');

      } catch (err) {
        console.error('❌ Staff login error:', err);
        toast.error(
          err?.response?.data?.message ||
          'Login failed. Please check your credentials.'
        );
      }
    }
  });

  return (
    <Box sx={{
      marginTop: 8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Typography variant="h5" sx={{ my: 2 }}>
        Staff Login
      </Typography>

      <Box component="form" sx={{ maxWidth: '500px', width: '100%' }}
        onSubmit={formik.handleSubmit}
      >
        <TextField
          fullWidth margin="dense"
          label="Staff ID"
          name="staff_id"
          value={formik.values.staff_id}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.staff_id && Boolean(formik.errors.staff_id)}
          helperText={formik.touched.staff_id && formik.errors.staff_id}
        />

        <TextField
          fullWidth margin="dense"
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
            mt: 2,
            backgroundColor: '#555',
            color: 'white',
            '&:hover': {
              backgroundColor: '#333'
            }
          }}
        >
          Login
        </Button>
      </Box>

      <ToastContainer />
    </Box>
  );
}

export default StaffLogin;
