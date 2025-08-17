// client/src/pages/SecurityLogs.jsx
import React, { useEffect, useMemo, useState, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Tooltip, Stack, Pagination
} from '@mui/material';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';
import StaffSidebar from '../components/StaffSidebar';
import {
  GoogleMap,
  useJsApiLoader,
   Marker
} from '@react-google-maps/api';
const LIBRARIES = ['places']; 

const SecurityLogs = () => {
  const [securityLogs, setSecurityLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const logsPerPage = 5;
  const navigate = useNavigate();
  const { user } = useContext(UserContext);


  // 1) Fetch logs
  useEffect(() => {
    axios.get('http://localhost:3001/staff/security-logs', {
      headers: { Authorization: `Bearer ${localStorage.getItem('staffAccessToken')}` }
    })
      .then(res => setSecurityLogs(res.data || []))
      .catch(err => {
        console.error("❌ Failed to fetch security logs:", err?.response?.data || err.message);
        navigate('/login');
      });
  }, [navigate]);

  // 2) Pagination
  const totalPages = Math.ceil(securityLogs.length / logsPerPage) || 1;
  const startIdx = (currentPage - 1) * logsPerPage;
  const currentLogs = securityLogs.slice(startIdx, startIdx + logsPerPage);

  // 3) Google Maps loader
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  // 4) Build markers directly from backend coords
  const markers = useMemo(() => {
    return (securityLogs || [])
      .filter(l => typeof l.latitude === 'number' && typeof l.longitude === 'number')
      .map((l, idx) => ({
        id: `${l.id ?? idx}-${l.email ?? 'unknown'}`,
        position: { lat: l.latitude, lng: l.longitude },
        email: l.email,
        ip: l.ip,
        device: l.device,
        location: l.location,
        anomaly: l.anomaly_score,
        createdAt: l.createdAt
      }));
  }, [securityLogs]);

  // 5) Map state and helpers
  const mapRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    if (markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach(m => bounds.extend(m.position));
      map.fitBounds(bounds, 80);
    } else {
      map.setZoom(2);
      map.setCenter({ lat: 20, lng: 0 });
    }
  }, [markers]);

  const onMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  return (
    <Box display="flex" minHeight="100vh">
      <StaffSidebar />

      <Box flexGrow={1} p={4} bgcolor="#f2f4f7">
        <Typography variant="h5" gutterBottom>Login Attempts</Typography>

        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f9f9f9' }}>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Device</TableCell>
                <TableCell>Anomaly Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentLogs.map((log, i) => {
                const isHigh = log.anomaly_score === 'High';
                return (
                  <TableRow key={i} sx={{ backgroundColor: isHigh ? '#fddede' : 'transparent' }}>
                    <TableCell>{log.email}</TableCell>
                    <TableCell>{log.ip}</TableCell>
                    <TableCell>{log.location}</TableCell>
                    <TableCell>{log.device}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2">{log.anomaly_score}</Typography>
                        {isHigh && (
                          <Tooltip title="High anomaly detected">
                            <WarningAmberOutlinedIcon color="error" />
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box mt={2} display="flex" justifyContent="center">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}

        {/* Map below the table */}
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>Login locations</Typography>

          {isLoaded ? (
            <Box sx={{ height: 420, width: '100%', borderRadius: 12, overflow: 'hidden', boxShadow: 1 }}>
           
<GoogleMap
  mapContainerStyle={{ width: '100%', height: '100%' }}
  onLoad={(map) => {
    mapRef.current = map;

    // Create bounds to fit markers
    if (markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();

      markers.forEach((m) => {
        const advMarker = new window.google.maps.marker.AdvancedMarkerElement({
          position: m.position,
          map,
          title: m.email || "Login Attempt",
        });

        // InfoWindow on click
        advMarker.addListener("click", () => {
          new window.google.maps.InfoWindow({
            content: `
              <div style="max-width:200px;">
                <b>${m.email}</b><br/>
                IP: ${m.ip}<br/>
                Device: ${m.device || 'N/A'}<br/>
                Location: ${m.location || 'Unknown'}
              </div>
            `,
          }).open(map, advMarker);
        });

        bounds.extend(m.position);
      });

      map.fitBounds(bounds, 80);
    } else {
      map.setZoom(2);
      map.setCenter({ lat: 20, lng: 0 });
    }
  }}
  onUnmount={() => (mapRef.current = null)}
  options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: true }}
>
  {/* ⛔️ Notice: No <Marker /> here anymore */}
</GoogleMap>



            </Box>
          ) : (
            <Typography variant="body2">Loading map…</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SecurityLogs;
