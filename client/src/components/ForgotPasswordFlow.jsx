import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Stack, Divider } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../https';
import { ToastContainer, toast } from 'react-toastify';

export default function ForgotPasswordFlow({ onBack }) {
  const [step, setStep] = useState('request'); // request | otp | reset | done
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  const requestForm = useFormik({
    initialValues: { email: '' },
    validationSchema: yup.object({
      email: yup.string().email('Enter a valid email').required('Email is required')
    }),
    onSubmit: async (v) => {
      const e = v.email.trim().toLowerCase();
      try {
        await http.post('/customer/forgot-password', { email: e });
        setEmail(e);
        toast.success('If the email exists, an OTP has been sent');
        setStep('otp');
      } catch { toast.error('Something went wrong'); }
    }
  });

  const otpForm = useFormik({
    initialValues: { otp: '' },
    validationSchema: yup.object({
      otp: yup.string().matches(/^\d{6}$/, 'Enter the 6 digit code').required('OTP is required')
    }),
    onSubmit: async (v) => {
      try {
        const res = await http.post('/customer/verify-otp', { email, otp: v.otp });
        setResetToken(res.data.resetToken);
        toast.success('Code verified');
        setStep('reset');
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Invalid code');
      }
    }
  });

  const resetForm = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: yup.object({
      newPassword: yup.string().min(8, 'At least 8 characters').required('Required'),
      confirmPassword: yup.string().oneOf([yup.ref('newPassword')], 'Passwords must match').required('Required')
    }),
    onSubmit: async (v) => {
      try {
        await http.post('/customer/reset-password', {
          resetToken,
          newPassword: v.newPassword,
          confirmPassword: v.confirmPassword
        });
        toast.success('Password changed successfully');
        setStep('done');
        setTimeout(() => onBack?.(), 1800);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Could not reset password');
      }
    }
  });

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Button size="small" onClick={onBack}>Back to login</Button>
        <Typography variant="h6" fontWeight="bold">Reset your password</Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      {step === 'request' && (
        <form onSubmit={requestForm.handleSubmit}>
          <TextField
            fullWidth label="Email" name="email"
            value={requestForm.values.email}
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
            fullWidth label="Enter code" name="otp"
            value={otpForm.values.otp}
            onChange={otpForm.handleChange} onBlur={otpForm.handleBlur}
            error={otpForm.touched.otp && Boolean(otpForm.errors.otp)}
            helperText={otpForm.touched.otp && otpForm.errors.otp}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" fullWidth>Verify code</Button>
            <Button
              onClick={async () => {
                try { await http.post('/customer/forgot-password', { email }); toast.info('New code sent'); }
                catch { toast.error('Could not resend code'); }
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
            value={resetForm.values.newPassword}
            onChange={resetForm.handleChange} onBlur={resetForm.handleBlur}
            error={resetForm.touched.newPassword && Boolean(resetForm.errors.newPassword)}
            helperText={resetForm.touched.newPassword && resetForm.errors.newPassword}
          />
          <TextField
            sx={{ mt: 2 }} fullWidth type="password" label="Confirm password" name="confirmPassword"
            value={resetForm.values.confirmPassword}
            onChange={resetForm.handleChange} onBlur={resetForm.handleBlur}
            error={resetForm.touched.confirmPassword && Boolean(resetForm.errors.confirmPassword)}
            helperText={resetForm.touched.confirmPassword && resetForm.errors.confirmPassword}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            Change password
          </Button>
        </form>
      )}

      {step === 'done' && (
        <Typography>Password successfully changed. Returning to login.</Typography>
      )}

      <ToastContainer />
    </Box>
  );
}
