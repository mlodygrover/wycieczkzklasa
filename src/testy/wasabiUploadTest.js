
import React, { useState } from 'react';
import axios from 'axios';

export default function WasabiUploadTest() {
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async () => {
    setError('');
    setUploadedUrl('');
    try {
      const { data } = await axios.post('http://localhost:5002/api/upload-test', { imageUrl });
      setUploadedUrl(data.url);
    } catch (e) {
      setError(e.response?.data?.error || 'Upload error');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', textAlign: 'center' }}>
      <h3>Test upload to Wasabi</h3>
      <input
        type="text"
        placeholder="Image URL"
        value={imageUrl}
        onChange={e => setImageUrl(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 8 }}
      />
      <button onClick={handleUpload}>Upload</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {uploadedUrl && (
        <div style={{ marginTop: 12 }}>
          <p>Uploaded URL:</p>
          <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
            {uploadedUrl}
          </a>
          <img src={uploadedUrl} alt="uploaded" style={{ maxWidth: '100%', marginTop: 8 }} />
        </div>
      )}
    </div>
  );
}
