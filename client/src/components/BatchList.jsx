import React, { useEffect, useState } from "react";
import { getBatches, deleteBatch } from "../services/batchService";
import BatchForm from "./BatchForm";

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = () => {
    getBatches().then(setBatches);
  };

  const handleEdit = (batch) => {
    setSelectedBatch(batch);
  };

  const handleDelete = (id) => {
    if(window.confirm("Are you sure?")) {
      deleteBatch(id).then(loadBatches);
    }
  };

  const handleFormSaved = () => {
    setSelectedBatch(null);
    loadBatches();
  };

  return (
    <div>
      <h2>Batches in Inventory</h2>
      <BatchForm onSaved={handleFormSaved} batch={selectedBatch}/>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Batch Number</th>
            <th>Harvest Date</th>
            <th>Expiry Date</th>
            <th>Quantity</th>
            <th>Location</th>
            <th>Spoilage Score</th>
            <th>Spoilage Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {batches.map(batch => (
            <tr key={batch._id}>
              <td>{batch.batchNumber}</td>
              <td>{batch.harvestDate.slice(0,10)}</td>
              <td>{batch.expiryDate.slice(0,10)}</td>
              <td>{batch.quantityAvailable}</td>
              <td>{batch.warehouseLocation}</td>
              <td>{batch.spoilageRiskScore}</td>
              <td>{batch.spoilageStatus}</td>
              <td>
                <button onClick={() => handleEdit(batch)}>Edit</button>
                <button onClick={() => handleDelete(batch._id)} style={{marginLeft: 8}}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default BatchList;
