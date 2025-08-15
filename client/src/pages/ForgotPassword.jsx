import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Divider, Stack } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../https';
import { ToastContainer, toast } from 'react-toastify';

export default function ForgotPassword() {
  const [step, setStep] = useState('request'); // request | otp | reset | done
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  // step 1
  const requestForm = useFormik({
    initialValues: { email: '' },
    validationSchema: yup.object({
      email: yup.string().email('Enter a valid email').required('Email is required')
    }),
    onSubmit: async (values) => {
      try {
        await http.post('/customer/forgot-password', { email: values.email.trim().toLowerCase() });
        setEmail(values.email.trim().toLowerCase());
        toast.success('If the email exists, an OTP has been sent');
        setStep('otp');
      } catch {
        toast.error('Something went wrong');
      }
    }
  });

  // step 2
  const otpForm = useFormik({
    initialValues: { otp: '' },
    validationSchema: yup.object({
      otp: yup.string().matches(/^\d{6}$/, 'Enter the 6 digit code').required('OTP is required')
    }),
    onSubmit: async (values) => {
      try {
        const res = await http.post('/customer/verify-otp', { email, otp: values.otp });
        setResetToken(res.data.resetToken);
        toast.success('Code verified');
        setStep('reset');
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Invalid code');
      }
    }
  });

  // step 3
  const resetForm = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: yup.object({
      newPassword: yup.string().min(8, 'At least 8 characters').required('Required'),
      confirmPassword: yup.string().oneOf([yup.ref('newPassword')], 'Passwords must match').required('Required')
    }),
    onSubmit: async (values) => {
      try {
        await http.post('/customer/reset-password', {
          resetToken,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword
        });
        toast.success('Password changed successfully');
        setStep('done');
        setTimeout(() => window.location.href = '/login', 2500);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Could not reset password');
      }
    }
  });

  return (
    <Box sx={{ backgroundColor: '#f4f6f9', minHeight: '100vh', py: 6 }}>
      <Paper elevation={4} sx={{ maxWidth: 500, m: '0 auto', p: 4 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
          Reset your password
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {step === 'request' && (
          <form onSubmit={requestForm.handleSubmit}>
            <TextField
              fullWidth label="Email" name="email" value={requestForm.values.email}
              onChange={requestForm.handleChange} onBlur={requestForm.handleBlur}
              error={requestForm.touched.email && Boolean(requestForm.errors.email)}
              helperText={requestForm.touched.email && requestForm.errors.email}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
              Send password reset email
            </Button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={otpForm.handleSubmit}>
            <Typography sx={{ mb: 1 }}>We sent a 6 digit code to {email}</Typography>
            <TextField
              fullWidth label="Enter code" name="otp" value={otpForm.values.otp}
              onChange={otpForm.handleChange} onBlur={otpForm.handleBlur}
              error={otpForm.touched.otp && Boolean(otpForm.errors.otp)}
              helperText={otpForm.touched.otp && otpForm.errors.otp}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" fullWidth>Verify code</Button>
              <Button
                onClick={async () => {
                  try {
                    await http.post('/customer/forgot-password', { email });
                    toast.info('New code sent');
                  } catch { toast.error('Could not resend code'); }
                }}
                fullWidth
              >
                Resend
              </Button>
            </Stack>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={resetForm.handleSubmit}>
            <TextField
              fullWidth type="password" label="New password" name="newPassword"
              value={resetForm.values.newPassword} onChange={resetForm.handleChange}
              onBlur={resetForm.handleBlur}
              error={resetForm.touched.newPassword && Boolean(resetForm.errors.newPassword)}
              helperText={resetForm.touched.newPassword && resetForm.errors.newPassword}
            />
            <TextField
              sx={{ mt: 2 }} fullWidth type="password" label="Confirm password" name="confirmPassword"
              value={resetForm.values.confirmPassword} onChange={resetForm.handleChange}
              onBlur={resetForm.handleBlur}
              error={resetForm.touched.confirmPassword && Boolean(resetForm.errors.confirmPassword)}
              helperText={resetForm.touched.confirmPassword && resetForm.errors.confirmPassword}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
              Change password
            </Button>
          </form>
        )}

        {step === 'done' && (
          <Box>
            <Typography>Password successfully changed. Redirecting to login.</Typography>
          </Box>
        )}
      </Paper>
      <ToastContainer />
    </Box>
  );
}
