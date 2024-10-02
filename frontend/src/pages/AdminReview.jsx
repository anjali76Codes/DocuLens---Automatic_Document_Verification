// AdminDocumentReview.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDocumentReview = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      const response = await axios.get('http://localhost:3000/api/documents');
      setDocuments(response.data);
    };
    fetchDocuments();
  }, []);

  const handleApproval = async (id) => {
    await axios.put(`http://localhost:3000/api/documents/approve/${id}`);
    setDocuments(documents.filter(doc => doc._id !== id)); // Update state after approval
  };

  const handleRejection = async (id) => {
    await axios.put(`http://localhost:3000/api/documents/reject/${id}`);
    setDocuments(documents.filter(doc => doc._id !== id)); // Update state after rejection
  };

  return (
    <div>
      <h1>Document Review</h1>
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Document Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(doc => (
            <tr key={doc._id}>
              <td>{doc.userId}</td>
              <td>{doc.documentType}</td>
              <td>{doc.status}</td>
              <td>
                <button onClick={() => handleApproval(doc._id)}>Approve</button>
                <button onClick={() => handleRejection(doc._id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDocumentReview;
