import React, { useState, useEffect } from 'react';
import { getBatches } from '../services/batchService';
import { addImportExport } from '../services/importExportService';

const ImportExportForm = ({ onRecordAdded }) => {
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState({
    batchId: '',
    type: 'import',
    quantity: '',
    movementDate: '',
    party: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    getBatches().then(setBatches);
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    if (!form.batchId || !form.type || !form.quantity || !form.movementDate) {
      setError('Fill in all required fields.');
      return;
    }
    if (isNaN(parseFloat(form.quantity)) || parseFloat(form.quantity) <= 0) {
      setError('Quantity must be positive number.');
      return;
    }
    try {
      await addImportExport(form);
      onRecordAdded();
      setForm({ batchId: '', type: 'import', quantity: '', movementDate: '', party: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit.');
    }
  };

  return (
    <div className="card p-3 mb-3">
      <h5>Import / Export Entry</h5>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col">
          <select name="batchId" value={form.batchId} onChange={handleChange} className="form-select" required>
            <option value="">Select Batch</option>
            {batches.map(b => <option key={b._id} value={b._id}>{b.batchNumber} ({b.cropName})</option>)}
          </select>
        </div>
        <div className="col">
          <select name="type" value={form.type} onChange={handleChange} className="form-select" required>
            <option value="import">Import (Add Stock)</option>
            <option value="export">Export (Reduce Stock)</option>
          </select>
        </div>
        <div className="col">
          <input type="number" name="quantity" value={form.quantity} onChange={handleChange} step="0.01" placeholder="Quantity (Tons)" className="form-control" required />
        </div>
        <div className="col">
          <input type="date" name="movementDate" value={form.movementDate} onChange={handleChange} className="form-control" required />
        </div>
        <div className="col">
          <input type="text" name="party" placeholder="Supplier / Customer" value={form.party} onChange={handleChange} className="form-control" />
        </div>
        <div className="col-auto">
          <button type="submit" className="btn btn-primary">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default ImportExportForm;
