import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";

/* ============ Styled Components ============ */

const Wrapper = styled.div`
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
`;

const Card = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  background: #fff;
`;

const Img = styled.img`
  display: block;
  width: 100%;
  height: auto;
`;

const Attribution = styled.div`
  margin-top: 12px;
  font-size: 14px;
  color: #374151;

  a {
    text-decoration: underline;
    color: inherit;
  }
  a:hover {
    text-decoration: none;
  }
`;

const Actions = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 8px;
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #111827;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  background: #111827;
  color: #fff;
  font-size: 14px;
  border: none;
  cursor: pointer;

  &:hover {
    background: #0b1220;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const LoadBox = styled.div`
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  font-size: 14px;
  background: #fff;
`;

const ErrorBox = styled(LoadBox)`
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
`;

/* ============ Component ============ */

/**
 * Component: UnsplashPhotoTest
 * Fetches a single Unsplash photo for a given query (default: "poznan")
 * from backend endpoints:
 *  - GET /photo?q=<query>
 *  - POST /download { download_location }
 * Displays the image with proper attribution and a Download button
 * that registers the download with Unsplash and then opens the file URL.
 */
export default function UnsplashPhotoTest({ query = "poznan" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    console.log("Tutaj 1")
    async function run() {
      setLoading(true);
      setError("");
      try {
        const r = await fetch(`http://localhost:5006/photo?q=${encodeURIComponent(query)}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (!cancelled) setData(json);
        console.log("Tutaj 2")
      } catch (e) {
        console.log("Tutaj 3")
        if (!cancelled) setError(e?.message || "Load error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleDownload = useCallback(async () => {
    console.log("ROZPOCZYNAM")

    if (!data?.download_location) return;
    setDownloading(true);
    try {
      const r = await fetch(`http://localhost:5006/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ download_location: data.download_location }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = await r.json();
      const fileUrl = json?.data?.url; // Unsplash returns { url }
      console.log("TEST1", fileUrl)
      if (fileUrl) {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      console.error("Download error:", e);
      alert("Could not register/download the image.");
    } finally {
      setDownloading(false);
    }
  }, [data]);

  if (loading) {
    return (
      <LoadBox>
        <p>Loading photo…</p>
      </LoadBox>
    );
  }

  if (error) {
    return (
      <ErrorBox>
        abcd
        <p>{error}</p>
      </ErrorBox>
    );
  }

  if (!data) return null;

  return (
    <Wrapper>
        abcd
      <Card>
        <Img
          src={data.src?.regular || data.src?.small}
          alt={data.alt || `Unsplash photo for ${query}`}
          loading="lazy"
        />
      </Card>

      <Attribution>
        Photo by{" "}
        <a
          href={data.attribution?.photographerProfile}
          target="_blank"
          rel="noopener noreferrer"
        >
          {data.attribution?.photographerName || "Photographer"}
        </a>{" "}
        on{" "}
        <a
          href={data.attribution?.unsplashHomepage}
          target="_blank"
          rel="noopener noreferrer"
        >
          Unsplash
        </a>
      </Attribution>

      <Actions>
        <LinkButton
          href={data.src?.full || data.src?.regular}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open full size
        </LinkButton>

        <PrimaryButton
          onClick={handleDownload}
          disabled={downloading || !data.download_location}
        >
          {downloading ? "Registering…" : "Download (via Unsplash)"}
        </PrimaryButton>
      </Actions>
    </Wrapper>
  );
}
