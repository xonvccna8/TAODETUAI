
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

QUY TẮC NGHIÊM NGẶT VỀ SỐ LƯỢNG:
- Mảng "multipleChoice" phải có ĐÚNG số phần tử theo yêu cầu. KHÔNG ĐƯỢC nhiều hơn hoặc ít hơn.
- Mảng "trueFalse" phải có ĐÚNG số phần tử theo yêu cầu.
- Mảng "essay" phải có ĐÚNG số phần tử theo yêu cầu.
- TUYỆT ĐỐI KHÔNG nhầm lẫn tổng số câu với số câu từng phần.

TUYỆT ĐỐI KHÔNG thêm các ký tự đánh số thứ tự như "A.", "B.", "C.", "D." hoặc "a)", "b)" vào đầu nội dung của các phương án trắc nghiệm hoặc các mệnh đề đúng/sai.`;

  const userPrompt = `Hãy soạn một đề thi môn Lịch sử với các yêu cầu sau:

1. **Chủ đề/Nội dung:** ${config.topic}
2. **Đối tượng:** Học sinh ${config.grade}
3. **Cấu trúc đề thi (RẤT QUAN TRỌNG - PHẢI TUÂN THỦ CHÍNH XÁC SỐ LƯỢNG):**
   - Phần 1 (multipleChoice): CHÍNH XÁC ${config.mcCount} câu trắc nghiệm nhiều phương án lựa chọn (4 lựa chọn A, B, C, D - chỉ 1 đáp án đúng). Mảng "multipleChoice" phải có ĐÚNG ${config.mcCount} phần tử, KHÔNG ĐƯỢC tạo nhiều hơn hoặc ít hơn ${config.mcCount} câu.
   - Phần 2 (trueFalse): CHÍNH XÁC ${config.tfCount} câu trắc nghiệm Đúng/Sai. Mỗi câu gồm 1 đoạn ngữ liệu lịch sử (context) và chính xác 4 ý phát biểu (statements). (isTrue = true nếu đúng, false nếu sai). Mảng "trueFalse" phải có ĐÚNG ${config.tfCount} phần tử.
   - Phần 3 (essay): CHÍNH XÁC ${config.essayCount || 0} câu tự luận. ${(config.essayCount || 0) === 0 ? 'Mảng "essay" phải là mảng rỗng [].' : `Mảng "essay" phải có ĐÚNG ${config.essayCount} phần tử.`}
4. **Ma trận nhận thức (Phân bố mức độ khó):**
   ${distributionText}

**Tóm tắt số lượng: multipleChoice = ${config.mcCount} câu, trueFalse = ${config.tfCount} câu, essay = ${config.essayCount || 0} câu.**

**Yêu cầu về nội dung:**
- Bám sát chương trình Giáo dục phổ thông 2018.
- Văn phong chuẩn mực, sư phạm, nghiêm túc.
- Đảm bảo chính xác về kiến thức lịch sử.

**Trả về JSON theo cấu trúc sau (KHÔNG được thêm text ngoài JSON):**
{
  "title": "Tên đề thi",
  "multipleChoice": [
    {
      "question": "Nội dung câu hỏi?",
      "options": ["Phương án 1", "Phương án 2", "Phương án 3", "Phương án 4"],
      "correctAnswer": "A",
      "level": "Nhận biết"
    }
  ],
  "trueFalse": [
    {
      "context": "Đoạn ngữ liệu lịch sử dài khoảng 2-3 câu...",
      "statements": [
        { "statement": "Nội dung phát biểu ý a (KHÔNG ĐƯỢC ĐỂ TRỐNG)", "isTrue": true },
        { "statement": "Nội dung phát biểu ý b (KHÔNG ĐƯỢC ĐỂ TRỐNG)", "isTrue": false },
        { "statement": "Nội dung phát biểu ý c (KHÔNG ĐƯỢC ĐỂ TRỐNG)", "isTrue": true },
        { "statement": "Nội dung phát biểu ý d (KHÔNG ĐƯỢC ĐỂ TRỐNG)", "isTrue": false }
      ],
      "level": "Thông hiểu"
    }
  ],
  "essay": []
}

**LƯU Ý CỰC KỲ QUAN TRỌNG:**
- Mỗi "statement" trong trueFalse PHẢI có nội dung cụ thể, TUYỆT ĐỐI KHÔNG ĐƯỢC để trống ("").
- Mỗi statement phải là một phát biểu rõ ràng liên quan đến đoạn context.
- multipleChoice phải có CHÍNH XÁC ${config.mcCount} phần tử.
- trueFalse phải có CHÍNH XÁC ${config.tfCount} phần tử.`;

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

    // Post-processing: enforce exact counts by slicing arrays
    const mcRaw = rawData.multipleChoice || [];
    const tfRaw = rawData.trueFalse || [];
    const essayRaw = rawData.essay || [];

    const examData: ExamData = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      config: config,
      title: rawData.title || `Đề thi Lịch sử ${config.grade} - ${config.topic}`,
      multipleChoice: mcRaw.slice(0, config.mcCount).map((q: any) => ({ ...q, id: crypto.randomUUID() })),
      essay: essayRaw.slice(0, config.essayCount || 0).map((q: any) => ({ ...q, id: crypto.randomUUID() })),
      trueFalse: tfRaw.slice(0, config.tfCount).map((q: any) => ({
        ...q,
        id: crypto.randomUUID(),
        statements: (q.statements || []).map((s: any) => ({
          ...s,
          statement: s.statement || s.content || s.text || '(Lỗi: Không có nội dung)',
          id: crypto.randomUUID()
        }))
      }))
    };

    return examData;

  } catch (error: any) {
    console.error("Lỗi khi tạo đề:", error);
    throw new Error(error.message || "Đã xảy ra lỗi khi tạo đề thi. Vui lòng thử lại.");
  }
};
