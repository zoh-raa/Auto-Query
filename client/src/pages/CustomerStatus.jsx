import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import StaffSidebar from '../components/StaffSidebar';
import axios from 'axios';

const CustomerStatus = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [chartUrl, setChartUrl] = useState('');

  if (!state || !state.user) {
    return <Typography>No data provided.</Typography>;
  }

  const { user } = state;

useEffect(() => {
  const fetchLoginData = async () => {
    try {
      const res = await axios.get(`/api/customer/login-history/${user.id}`);
      const { login_count, monthly_logins } = res.data;

      // Optionally update login count if you want to override what's in `user.login_count`
      // setLoginCount(login_count);

      const chartConfig = {
        type: 'line',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
          datasets: [{
            label: 'Logins',
            data: monthly_logins
          }]
        }
      };

      const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
      setChartUrl(`https://quickchart.io/chart?c=${encodedConfig}`);
    } catch (err) {
      console.error('Failed to load login history:', err);
    }
  };

  fetchLoginData();
}, [user.id]);

  return (
    <Box display="flex" minHeight="100vh" bgcolor="#f2f4f7">
      <StaffSidebar />
      <Box flexGrow={1} p={4}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          USER {user.name}'s Account Status
        </Typography>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>Email: {user.email}</Typography>
          <Typography variant="subtitle1" gutterBottom>Login Count: {user.login_count}</Typography>
          <Typography variant="subtitle1" gutterBottom>
            Inactivity Likelihood: {user.likelihood}%
          </Typography>
          <Typography variant="body2" color="warning.main">
            ⚠️ Account is {user.likelihood}% likely to be deactivated.
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Login Trends</Typography>
          {chartUrl ? (
            <img src={chartUrl} alt="Login Chart" style={{ maxWidth: '100%', height: 'auto' }} />
          ) : (
            <Typography>Loading chart...</Typography>
          )}
        </Paper>

        <Box display="flex" gap={2}>
          <Button variant="outlined" color="primary" onClick={() => navigate(-1)}>
            Back to Dashboard
          </Button>
          {user.likelihood >= 70 && (
            <Button variant="contained" color="warning">
              Send check-in email
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CustomerStatus;
