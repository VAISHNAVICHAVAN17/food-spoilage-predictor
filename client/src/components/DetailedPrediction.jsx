// src/components/DetailedPrediction.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container, Paper, Typography, Button, Divider,
  Box, Grid, Table, TableBody, TableRow, TableCell, List, ListItem, ListItemIcon, ListItemText
} from "@mui/material";
import { Checklist, TrendingUp, TrendingDown, Info, CalendarMonth } from "@mui/icons-material";

export default function DetailedPrediction() {
  const { state: data } = useLocation();
  const navigate = useNavigate();

  if (!data) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <Typography>No prediction data found.</Typography>
        <Button variant="contained" onClick={() => navigate("/")}>Back to Home</Button>
      </Container>
    );
  }

  // Utility to format date strings to local date format or fallback to "N/A"
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const dateObj = new Date(dateString);
    if (isNaN(dateObj)) return "N/A";
    return dateObj.toLocaleDateString();
  };

  // Classify reasons
  const increasingReasons = data.adjustmentReasons?.filter(r =>
    r.toLowerCase().includes('extended') || r.toLowerCase().includes('increase')
  ) || [];

  const decreasingReasons = data.adjustmentReasons?.filter(r =>
    r.toLowerCase().includes('reduced') || r.toLowerCase().includes('decrease')
  ) || [];

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 700 }}>
          📊 Detailed Crop Prediction Report
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* General Info */}
        <Typography variant="h6" sx={{ mb: 2 }}>Crop & Environmental Details</Typography>
        <Table size="small" sx={{ mb: 3 }}>
          <TableBody>
            <TableRow>
              <TableCell><b>Crop</b></TableCell>
              <TableCell>{data.cropType || "N/A"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><b>Quantity</b></TableCell>
              <TableCell>{data.amountKg ? `${data.amountKg} kg` : "N/A"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><b>Warehouse Size</b></TableCell>
              <TableCell>{data.warehouseSizeSqm ? `${data.warehouseSizeSqm} sqm` : "N/A"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><b>City</b></TableCell>
              <TableCell>{data.city || "N/A"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><b>Manufactured Date</b></TableCell>
              <TableCell>{formatDate(data.manufactureDate)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><b>Supplier Expiry Date</b></TableCell>
              <TableCell>{formatDate(data.originalExpiryDate) !== "N/A" ? formatDate(data.originalExpiryDate) : formatDate(data.expiryDate)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><b>Predicted Expiry Date</b></TableCell>
              <TableCell><b style={{ color: "#b71c1c" }}>{formatDate(data.predictedExpiry)}</b></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><b>Temperature</b></TableCell>
              <TableCell>{data.temp != null ? `${data.temp} °C` : "N/A"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><b>Humidity</b></TableCell>
              <TableCell>{data.humidity != null ? `${data.humidity} %` : "N/A"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><b>Storage Density</b></TableCell>
              <TableCell>{data.storageDensity != null ? data.storageDensity : "N/A"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><b>Risk Level</b></TableCell>
              <TableCell>
                <Typography
                  sx={{
                    color:
                      data.riskLevel === "High"
                        ? "error.main"
                        : data.riskLevel === "Moderate"
                        ? "orange"
                        : "green",
                    fontWeight: 600,
                  }}
                >
                  {data.riskLevel || "N/A"}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Reasons */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: "green", mb: 1 }}>
                <TrendingUp fontSize="small" sx={{ mr: 1 }} /> Factors Increasing Shelf Life
              </Typography>
              {increasingReasons.length ? (
                <List dense>
                  {increasingReasons.map((reason, idx) => (
                    <ListItem key={idx}>
                      <ListItemText primary={reason} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">No factors increased shelf life.</Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: "red", mb: 1 }}>
                <TrendingDown fontSize="small" sx={{ mr: 1 }} /> Factors Decreasing Shelf Life
              </Typography>
              {decreasingReasons.length ? (
                <List dense>
                  {decreasingReasons.map((reason, idx) => (
                    <ListItem key={idx}>
                      <ListItemText primary={reason} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">No factors decreased shelf life.</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Recommendations */}
        {data.suggestions?.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" color="success.main" sx={{ fontWeight: 600, mb: 1 }}>
              <Checklist fontSize="small" sx={{ mr: 1 }} /> Recommendations
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <List dense>
                {data.suggestions.map((s, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={s} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}

        {/* Back Button */}
        <Box sx={{ mt: 4, textAlign: "right" }}>
          <Button variant="outlined" onClick={() => navigate("/predict", { state: data })}>
            Back to Summary
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
