import React, { useState, useEffect, useContext } from "react";
import { getBatches } from "../services/batchService";
import { addImportExport, getImportExportRecords } from "../services/importExportService";
import AuthContext from "../context/AuthContext";

const ImportExportDashboard = () => {
  const { user } = useContext(AuthContext);
  const [batches, setBatches] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [form, setForm] = useState({
    type: "import",
    quantity: "",
    movementDate: "",
    party: "",
  });
  const [message, setMessage] = useState(null);

  // Use user.userId for fetching batches and records
  useEffect(() => {
    if (user && user.userId) {
      getBatches(user.userId)
        .then((data) => setBatches(data || []))
        .catch(console.error);
      getImportExportRecords()
        .then(setRecords)
        .catch(console.error);
    }
  }, [user]);

  const selectedBatch =
    batches && batches.length > 0
      ? batches.find((batch) => batch._id === selectedBatchId)
      : null;

  if (!user || !user.userId) {
    return <p>Loading user data...</p>;
  }

  const handleBatchChange = (e) => {
    setSelectedBatchId(e.target.value);
    setMessage(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!selectedBatchId) return setMessage("Please select a batch!");
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0) {
      return setMessage("Enter a valid positive quantity.");
    }
    if (!form.movementDate) return setMessage("Please select movement date.");

    try {
      const payload = {
        batchId: selectedBatchId,
        type: form.type,
        quantity: Number(form.quantity),
        movementDate: new Date(form.movementDate),
        party: form.party,
      };
      await addImportExport(payload);
      setMessage("Movement recorded!");
      getImportExportRecords().then(setRecords);
      getBatches(user.userId).then((data) => setBatches(data || [])); // <-- PATCHED!
      setForm({ ...form, quantity: "", movementDate: "", party: "" });
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to record movement."
      );
    }
  };

  return (
    <div className="container mt-4">
      <h3>Import/Export Entry</h3>
      <div className="card p-3 mb-4">
        <h5>Current Inventory Batch</h5>
        <select
          className="form-control mb-3"
          value={selectedBatchId}
          onChange={handleBatchChange}
        >
          <option value="">Select Batch</option>
          {batches.map((batch) => (
            <option key={batch._id} value={batch._id}>
              {batch.batchNumber} — {batch.cropName}
            </option>
          ))}
        </select>
        {selectedBatch ? (
          <ul>
            <li>
              <strong>Batch Number:</strong> {selectedBatch.batchNumber}
            </li>
            <li>
              <strong>Crop Name:</strong> {selectedBatch.cropName}
            </li>
            <li>
              <strong>Quantity Available (Tons):</strong>{" "}
              {selectedBatch.quantityAvailable}
            </li>
            <li>
              <strong>Warehouse Location:</strong> {selectedBatch.warehouseLocation}
            </li>
          </ul>
        ) : (
          <div className="alert alert-warning">
            No batch selected. Please select a batch above.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-3">
          <label className="form-label">Type</label>
          <select
            name="type"
            className="form-control"
            value={form.type}
            onChange={handleChange}
          >
            <option value="import">Import (Add Stock)</option>
            <option value="export">Export (Remove Stock)</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Quantity (Tons)</label>
          <input
            type="number"
            name="quantity"
            className="form-control"
            value={form.quantity}
            onChange={handleChange}
            required
            min="0.01"
            step="0.01"
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Movement Date</label>
          <input
            type="date"
            name="movementDate"
            className="form-control"
            value={form.movementDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Supplier / Customer</label>
          <input
            type="text"
            name="party"
            className="form-control"
            value={form.party}
            onChange={handleChange}
          />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-success">
            Record Movement
          </button>
        </div>
        {message && (
          <div className="col-12 mt-2">
            <div
              className={`alert alert-${
                message.includes("Failed") || message.includes("Please")
                  ? "danger"
                  : "success"
              }`}
            >
              {message}
            </div>
          </div>
        )}
      </form>

      <h4>History</h4>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Batch</th>
            <th>Type</th>
            <th>Quantity (Tons)</th>
            <th>Movement Date</th>
            <th>Supplier / Customer</th>
          </tr>
        </thead>
        <tbody>
          {records
            .filter((rec) => rec.batchId && batches.some((b) => b._id === rec.batchId._id))
            .map((rec, idx) => (
              <tr key={idx}>
                <td>{rec.batchId?.batchNumber}</td>
                <td>{rec.type}</td>
                <td>{rec.quantity}</td>
                <td>{rec.movementDate && rec.movementDate.slice(0, 10)}</td>
                <td>{rec.party}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default ImportExportDashboard;
