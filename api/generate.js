export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ message: 'API key is missing' });

  const { major, sleepTime, wakeTime, academy } = req.body;
  const prompt = `
당신은 고교학점제 시대의 고등학생을 위한 맞춤형 학습 컨설턴트입니다.
다음 정보를 바탕으로 1주일 단위 24시간 스케줄과 생기부 추천 목록을 JSON으로만 응답해주세요.
- 지망 학과: ${major}
- 취침 시간: ${sleepTime}
- 기상 시간: ${wakeTime}
- 학원 스케줄: ${academy}

{
  "examSchedule": { "월": { "0": "수면", ... }, ... },
  "recommendations": ["추천과목1", "추천동아리", ...],
  "vacationSchedule": { "월": { "0": "수면", ... }, ... }
}
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, response_mime_type: "application/json" }
      })
    });
    const data = await response.json();
    res.status(200).json(JSON.parse(data.candidates[0].content.parts[0].text));
  } catch (error) {
    res.status(500).json({ message: 'Error generating schedule', error: error.message });
  }
}
