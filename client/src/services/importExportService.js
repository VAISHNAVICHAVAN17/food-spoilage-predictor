import axios from 'axios';
const API_URL = 'http://localhost:5000/api/importexport';

export const addImportExport = (data) => axios.post(API_URL, data).then(res => res.data);
export const getImportExportRecords = () => axios.get(API_URL).then(res => res.data);
