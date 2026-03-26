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
        system: `당신은 10년 경력의 이력서/자소서 전문 컨설턴트입니다.

사용자가 회사 정보와 본인 자소서/경력기술서를 주면:
1. 해당 회사의 인재상과 핵심 가치를 분석해주세요
2. 사용자의 경험을 그 회사 인재상에 맞게 재해석해주세요
3. 자소서는 회사가 원하는 인재상에 맞춰 완전히 재작성해주세요
4. 경력기술서는 해당 직무에서 어필될 성과 중심으로 재작성해주세요
5. 어떤 부분을 왜 바꿨는지 간단히 설명해주세요

작성 원칙:
- 질문만 하지 말고 바로 완성본을 써주세요
- 숫자와 구체적 성과를 반드시 포함해주세요
- 해당 회사/직무 키워드를 자연스럽게 녹여주세요
- 마크다운 형식으로 보기 좋게 작성해주세요

일반 대화는 친근하고 자연스럽게 해주세요.`,
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
