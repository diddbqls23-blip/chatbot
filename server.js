require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: '메시지가 없어요' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('API 오류:', err);
      return res.status(502).json({ error: err.error?.message || 'API 오류' });
    }

    const data = await response.json();
    const text = data.content?.find(b => b.type === 'text')?.text || '';
    res.json({ reply: text });
  } catch (err) {
    console.error('서버 오류:', err.message);
    res.status(500).json({ error: '서버 오류가 발생했어요' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버 실행 중 → http://localhost:${PORT}`);
});
