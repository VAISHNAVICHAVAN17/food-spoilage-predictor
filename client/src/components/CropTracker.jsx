import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import { Chrono } from "react-chrono";

function CropTracker() {
  const [cropHistory, setCropHistory] = useState([]);
  const userId = localStorage.getItem("userId");

  const fetchCrops = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/crop/user/${userId}`);
      setCropHistory(res.data);
    } catch (err) {
      alert("Unable to load crop data.");
    }
  };

  useEffect(() => {
    if (userId) fetchCrops();
  }, [userId]);

  const handleDeleteAll = async () => {
    if (!window.confirm("⚠️ Delete ALL history?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/crop/delete-all/${userId}`);
      fetchCrops();
    } catch (err) {
      alert("Error deleting entries.");
    }
  };

  const handleDeleteOne = async (id) => {
    if (!window.confirm("Are you sure to delete this completed task?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/crop/delete/${id}`);
      fetchCrops();
    } catch  (err) {
      alert("Failed to delete task.");
    }
  };

  const handleReschedule = async (crop) => {
    const newStart = prompt("Enter new start date (YYYY-MM-DD):", crop.startDate?.slice(0, 10));
    const newEnd = prompt("Enter new end date (YYYY-MM-DD):", crop.endDate?.slice(0, 10));
    if (!newStart || !newEnd) return;
    try {
      await axios.put(`http://localhost:5000/api/crop/reschedule/${crop._id}`, {
        startDate: newStart,
        endDate: newEnd,
      });
      fetchCrops();
    } catch (err) {
      alert("Error while rescheduling.");
    }
  };

  const items = cropHistory.map((crop) => {
    const start = new Date(crop.startDate);
    const end = new Date(crop.endDate);
    const now = new Date();
    const isComplete = now > end;
    const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

    return {
      title: start.toLocaleDateString(),
      cardTitle: `${crop.cropName}`,
      cardSubtitle: `Stage: ${crop.cropStage}`,
      cardDetailedText: [
        `📅 Start Date: ${start.toLocaleDateString()}`,
        `📅 End Date: ${end.toLocaleDateString()}`,
        `📆 Days Remaining: ${daysLeft}`,
        `🧪 Soil Type: ${crop.soilType}`,
        `💧 Irrigation: ${crop.irrigationType}`,
        `🧴 Pesticide: ${crop.pesticideUsed || "N/A"}`,
        `🌿 Fertilizer: ${crop.fertilizerUsed || "N/A"}`,
        `⚠️ Issues: ${crop.currentIssues || "None"}`
      ],
      content: isComplete ? (
        <div className="d-flex gap-2 mt-2">
          <Button variant="warning" size="sm" onClick={() => handleReschedule(crop)}>
            🔁 Reschedule
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDeleteOne(crop._id)}>
            🗑️ Delete
          </Button>
        </div>
      ) : null,
    };
  });

  return (
    <Container className="py-5">
      <Card className="shadow-lg">
        <Card.Body>
          <Row>
            <Col>
              <h2 className="text-success mb-3">🌱 Crop Growth Tracker</h2>
            </Col>
            <Col xs="auto">
              {cropHistory.length > 0 && (
                <Button variant="outline-danger" onClick={handleDeleteAll}>
                  🚨 Delete All Entries
                </Button>
              )}
            </Col>
          </Row>
          {items.length === 0 ? (
            <div className="text-muted text-center my-5">No crop history available.</div>
          ) : (
            <div style={{ width: "100%", height: "600px" }}>
              <Chrono
                items={items}
                mode="VERTICAL"
                slideShow
                allowDynamicUpdate
                scrollable
                theme={{
                  primary: "green",
                  secondary: "lightgreen",
                  cardBgColor: "#f9f9f9",
                  cardForeColor: "black",
                  titleColor: "#2f855a",
                  titleColorActive: "#276749",
                }}
              />
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default CropTracker;
