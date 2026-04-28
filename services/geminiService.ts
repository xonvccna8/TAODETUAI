
import { ExamConfig, ExamData, CognitiveLevel } from "../types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export const generateExam = async (config: ExamConfig): Promise<ExamData> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Chưa cấu hình OPENAI_API_KEY. Vui lòng kiểm tra lại file .env.");

  const distributionText = Object.entries(config.distribution)
    .map(([level, percent]) => `- ${level}: ${percent}%`)
    .join('\n');

  const systemPrompt = `Bạn là một chuyên gia ra đề thi Lịch sử chuẩn cấu trúc THPT 2025 của Bộ GD&ĐT.
Bạn LUÔN trả về kết quả dưới dạng JSON hợp lệ theo đúng cấu trúc được yêu cầu.
TUYỆT ĐỐI KHÔNG thêm các ký tự đánh số thứ tự như "A.", "B.", "C.", "D." hoặc "a)", "b)" vào đầu nội dung của các phương án trắc nghiệm hoặc các mệnh đề đúng/sai. Hệ thống hiển thị sẽ tự động thêm vào.`;

  const userPrompt = `Hãy soạn một đề thi môn Lịch sử với các yêu cầu sau:

1. **Chủ đề/Nội dung:** ${config.topic}
2. **Đối tượng:** Học sinh ${config.grade}
3. **Cấu trúc đề thi:**
   - Phần 1: ${config.mcCount} câu trắc nghiệm nhiều phương án lựa chọn (4 lựa chọn A, B, C, D - chỉ 1 đáp án đúng).
   - Phần 2: ${config.tfCount} câu trắc nghiệm Đúng/Sai. Mỗi câu gồm 1 đoạn ngữ liệu lịch sử (context) và chính xác 4 ý phát biểu (statements). Ở mỗi ý, học sinh sẽ chọn Đúng hoặc Sai. (isTrue = true nếu đúng, false nếu sai).
   - Phần Tự luận: ${config.essayCount || 0} câu tự luận.
4. **Ma trận nhận thức (Phân bố mức độ khó):**
   ${distributionText}

**Yêu cầu về nội dung:**
- Bám sát chương trình Giáo dục phổ thông 2018.
- Văn phong chuẩn mực, sư phạm, nghiêm túc.
- Đảm bảo chính xác về kiến thức lịch sử.

**Trả về JSON theo cấu trúc sau (KHÔNG được thêm text ngoài JSON):**
{
  "title": "Tên đề thi",
  "multipleChoice": [
    {
      "question": "Nội dung câu hỏi",
      "options": ["Phương án 1", "Phương án 2", "Phương án 3", "Phương án 4"],
      "correctAnswer": "A",
      "level": "Nhận biết"
    }
  ],
  "trueFalse": [
    {
      "context": "Đoạn ngữ liệu lịch sử...",
      "statements": [
        { "statement": "Nội dung ý a", "isTrue": true },
        { "statement": "Nội dung ý b", "isTrue": false },
        { "statement": "Nội dung ý c", "isTrue": true },
        { "statement": "Nội dung ý d", "isTrue": false }
      ],
      "level": "Thông hiểu"
    }
  ],
  "essay": [
    {
      "question": "Nội dung câu hỏi tự luận",
      "rubric": "Hướng dẫn chấm ngắn gọn",
      "level": "Vận dụng"
    }
  ]
}`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 8000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMsg = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(`Lỗi từ OpenAI: ${errorMsg}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Không nhận được dữ liệu từ ChatGPT.");

    const rawData = JSON.parse(text);

    const examData: ExamData = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      config: config,
      title: rawData.title || `Đề thi Lịch sử ${config.grade} - ${config.topic}`,
      multipleChoice: rawData.multipleChoice ? rawData.multipleChoice.map((q: any) => ({ ...q, id: crypto.randomUUID() })) : [],
      essay: rawData.essay ? rawData.essay.map((q: any) => ({ ...q, id: crypto.randomUUID() })) : [],
      trueFalse: rawData.trueFalse ? rawData.trueFalse.map((q: any) => ({
        ...q,
        id: crypto.randomUUID(),
        statements: q.statements.map((s: any) => ({ ...s, id: crypto.randomUUID() }))
      })) : []
    };

    return examData;

  } catch (error: any) {
    console.error("Lỗi khi tạo đề:", error);
    throw new Error(error.message || "Đã xảy ra lỗi khi tạo đề thi. Vui lòng thử lại.");
  }
};
