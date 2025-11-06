import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container, TextField, Button, Typography, Box,
  CircularProgress, Paper, List, ListItem, Chip
} from "@mui/material";

import AuthContext from "../context/AuthContext";
import { getBatches } from "../services/batchService";

export default function CropSpoilageForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Restore summary if coming from detail page state
  const [summary, setSummary] = useState(location.state || null);

  const [inventoryBatch, setInventoryBatch] = useState(null);
  const [form, setForm] = useState({
    cropType: "",
    amountTons: "",      // We'll show/edit in tons
    warehouseSizeSqm: "",
    city: "",
    manufactureDate: "",
    expiryDate: ""
  });
  const [loading, setLoading] = useState(false);

  // Fetch latest batch/inventory for this user
  useEffect(() => {
    if (user && user.userId) {
      getBatches(user.userId)
        .then(data => {
          if (data.length > 0) {
            setInventoryBatch(data[0]);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  // Auto-populate form from inventory batch
  useEffect(() => {
    if (inventoryBatch) {
      setForm({
        cropType: inventoryBatch.cropName || "",
        amountTons: inventoryBatch.quantityAvailable || "", // Tons (stored as tons)
        warehouseSizeSqm: inventoryBatch.warehouseSizeSqm || "",
        city: inventoryBatch.warehouseLocation || "",
        manufactureDate: inventoryBatch.harvestDate ? inventoryBatch.harvestDate.slice(0, 10) : "",
        expiryDate: inventoryBatch.expiryDate ? inventoryBatch.expiryDate.slice(0, 10) : ""
      });
    }
  }, [inventoryBatch]);

  // Only allow editing "amountTons"
  const handleChange = (e) => {
    if (e.target.name === "amountTons") {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSummary(null);

    // Convert amountTons to kg before sending to predictor API
    const formToSend = {
      ...form,
      amountKg: Number(form.amountTons) * 1000,
      warehouseSizeSqm: form.warehouseSizeSqm,
      cropType: form.cropType,
      city: form.city,
      manufactureDate: form.manufactureDate,
      expiryDate: form.expiryDate
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/predictions/mlpredict",
        formToSend
      );

      const fullSummary = {
        ...res.data,
        manufactureDate: form.manufactureDate,
        originalExpiryDate: form.expiryDate
      };

      setSummary(fullSummary);

      // Save both request and prediction to backend (still sending amountKg for consistency)
      await axios.post("http://localhost:5000/api/saveRequest", {
        ...formToSend,
        predictionResult: res.data
      });
    } catch (err) {
      console.error("❌ Prediction request failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom color="primary">
          🌾 Quick Crop Spoilage Prediction Check
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
            required
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Amount (tons)"
            type="number"
            name="amountTons"
            value={form.amountTons}
            onChange={handleChange}
            required
          />
          <TextField
            label="Warehouse Size (sqm)"
            type="number"
            name="warehouseSizeSqm"
            value={form.warehouseSizeSqm}
            required
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="City"
            name="city"
            value={form.city}
            required
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Manufacture Date"
            type="date"
            name="manufactureDate"
            value={form.manufactureDate}
            InputLabelProps={{ shrink: true }}
            required
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Expiry Date (Supplier)"
            type="date"
            name="expiryDate"
            value={form.expiryDate}
            InputLabelProps={{ shrink: true }}
            required
            InputProps={{ readOnly: true }}
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
          <Typography>Temperature: {summary.temp ?? summary.temperature}°C</Typography>
          <Typography>Humidity: {summary.humidity}%</Typography>
          <Typography>Predicted Expiry: {summary.predictedExpiry ?? summary.predictedExpiryDate}</Typography>
          <Typography>Risk: {summary.riskLevel}</Typography>

          <Typography variant="subtitle2" sx={{ mt: 2 }}>Explanations:</Typography>
          {(summary.adjustmentReasons?.length > 0 || summary.suggestions?.length > 0) ? (
            <>
              {summary.adjustmentReasons?.length > 0 && (
                <List>
                  {summary.adjustmentReasons.map((reason, idx) => (
                    <ListItem key={idx}>
                      <Chip label={reason} color="info" variant="outlined" />
                    </ListItem>
                  ))}
                </List>
              )}
              {summary.suggestions?.length > 0 && (
                <List>
                  {summary.suggestions.map((sg, idx) => (
                    <ListItem key={idx}>
                      <Chip label={sg} color="primary" variant="outlined" />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Not available for ML-based prediction.
            </Typography>
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
