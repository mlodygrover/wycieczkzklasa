import React from 'react';
import axios from 'axios';

const TestRequestow = () => {
  // 1) Funkcja asynchroniczna
  const testR = async () => {
    const urlStrony = "https://muzeumbronipancernej.pl/";

    if (!urlStrony) {
      console.warn("Brak URL-a – nie można pobrać linii z 'cena'.");
      return;
    }

    try {
      // 2) Wywołanie endpointu
      const { data: priceLines } = await axios.get(
        'http://localhost:5002/api/price-lines',
        { params: { url: urlStrony } }
      );
      console.log(`Linie z "cena" na stronie ${urlStrony}:`);
      priceLines.forEach(({ url, line }) => {
        console.log(`  [${url}]  ${line}`);
      });
    } catch (err) {
      console.error("Błąd podczas pobierania linii z 'cena':", err);
    }
  };

  return (
    <button onClick={testR}>
      Sprawdź ceny na stronie Muzeum
    </button>
  );
};

export default TestRequestow;
