import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container, Paper, Typography, TextField, Button, Box, Stack,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";

const initialFormState = {
  cropName: "",
  cropStage: "",
  soilType: "",
  pesticideUsed: "",
  irrigationType: "",
  fertilizerUsed: "",
  currentIssues: "",
  durationDays: "",
};

export default function CropForm() {
  const [form, setForm] = useState(initialFormState);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLast = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/crop/user/${userId}`);
        const history = res.data;
        if (history.length) {
          const last = history[history.length - 1];
          setForm({
            cropName: last.cropName || "",
            cropStage: last.cropStage || "",
            soilType: last.soilType || "",
            pesticideUsed: last.pesticideUsed || "",
            irrigationType: last.irrigationType || "",
            fertilizerUsed: last.fertilizerUsed || "",
            currentIssues: last.currentIssues || "",
            durationDays: "",
          });
        }
      } catch {
        // Ignore fetch errors
      }
    };
    fetchLast();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("Login required!");
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(form.durationDays));
    try {
      await axios.post("http://localhost:5000/api/crop/submit", {
        ...form,
        durationDays: form.durationDays,
        userId,
        startDate,
        endDate,
      });
      setForm(initialFormState);    // Clear fields
      navigate("/farmer/dashboard");       // Redirect to dashboard
    } catch {
      alert("Error submitting crop data.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 7 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" color="primary" gutterBottom>
          🌱 Crop Details Form
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            <TextField
              label="Crop Name"
              name="cropName"
              value={form.cropName}
              onChange={handleChange}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel id="crop-stage-label">Crop Stage</InputLabel>
              <Select
                labelId="crop-stage-label"
                name="cropStage"
                value={form.cropStage}
                onChange={handleChange}
                label="Crop Stage"
              >
                <MenuItem value=""><em>Select Crop Stage</em></MenuItem>
                <MenuItem value="germination">Germination</MenuItem>
                <MenuItem value="flowering">Flowering</MenuItem>
                <MenuItem value="harvesting">Harvesting</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel id="soil-type-label">Soil Type</InputLabel>
              <Select
                labelId="soil-type-label"
                name="soilType"
                value={form.soilType}
                onChange={handleChange}
                label="Soil Type"
              >
                <MenuItem value=""><em>Select Soil Type</em></MenuItem>
                <MenuItem value="loamy">Loamy</MenuItem>
                <MenuItem value="clay">Clay</MenuItem>
                <MenuItem value="sandy">Sandy</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Expected Duration (days)"
              name="durationDays"
              type="number"
              inputProps={{ min: 1 }}
              value={form.durationDays}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Last Pesticide Used"
              name="pesticideUsed"
              value={form.pesticideUsed}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Irrigation Type"
              name="irrigationType"
              value={form.irrigationType}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Fertilizer Used"
              name="fertilizerUsed"
              value={form.fertilizerUsed}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Any Current Issues"
              name="currentIssues"
              value={form.currentIssues}
              onChange={handleChange}
              multiline
              rows={2}
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              Submit Crop Details
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
