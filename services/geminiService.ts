
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExamConfig, ExamData, CognitiveLevel } from "../types";

// Define the response schema strictly to ensure valid JSON output
const examSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Tên đề thi, ví dụ: Đề kiểm tra 1 tiết Lịch sử 12 - [Chủ đề]" },
    multipleChoice: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Mảng gồm 4 nội dung lựa chọn. CHỈ GHI NỘI DUNG CÂU TRẢ LỜI. TUYỆT ĐỐI KHÔNG GHI KÝ TỰ 'A.', 'B.', 'C.', 'D.' Ở ĐẦU."
          },
          correctAnswer: { type: Type.STRING, description: "Chỉ ghi A, B, C hoặc D" },
          level: { type: Type.STRING, description: "Mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao)" }
        },
        required: ["question", "options", "correctAnswer", "level"]
      }
    },
    essay: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          rubric: { type: Type.STRING, description: "Hướng dẫn chấm/đáp án ngắn gọn" },
          level: { type: Type.STRING }
        },
        required: ["question", "rubric", "level"]
      }
    },
    trueFalse: {
      type: Type.ARRAY,
      description: "Mảng chứa các câu hỏi trắc nghiệm Đúng/Sai (Định dạng mới 2025)",
      items: {
        type: Type.OBJECT,
        properties: {
          context: { type: Type.STRING, description: "Đoạn ngữ liệu/bối cảnh lịch sử ngắn gọn." },
          statements: {
            type: Type.ARRAY,
            description: "Mảng chứa chính xác 4 ý phát biểu (a, b, c, d) liên quan đến đoạn ngữ liệu trên.",
            items: {
              type: Type.OBJECT,
              properties: {
                statement: { type: Type.STRING, description: "Nội dung của ý phát biểu." },
                isTrue: { type: Type.BOOLEAN, description: "Ý phát biểu này là Đúng (true) hay Sai (false)." }
              },
              required: ["statement", "isTrue"]
            }
          },
          level: { type: Type.STRING }
        },
        required: ["context", "statements", "level"]
      }
    }
  },
  required: ["title", "multipleChoice", "essay", "trueFalse"]
};

export const generateExam = async (config: ExamConfig): Promise<ExamData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const distributionText = Object.entries(config.distribution)
    .map(([level, percent]) => `- ${level}: ${percent}%`)
    .join('\n');

  const prompt = `
    Đóng vai một chuyên gia ra đề thi Lịch sử chuẩn cấu trúc THPT 2025 của Bộ GD&ĐT.
    Hãy soạn một đề thi môn Lịch sử với các yêu cầu sau:

    1. **Chủ đề/Nội dung:** ${config.topic}
    2. **Đối tượng:** Học sinh ${config.grade}
    3. **Cấu trúc đề thi:**
       - Phần 1: ${config.mcCount} câu trắc nghiệm nhiều phương án lựa chọn (4 lựa chọn A, B, C, D - chỉ 1 đáp án đúng).
       - Phần 2: ${config.tfCount} câu trắc nghiệm Đúng/Sai. Mỗi câu gồm 1 đoạn ngữ liệu lịch sử (context) và chính xác 4 ý phát biểu (statements) liên quan. Ở mỗi ý, học sinh sẽ chọn Đúng hoặc Sai. (Ghi chú: isTrue là true nếu đúng, false nếu sai).
       - (Nếu có) Phần Tự luận: ${config.essayCount || 0} câu tự luận.
    4. **Ma trận nhận thức (Phân bố mức độ khó):**
       ${distributionText}
       
    **Yêu cầu quan trọng về định dạng (Format):**
    - **TUYỆT ĐỐI KHÔNG** thêm các ký tự đánh số thứ tự như "A.", "B.", "C.", "D." hoặc "1.", "2." vào đầu nội dung của các phương án trắc nghiệm hoặc các mệnh đề đúng/sai trong JSON. Hệ thống hiển thị sẽ tự động thêm vào.
    
    **Yêu cầu về nội dung:**
    - Bám sát chương trình Giáo dục phổ thông 2018.
    - Văn phong chuẩn mực, sư phạm, nghiêm túc.
    - Đảm bảo chính xác về kiến thức lịch sử.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview', // Switched to the cheapest model available
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: examSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Không nhận được dữ liệu từ Gemini.");

    const rawData = JSON.parse(text);

    const examData: ExamData = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      config: config,
      title: rawData.title,
      multipleChoice: rawData.multipleChoice ? rawData.multipleChoice.map((q: any) => ({ ...q, id: crypto.randomUUID() })) : [],
      essay: rawData.essay ? rawData.essay.map((q: any) => ({ ...q, id: crypto.randomUUID() })) : [],
      trueFalse: rawData.trueFalse ? rawData.trueFalse.map((q: any) => ({
        ...q,
        id: crypto.randomUUID(),
        statements: q.statements.map((s: any) => ({ ...s, id: crypto.randomUUID() }))
      })) : []
    };

    return examData;

  } catch (error) {
    console.error("Lỗi khi tạo đề:", error);
    throw error;
  }
};
