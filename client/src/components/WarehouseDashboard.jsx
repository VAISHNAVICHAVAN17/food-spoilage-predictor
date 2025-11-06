// src/components/WarehouseDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { Science, Inventory2, LocalShipping } from '@mui/icons-material';

export default function WarehouseDashboard() {
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" color="primary" gutterBottom>
        👨‍🌾 Warehouse Dashboard
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
        Welcome! Choose an option below to manage your warehouse efficiently.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', py: 4 }}>
            <Science sx={{ fontSize: 40, color: 'primary.main' }} />
            <CardContent>
              <Button variant="contained" component={Link} to="/predict" fullWidth>
                Spoilage Predictor
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', py: 4 }}>
            <Inventory2 sx={{ fontSize: 40, color: 'secondary.main' }} />
            <CardContent>
              <Button variant="outlined" component={Link} to="/warehouse/inventory" fullWidth>
                Inventory Management
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', py: 4 }}>
            <LocalShipping sx={{ fontSize: 40, color: 'info.main' }} />
            <CardContent>
              <Button variant="outlined" color="info" component={Link} to="/warehouse/ImportExportDashboard" fullWidth>
                Import & Export
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}