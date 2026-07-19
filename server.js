require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-2.0-flash';

app.post('/api/generate', async (req, res) => {
  try {
    const { contents, generationConfig, stream } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: { message: "Server misconfiguration: API key is missing." } });
    }

    const endpoint = stream 
      ? `${API_BASE}/${MODEL}:streamGenerateContent?key=${apiKey}`
      : `${API_BASE}/${MODEL}:generateContent?key=${apiKey}`;

    const fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig
      })
    };

    const apiRes = await fetch(endpoint, fetchOptions);

    if (!apiRes.ok) {
      const err = await apiRes.json().catch(() => ({}));
      return res.status(apiRes.status).json(err);
    }

    if (stream) {
      // Pipe the stream back to the client
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = apiRes.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
      res.end();
    } else {
      const data = await apiRes.json();
      res.json(data);
    }

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.listen(PORT, () => {
  console.log(`FlowState Server running on http://localhost:${PORT}`);
});
