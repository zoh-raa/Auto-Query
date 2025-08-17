// client/src/components/ForgotPasswordFlow.jsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Stack, Divider, Tabs, Tab } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../https';
import { ToastContainer, toast } from 'react-toastify';

export default function ForgotPasswordFlow({ role = 'customer', onBack, onRevealStaffId, onResetComplete }) {
  const [step, setStep] = useState('request'); // request | otp | reset | done
  const [identifier, setIdentifier] = useState(''); // email for customers, phone for staff
  const [resetToken, setResetToken] = useState('');
  const [staffTab, setStaffTab] = useState(0); // 0 reset, 1 reveal (staff-only)

  const isStaff = role === 'staff';
  const purpose = isStaff ? (staffTab === 0 ? 'reset_password' : 'reveal_staff_id') : 'reset_password';

  const endpoints = isStaff
    ? {
        request: '/staff/recovery/request',
        verify: '/staff/recovery/verify',
        reset: '/staff/password/reset',
        label: 'Phone number',
        field: 'phone'
      }
    : {
        request: '/customer/forgot-password',
        verify: '/customer/verify-otp',
        reset: '/customer/reset-password',
        label: 'Email',
        field: 'email'
      };

  // Step 1: request OTP
  const requestForm = useFormik({
    initialValues: { identifier: '' },
    validationSchema: yup.object({
      identifier: isStaff
        ? yup.string().required('Phone number is required')
        : yup.string().email('Enter a valid email').required('Email is required')
    }),
    onSubmit: async (v) => {
      const val = v.identifier.trim();
      try {
        await http.post(endpoints.request, { [endpoints.field]: val, purpose });
        setIdentifier(val);
        toast.success(`If ${endpoints.label.toLowerCase()} exists, a code was sent`);
        setStep('otp');
      } catch {
        toast.error('Something went wrong');
      }
    }
  });

  // Step 2: verify OTP
  const otpForm = useFormik({
    initialValues: { otp: '' },
    validationSchema: yup.object({
      otp: yup.string().matches(/^\d{6}$/, 'Enter the 6 digit code').required('OTP is required')
    }),
    onSubmit: async (v) => {
      try {
        // Send both "code" and "otp" to be compatible with either backend naming
        const res = await http.post(endpoints.verify, {
          [endpoints.field]: identifier,
          purpose,
          otp: v.otp.trim(),
          code: v.otp.trim()
        });

        // If we are revealing Staff ID
       if (isStaff && purpose === 'reveal_staff_id') {
        const id = res?.data?.staff_id;
        if (!id) return toast.error('Could not retrieve Staff ID');
        onRevealStaffId?.(id);
        // After showing Staff ID, redirect to staff login
        return;
      }


        // Otherwise it's a password reset flow
        const token = res?.data?.resetToken;
        if (!token) return toast.error('Could not start password reset');
        setResetToken(token);
        toast.success('Code verified');
        setStep('reset');
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Invalid or expired code');
      }
    }
  });

  // Step 3: reset password (only for password flow)
  const resetForm = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: yup.object({
      newPassword: yup.string().min(8, 'At least 8 characters').required('Required'),
      confirmPassword: yup.string().oneOf([yup.ref('newPassword')], 'Passwords must match').required('Required')
    }),
    onSubmit: async (v) => {
      try {
            await http.post(endpoints.reset, { 
        resetToken, 
        newPassword: v.newPassword.trim(),
        confirmPassword: v.confirmPassword.trim()
      });
      toast.success('Password changed successfully');
      setStep('done');
      setTimeout(() => {
        if (isStaff) {
          // staff → back to staff login
          onResetComplete ? onResetComplete('staff') : onBack?.('staff');
        } else {
          // customer → back to customer login
          onResetComplete ? onResetComplete('customer') : onBack?.('customer');
        }
      }, 1200);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Could not reset password');
      }
    }
  });

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Button size="small" onClick={onBack}>Back to login</Button>
        <Typography variant="h6" fontWeight="bold">Help with your account</Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      {/* Staff-only: choose Reset Password vs Find Staff ID */}
      {isStaff && step === 'request' && (
        <Tabs value={staffTab} onChange={(_e, v) => { setStaffTab(v); setStep('request'); }}>
          <Tab label="Reset Password (SMS)" />
          <Tab label="Find my Staff ID (SMS)" />
        </Tabs>
      )}

      {step === 'request' && (
        <form onSubmit={requestForm.handleSubmit}>
          <TextField
            fullWidth label={endpoints.label} name="identifier"
            value={requestForm.values.identifier}
            onChange={requestForm.handleChange} onBlur={requestForm.handleBlur}
            error={requestForm.touched.identifier && Boolean(requestForm.errors.identifier)}
            helperText={requestForm.touched.identifier && requestForm.errors.identifier}
            sx={{ mt: isStaff ? 2 : 0 }}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            {isStaff
              ? (staffTab === 0 ? 'Send SMS code to reset password' : 'Send SMS code to reveal Staff ID')
              : 'Send reset email'}
          </Button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={otpForm.handleSubmit}>
          <Typography sx={{ mb: 1 }}>
            Enter the 6 digit code sent to <b>{identifier}</b>.
          </Typography>
          <TextField
            fullWidth label="Verification code" name="otp"
            value={otpForm.values.otp}
            onChange={otpForm.handleChange} onBlur={otpForm.handleBlur}
            error={otpForm.touched.otp && Boolean(otpForm.errors.otp)}
            helperText={otpForm.touched.otp && otpForm.errors.otp}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" fullWidth>Verify</Button>
            <Button
              onClick={async () => {
                try {
                  await http.post(endpoints.request, { [endpoints.field]: identifier, purpose });
                  toast.info('New code sent');
                } catch {
                  toast.error('Could not resend code');
                }
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
