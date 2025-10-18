// src/components/CropSpoilageForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container, TextField, Button, Typography, Box,
  CircularProgress, Paper, List, ListItem, Chip
} from "@mui/material";

export default function CropSpoilageForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // Restore summary if coming from detail page state
  const [summary, setSummary] = useState(location.state || null);

  const [form, setForm] = useState({
    cropType: "",
    amountKg: "",
    warehouseSizeSqm: "",
    city: "",
    manufactureDate: "",
    expiryDate: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // UPDATED: Save prediction request/result after prediction
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSummary(null);

    try {
      const res = await axios.post("http://localhost:5000/api/predictions", form);

      // Create enhanced summary with form dates explicitly included
      const fullSummary = {
        ...res.data,
        manufactureDate: form.manufactureDate,
        originalExpiryDate: form.expiryDate
      };

      setSummary(fullSummary);

      // ✅ Save both request and prediction to backend
      await axios.post("http://localhost:5000/api/saveRequest", {
        ...form,
        predictionResult: res.data
      });

    } catch (err) {
      console.error("❌ Prediction request failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helpers to classify reasons
  const increasingReasons = summary?.adjustmentReasons?.filter(r =>
    r.toLowerCase().includes("extended") || r.toLowerCase().includes("increase")
  ) || [];

  const decreasingReasons = summary?.adjustmentReasons?.filter(r =>
    r.toLowerCase().includes("reduced") || r.toLowerCase().includes("decrease")
  ) || [];

  // Debugging to check summary data
  console.log("CropSpoilageForm summary state:", summary);

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      {/* Form */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom color="primary">
          🌾 Quick Crop Storage Check
        </Typography>

        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
          sx={{ display: "grid", gap: 2 }}
        >
          <TextField
            label="Crop Type"
            name="cropType"
            value={form.cropType}
            onChange={handleChange}
            required
          />
          <TextField
            label="Amount (kg)"
            type="number"
            name="amountKg"
            value={form.amountKg}
            onChange={handleChange}
            required
          />
          <TextField
            label="Warehouse Size (sqm)"
            type="number"
            name="warehouseSizeSqm"
            value={form.warehouseSizeSqm}
            onChange={handleChange}
            required
          />
          <TextField
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
          />
          <TextField
            label="Manufacture Date"
            type="date"
            name="manufactureDate"
            value={form.manufactureDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Expiry Date (Supplier)"
            type="date"
            name="expiryDate"
            value={form.expiryDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Get Summary"}
          </Button>
        </Box>
      </Paper>

      {/* Summary Section */}
      {summary && (
        <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" color="primary">
            📊 Summary
          </Typography>
          <Typography>Temperature: {summary.temp}°C</Typography>
          <Typography>Humidity: {summary.humidity}%</Typography>
          <Typography>Predicted Expiry: {summary.predictedExpiry}</Typography>
          <Typography>Risk: {summary.riskLevel}</Typography>

          {/* Increasing reasons */}
          <Typography
            variant="subtitle1"
            sx={{ color: "green", fontWeight: 600, mt: 2 }}
          >
            Increasing Shelf Life
          </Typography>
          <List>
            {increasingReasons.length > 0 ? (
              increasingReasons.map((reason, idx) => (
                <ListItem key={idx}>
                  <Chip label={reason} color="success" variant="outlined" />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ pl: 2 }}>
                None
              </Typography>
            )}
          </List>

          {/* Decreasing reasons */}
          <Typography
            variant="subtitle1"
            sx={{ color: "red", fontWeight: 600, mt: 2 }}
          >
            Decreasing Shelf Life
          </Typography>
          <List>
            {decreasingReasons.length > 0 ? (
              decreasingReasons.map((reason, idx) => (
                <ListItem key={idx}>
                  <Chip label={reason} color="error" variant="outlined" />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ pl: 2 }}>
                None
              </Typography>
            )}
          </List>

          {/* Recommendations */}
          {summary.suggestions?.length > 0 && (
            <>
              <Typography variant="subtitle1" color="success" sx={{ mt: 2 }}>
                Recommendations
              </Typography>
              <List>
                {summary.suggestions.map((s, i) => (
                  <ListItem key={i}>
                    <Chip label={s} color="success" />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/details", { state: summary })}
            >
              View Full Details
            </Button>
            <Button
              variant="outlined"
              sx={{ ml: 2 }}
              onClick={() => navigate("/warehouse/dashboard")}
            >
              Back to Warehouse Dashboard
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}
