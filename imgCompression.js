const express = require("express");
const fetch = require("node-fetch");
const sharp = require("sharp");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { url, w = 200, h = 200, q = 70, fit = "cover" } = req.query;

        if (!url) {
            return res.status(400).json({ error: "Brak parametru url" });
        }

        const width = Math.max(1, Math.min(parseInt(w, 10) || 200, 2000));
        const height = Math.max(1, Math.min(parseInt(h, 10) || 200, 2000));
        const quality = Math.max(1, Math.min(parseInt(q, 10) || 70, 100));

        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 Image Proxy" }
        });

        if (!response.ok) {
            return res.status(400).json({
                error: "Nie udało się pobrać obrazu",
                status: response.status
            });
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const optimized = await sharp(buffer)
            .resize(width, height, {
                fit,
                withoutEnlargement: true
            })
            .webp({ quality })
            .toBuffer();

        res.set("Content-Type", "image/webp");
        res.set("Cache-Control", "public, max-age=31536000, immutable");
        return res.send(optimized);
    } catch (err) {
        console.error("Błąd kompresji obrazu:", err);
        return res.status(500).json({ error: "Błąd podczas przetwarzania obrazu" });
    }
});

module.exports = router;