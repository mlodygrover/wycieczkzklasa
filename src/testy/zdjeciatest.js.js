import React, { useState } from 'react';
import axios from 'axios';

export default function AttractionImageSearch() {
  const [nazwa, setNazwa] = useState('');
  const [adres, setAdres] = useState('');
  const [idGoogle, setIdGoogle] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchImage = async () => {
    if (!nazwa.trim()) {
      setError('Podaj nazwę atrakcji');
      return;
    }
    setLoading(true);
    setError('');
    setImageUrl(null);
    setSource('');
    try {
      const { data } = await axios.get('http://localhost:5002/api/attraction-image', {
        params: { nazwa, adres, idGoogle }
      });
      setImageUrl(data.url);
      setSource(data.source);
    } catch (e) {
      setError(e.response?.data?.error || 'Błąd podczas pobierania');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => {
    if (e.key === 'Enter') {
      fetchImage();
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', textAlign: 'center' }}>
      <h3>Znajdź zdjęcie atrakcji</h3>

      <input
        type="text"
        placeholder="Nazwa atrakcji"
        value={nazwa}
        onChange={e => setNazwa(e.target.value)}
        onKeyDown={handleKey}
        style={{ width: '100%', marginBottom: 8, padding: 6 }}
      />

      <input
        type="text"
        placeholder="Adres (opcjonalnie)"
        value={adres}
        onChange={e => setAdres(e.target.value)}
        onKeyDown={handleKey}
        style={{ width: '100%', marginBottom: 8, padding: 6 }}
      />

      <input
        type="text"
        placeholder="idGoogle (opcjonalnie)"
        value={idGoogle}
        onChange={e => setIdGoogle(e.target.value)}
        onKeyDown={handleKey}
        style={{ width: '100%', marginBottom: 8, padding: 6 }}
      />

      <button
        onClick={fetchImage}
        disabled={loading}
        style={{ padding: '6px 12px', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? '🔄 Szukam…' : '🔍 Szukaj obrazka'}
      </button>

      {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}

      {imageUrl && (
        <div style={{ marginTop: 12 }}>
          <img
            src={imageUrl}
            alt={nazwa}
            style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
          />
          <p style={{ fontSize: 12, color: '#555' }}>Źródło: {source}</p>
        </div>
      )}
    </div>
  );
}
