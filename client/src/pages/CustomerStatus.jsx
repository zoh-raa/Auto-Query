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
        const res = await axios.get(`http://localhost:3001/customer/login-history/${user.id}`);
        console.log("✅ API response:", res.data); // ✅ Step 1: log API data

        const { login_count, monthly_logins, start_month_index } = res.data;

        const allMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        // ✅ Step 2: Safe fallback for undefined or missing index
        const startIndex = typeof start_month_index === 'number'
          ? start_month_index
          : monthly_logins.findIndex(val => val > 0) ?? 0;

        const labels = allMonths.slice(startIndex);
        const data = monthly_logins.slice(startIndex);

        const chartConfig = {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Logins',
              data,
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              fill: true
            }]
          }
        };

        const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
        const chartLink = `https://quickchart.io/chart?c=${encodedConfig}`;
        console.log("🖼️ Chart URL:", chartLink); // ✅ Step 3: test in browser
        setChartUrl(chartLink);

      } catch (err) {
        console.error('❌ Failed to load login history:', err);
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
