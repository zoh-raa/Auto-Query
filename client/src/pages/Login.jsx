import React, { useContext } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../https';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../contexts/UserContext';

function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: yup.object({
            email: yup
                .string()
                .trim()
                .email('Enter a valid email')
                .max(50, 'Email must be at most 50 characters')
                .required('Email is required'),
            password: yup
                .string()
                .trim()
                .min(8, 'Password must be at least 8 characters')
                .max(50, 'Password must be at most 50 characters')
                .required('Password is required'),
        }),
        onSubmit: async (data) => {
            console.log('🚀 Submitting login with:', data);
            alert('Login form submitted'); // You can remove this once it works

            data.email = data.email.trim().toLowerCase();
            data.password = data.password.trim();

            try {
                const res = await http.post('/user/login', data);
                localStorage.setItem('accessToken', res.data.accessToken);
                setUser(res.data.user);
                toast.success('Login successful!');
                navigate('/');
            } catch (err) {
                console.error('❌ Login error:', err);
                toast.error(
                    err?.response?.data?.message || 'Something went wrong. Try again.'
                );
            }
        },
    });

    return (
        <Box sx={{
            backgroundColor: '#fffff',
            minHeight: '100vh',
            paddingTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>

            <Typography variant="h5" sx={{ my: 2 }}>
                Login
            </Typography>
            <Box
                component="form"
                sx={{ maxWidth: '500px', width: '100%' }}
                onSubmit={formik.handleSubmit}
            >
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
                        mt: 2,
                        backgroundColor: '#888',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: '#666'
                        }
                    }}
                >
                    Login
                </Button>

            </Box>

            {/* Show Formik Validation Errors */}


            <ToastContainer />
        </Box>
    );
}

export default Login;
