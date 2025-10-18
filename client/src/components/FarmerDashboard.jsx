// src/components/FarmerDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { Assignment, Timeline, SmartToy } from '@mui/icons-material';

export default function FarmerDashboard() {
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" color="primary" gutterBottom>
        👨‍🌾 Farmer Dashboard
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
        Welcome! Choose an option to manage your farm efficiently.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', py: 4 }}>
            <Assignment sx={{ fontSize: 40, color: 'primary.main' }} />
            <CardContent>
              <Button variant="contained" component={Link} to="/cropform" fullWidth>
                Fill Crop Details
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', py: 4 }}>
            <Timeline sx={{ fontSize: 40, color: 'secondary.main' }} />
            <CardContent>
              <Button variant="outlined" component={Link} to="/croptracker" fullWidth>
                View Crop Tracker
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', py: 4 }}>
            <SmartToy sx={{ fontSize: 40, color: 'info.main' }} />
            <CardContent>
              <Button variant="outlined" color="info" component={Link} to="/helpbot" fullWidth>
                Ask Farm Helper Bot
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
