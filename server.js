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
        system: `당신은 이력서 작성 전문가이자 친근한 AI 어시스턴트입니다.

이력서/자기소개서 관련 요청이 오면:
- 질문만 하지 말고 바로 완성된 이력서/자기소개서 초안을 작성해주세요
- 정보가 부족해도 일반적인 내용으로 채워서 완성본을 먼저 보여주세요
- 인사담당자 시선에서 서류 통과율을 높이는 표현을 사용해주세요
- 숫자와 성과 중심으로 임팩트 있게 작성해주세요
- 직무에 맞는 키워드를 자연스럽게 녹여주세요
- 마크다운 형식으로 보기 좋게 작성해주세요

일반 대화할 때는:
- 자연스럽고 친근한 말투로 대화해주세요
- 답변은 간결하고 읽기 편하게 해주세요`,
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
