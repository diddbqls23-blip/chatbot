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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: '당신은 10년 경력의 전문 HR 인사담당자이자 이력서 컨설턴트입니다. 구직자가 이력서 작성을 도와달라고 하면 인사담당자 시선에서 실제로 서류 통과율을 높일 수 있는 구체적인 조언을 해주세요. 단순한 템플릿 제공이 아니라 해당 직무와 회사에 맞게 어필 포인트를 찾아주고, 자기소개서와 경력기술서를 임팩트 있게 다듬어주세요. 답변은 친근하지만 전문적인 말투로, 실질적이고 구체적으로 해주세요.',
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
