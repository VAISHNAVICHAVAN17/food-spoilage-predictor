import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getBatches, addBatch, updateBatch } from "../services/batchService";
import "bootstrap/dist/css/bootstrap.min.css";

const WarehouseInventory = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [batch, setBatch] = useState(null);
  const [formData, setFormData] = useState({
    cropName: "",
    batchNumber: "",
    harvestDate: "",
    expiryDate: "",
    shelfLife: 0,
    quantityAvailable: 0,
    warehouseLocation: "",
    warehouseSizeSqm: "", // <-- NEW FIELD
    userId: null,
  });
  const [submitError, setSubmitError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [addQuantity, setAddQuantity] = useState("");
  const [removeQuantity, setRemoveQuantity] = useState("");

  const calculateShelfLife = (harvestDate, expiryDate) => {
    if (!harvestDate || !expiryDate) return 0;
    const diffTime = new Date(expiryDate) - new Date(harvestDate);
    return parseFloat((diffTime / (1000 * 60 * 60 * 24 * 365.25)).toFixed(2));
  };

  useEffect(() => {
    if (user && user.userId) {
      getBatches(user.userId)
        .then((data) => {
          if (data.length > 0) {
            const b = data[0];
            setBatch(b);
            setFormData({
              cropName: b.cropName,
              batchNumber: b.batchNumber,
              harvestDate: b.harvestDate.slice(0, 10),
              expiryDate: b.expiryDate.slice(0, 10),
              shelfLife: calculateShelfLife(b.harvestDate, b.expiryDate),
              quantityAvailable: b.quantityAvailable,
              warehouseLocation: b.warehouseLocation,
              warehouseSizeSqm: b.warehouseSizeSqm, // <- NEW FIELD
              userId: user.userId,
            });
            setEditMode(false);
          } else {
            setFormData({
              cropName: "",
              batchNumber: "",
              harvestDate: "",
              expiryDate: "",
              shelfLife: 0,
              quantityAvailable: 0,
              warehouseLocation: "",
              warehouseSizeSqm: "", // <- NEW FIELD
              userId: user.userId,
            });
            setBatch(null);
            setEditMode(true);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  if (!user || !user.userId) {
    return <p>Loading user data...</p>;
  }

  const isValidDate = (dateStr) => !isNaN(Date.parse(dateStr));

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (
      name === "quantityAvailable" ||
      name === "shelfLife" ||
      name === "warehouseSizeSqm"
    ) {
      val = value === "" ? "" : Number(value);
    }
    let updatedData = { ...formData, [name]: val, userId: user?.userId ?? null };
    if (name === "harvestDate" || name === "expiryDate") {
      updatedData.shelfLife = calculateShelfLife(
        name === "harvestDate" ? value : formData.harvestDate,
        name === "expiryDate" ? value : formData.expiryDate
      );
    }
    setFormData(updatedData);
  };

  const handleCancel = () => {
    if (!batch) return;
    setFormData({
      cropName: batch.cropName,
      batchNumber: batch.batchNumber,
      harvestDate: batch.harvestDate.slice(0, 10),
      expiryDate: batch.expiryDate.slice(0, 10),
      shelfLife: batch.shelfLife,
      quantityAvailable: batch.quantityAvailable,
      warehouseLocation: batch.warehouseLocation,
      warehouseSizeSqm: batch.warehouseSizeSqm, // <- NEW FIELD
      userId: batch.userId,
    });
    setEditMode(false);
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!formData.userId) return setSubmitError("User ID missing.");
    if (!formData.cropName) return setSubmitError("Crop name required.");
    if (!formData.batchNumber) return setSubmitError("Batch number required.");
    if (!(typeof formData.warehouseSizeSqm === "number" && formData.warehouseSizeSqm > 0))
      return setSubmitError("Warehouse size (sqm) is required and must be positive.");
    if (!isValidDate(formData.harvestDate)) return setSubmitError("Invalid harvest date.");
    if (!isValidDate(formData.expiryDate)) return setSubmitError("Invalid expiry date.");
    if (!(typeof formData.shelfLife === "number" && formData.shelfLife >= 0))
      return setSubmitError("Shelf life must be a non-negative number.");
    if (!(typeof formData.quantityAvailable === "number" && formData.quantityAvailable >= 0))
      return setSubmitError("Quantity available must be a non-negative number.");
    if (!formData.warehouseLocation) return setSubmitError("Warehouse location required.");

    try {
      const payload = {
        ...formData,
        harvestDate: new Date(formData.harvestDate),
        expiryDate: new Date(formData.expiryDate),
        shelfLife: Number(formData.shelfLife),
        warehouseSizeSqm: Number(formData.warehouseSizeSqm), // <- NEW FIELD
        quantityAvailable: Number(formData.quantityAvailable),
        userId: formData.userId,
      };
      const result = batch ? await updateBatch(batch._id, payload) : await addBatch(payload);
      setBatch(result);
      setEditMode(false);
      setSubmitError(null);
    } catch (error) {
      if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else {
        setSubmitError("Failed to submit. Please try again.");
      }
    }
  };

  const handleAdjustQuantity = async (qty, unitMultiplier, isAdd) => {
    setUpdateError(null);
    if (isNaN(qty)) {
      setUpdateError(`Please enter a valid number to ${isAdd ? "add" : "remove"}.`);
      return;
    }
    const adjustedTons = qty * unitMultiplier * (isAdd ? 1 : -1);
    let newQuantity = batch?.quantityAvailable + adjustedTons || 0;
    if (newQuantity < 0) newQuantity = 0;
    try {
      const updatePayload = {
        ...batch,
        quantityAvailable: newQuantity,
        lastUpdated: new Date(),
        userId: user.userId,
      };
      const updated = await updateBatch(batch._id, updatePayload);
      setBatch(updated);
      setFormData((prev) => ({ ...prev, quantityAvailable: newQuantity }));
      if (isAdd) setAddQuantity("");
      else setRemoveQuantity("");
    } catch {
      setUpdateError(`Failed to ${isAdd ? "add" : "remove"} quantity.`);
    }
  };

  // Static batch view with quantity controls
  if (!editMode && batch) {
    return (
      <div className="container mt-4">
        <h3>Warehouse Batch Details</h3>
        <div className="card p-3 mb-3">
          <p><strong>Crop Name:</strong> {batch.cropName}</p>
          <p><strong>Batch Number:</strong> {batch.batchNumber}</p>
          <p><strong>Harvest Date:</strong> {batch.harvestDate.slice(0, 10)}</p>
          <p><strong>Expiry Date:</strong> {batch.expiryDate.slice(0, 10)}</p>
          <p><strong>Shelf Life (Years):</strong> {batch.shelfLife}</p>
          <p><strong>Quantity Available (Tons):</strong> {batch.quantityAvailable}</p>
          <p><strong>Warehouse Location:</strong> {batch.warehouseLocation}</p>
          <p><strong>Warehouse Size (sqm):</strong> {batch.warehouseSizeSqm}</p>
        </div>
        <button className="btn btn-warning mt-2" onClick={() => setEditMode(true)}>
          Edit Batch Details
        </button>
        <div className="row mt-4">
          <div className="col-md-12" style={{ position: "relative" }}>
            <h4>Manage Quantity</h4>
            {updateError && <div className="alert alert-danger">{updateError}</div>}
            <div className="mb-3">
              <label>Add Quantity:</label>
              <input
                type="number"
                step="0.01"
                className="form-control mb-2"
                placeholder="Enter quantity"
                value={addQuantity}
                onChange={(e) => setAddQuantity(e.target.value)}
              />
              <div className="btn-group mb-3">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handleAdjustQuantity(parseFloat(addQuantity), 1, true)}
                >
                  Add Tons
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handleAdjustQuantity(parseFloat(addQuantity), 0.001, true)}
                >
                  Add Kgs
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handleAdjustQuantity(parseFloat(addQuantity), 0.000001, true)}
                >
                  Add Grams
                </button>
              </div>
            </div>
            <div className="mb-3">
              <label>Remove Quantity:</label>
              <input
                type="number"
                step="0.01"
                className="form-control mb-2"
                placeholder="Enter quantity"
                value={removeQuantity}
                onChange={(e) => setRemoveQuantity(e.target.value)}
              />
              <div className="btn-group">
                <button
                  className="btn btn-outline-danger"
                  onClick={() => handleAdjustQuantity(parseFloat(removeQuantity), 1, false)}
                >
                  Remove Tons
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => handleAdjustQuantity(parseFloat(removeQuantity), 0.001, false)}
                >
                  Remove Kgs
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => handleAdjustQuantity(parseFloat(removeQuantity), 0.000001, false)}
                >
                  Remove Grams
                </button>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              style={{ position: "absolute", bottom: "10px", right: "10px" }}
              onClick={() => navigate("/warehouse/dashboard")}
            >
              Back to Warehouse Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Editable form for new batch or editing
  return (
    <div className="container mt-4">
      {submitError && (
        <div className="alert alert-danger">{submitError}</div>
      )}
      <h3>{batch ? "Edit Batch Details" : "Submit Warehouse Batch Details"}</h3>
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Crop Name</label>
          <input
            type="text"
            name="cropName"
            className="form-control"
            value={formData.cropName}
            onChange={handleChange}
            required
            readOnly={!editMode}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Batch Number</label>
          <input
            type="text"
            name="batchNumber"
            className="form-control"
            value={formData.batchNumber}
            onChange={handleChange}
            required
            readOnly={!editMode}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Warehouse Size (sqm)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="warehouseSizeSqm"
            className="form-control"
            value={formData.warehouseSizeSqm}
            onChange={handleChange}
            required
            readOnly={!editMode}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Harvest Date</label>
          <input
            type="date"
            name="harvestDate"
            className="form-control"
            value={formData.harvestDate}
            onChange={handleChange}
            required
            disabled={!editMode}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Expiry Date</label>
          <input
            type="date"
            name="expiryDate"
            className="form-control"
            value={formData.expiryDate}
            onChange={handleChange}
            required
            disabled={!editMode}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Shelf Life (Years)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="shelfLife"
            className="form-control"
            value={formData.shelfLife}
            readOnly
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Quantity Available (Tons)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="quantityAvailable"
            className="form-control"
            value={formData.quantityAvailable}
            onChange={handleChange}
            required
            readOnly={!editMode}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Warehouse Location</label>
          <input
            type="text"
            name="warehouseLocation"
            className="form-control"
            value={formData.warehouseLocation}
            onChange={handleChange}
            required
            readOnly={!editMode}
          />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary" disabled={!editMode}>
            {batch ? "Update Details" : "Submit Batch Details"}
          </button>
          {editMode && batch && (
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={handleCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default WarehouseInventory;
