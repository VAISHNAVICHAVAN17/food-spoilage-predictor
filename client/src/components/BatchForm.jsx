import React, { useState, useEffect } from "react";
import { addBatch, updateBatch } from "../services/batchService";

const initialState = {
  batchNumber: "",
  warehouseSizeSqm: "",  // <-- ADDED FIELD
  harvestDate: "",
  expiryDate: "",
  shelfLife: "",
  quantityAvailable: "",
  warehouseLocation: "",
  movementType: "Receive",
  movementQuantity: "",
  spoilageRiskScore: "",
  spoilageStatus: "Normal",
  conditionNotes: "",
  reorderLevel: "",
  criticalSpoilageThreshold: "",
  updatedBy: "",
  receivedDate: "",
  dispatchedDate: ""
};

const BatchForm = ({ onSaved, batch }) => {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if(batch) {
      setFormData({ ...batch });
    } else {
      setFormData(initialState);
    }
  }, [batch]);

  const handleChange = (e) => {
    let val = e.target.value;
    // Parse number for warehouseSizeSqm
    if(e.target.name === "warehouseSizeSqm" && val !== "") val = Number(val);
    setFormData({
      ...formData,
      [e.target.name]: val
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(formData._id){
      await updateBatch(formData._id, formData);
    } else {
      await addBatch(formData);
    }
    onSaved();
    setFormData(initialState);
  };

  return (
    <form onSubmit={handleSubmit} style={{marginBottom:20, marginTop:20}}>
      <input name="batchNumber" value={formData.batchNumber} onChange={handleChange} placeholder="Batch Number" required />
      <input type="number" name="warehouseSizeSqm" value={formData.warehouseSizeSqm} onChange={handleChange} placeholder="Warehouse Size (sqm)" required />
      <input type="date" name="harvestDate" value={formData.harvestDate ? formData.harvestDate.slice(0,10) : ""} onChange={handleChange} placeholder="Harvest Date" required />
      <input type="date" name="expiryDate" value={formData.expiryDate ? formData.expiryDate.slice(0,10) : ""} onChange={handleChange} placeholder="Expiry Date" required />
      <input type="number" name="shelfLife" value={formData.shelfLife} onChange={handleChange} placeholder="Shelf Life (days)" required />
      <input type="number" name="quantityAvailable" value={formData.quantityAvailable} onChange={handleChange} placeholder="Quantity (kg)" required />
      <input name="warehouseLocation" value={formData.warehouseLocation} onChange={handleChange} placeholder="Location" required />
      <input type="number" name="movementQuantity" value={formData.movementQuantity} onChange={handleChange} placeholder="Movement Qty" required />
      <select name="movementType" value={formData.movementType} onChange={handleChange}>
        <option value="Receive">Receive</option>
        <option value="Dispatch">Dispatch</option>
        <option value="Transfer">Transfer</option>
      </select>
      <input type="number" name="spoilageRiskScore" step="0.01" value={formData.spoilageRiskScore} onChange={handleChange} placeholder="Spoilage Risk" required />
      <select name="spoilageStatus" value={formData.spoilageStatus} onChange={handleChange}>
        <option value="Normal">Normal</option>
        <option value="At Risk">At Risk</option>
        <option value="Spoiled">Spoiled</option>
      </select>
      <input name="conditionNotes" value={formData.conditionNotes} onChange={handleChange} placeholder="Condition Notes" />
      <input type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} placeholder="Reorder Level" required />
      <input type="number" name="criticalSpoilageThreshold" value={formData.criticalSpoilageThreshold} onChange={handleChange} placeholder="Critical Spoilage Threshold" required />
      <input name="updatedBy" value={formData.updatedBy} onChange={handleChange} placeholder="Updated By" required />
      <button type="submit">{formData._id ? "Update" : "Add"} Batch</button>
    </form>
  );
};
export default BatchForm;
