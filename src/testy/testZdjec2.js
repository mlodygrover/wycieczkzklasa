import React, { useState } from 'react';
import axios from 'axios';

export default function ValidAttractionPhotoTester() {
  const [idGoogle, setIdGoogle] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPhoto = async () => {
    if (!idGoogle.trim()) {
      setError('Podaj idGoogle atrakcji');
      return;
    }
    setLoading(true);
    setError('');
    setImageUrl(null);

    try {
      const { data } = await axios.get('http://localhost:5002/api/valid-attraction-photo', {
        params: { idGoogle }
      });
      setImageUrl(data.url);
    } catch (e) {
      setError(e.response?.data?.error || 'Nie udało się pobrać zdjęcia');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => {
    if (e.key === 'Enter') fetchPhoto();
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: '2em auto',
      padding: '1em',
      border: '1px solid #ddd',
      borderRadius: 8,
      textAlign: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h3>Testuj działające zdjęcie atrakcjī</h3>

      <input
        type="text"
        placeholder="Wpisz idGoogle..."
        value={idGoogle}
        onChange={e => setIdGoogle(e.target.value)}
        onKeyDown={handleKey}
        style={{
          width: '100%',
          padding: '0.5em',
          marginBottom: '0.5em',
          boxSizing: 'border-box'
        }}
      />

      <button
        onClick={fetchPhoto}
        disabled={loading}
        style={{
          padding: '0.5em 1em',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '🔄 Szukam…' : '🔍 Fetch Photo'}
      </button>

      {error && (
        <p style={{ color: 'crimson', marginTop: '1em' }}>{error}</p>
      )}

      {imageUrl && (
        <div style={{ marginTop: '1em' }}>
          <img
            src={imageUrl}
            alt="Attraction"
            style={{
              maxWidth: '100%',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          />
        </div>
      )}
    </div>
  );
}
