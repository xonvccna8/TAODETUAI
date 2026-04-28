export enum CognitiveLevel {
  NHAN_BIET = 'Nhận biết',
  THONG_HIEU = 'Thông hiểu',
  VAN_DUNG = 'Vận dụng',
  VAN_DUNG_CAO = 'Vận dụng cao'
}

export interface ExamConfig {
  topic: string;
  grade: string; // Lớp 10, 11, 12...
  mcCount: number; // Số câu trắc nghiệm
  essayCount?: number; // Số câu tự luận (cũ)
  tfCount: number; // Số câu trắc nghiệm Đúng/Sai (Mới 2025)
  distribution: {
    [key in CognitiveLevel]: number; // Percentage 0-100
  };
}

export interface MultipleChoiceQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string; // A, B, C, or D
  level: CognitiveLevel;
}

export interface EssayQuestion {
  id: string;
  question: string;
  rubric: string; // Hướng dẫn chấm ngắn gọn
  level: CognitiveLevel;
}

export interface TrueFalseStatement {
  id: string;
  statement: string; // Nội dung ý a, b, c, d
  isTrue: boolean; // Đúng hay Sai
}

export interface TrueFalseQuestion {
  id: string;
  context: string; // Đoạn ngữ liệu/bối cảnh
  statements: TrueFalseStatement[]; // Mảng chứa 4 ý a, b, c, d
  level: CognitiveLevel;
}

export interface ExamData {
  id: string;
  timestamp: number;
  config: ExamConfig;
  title: string;
  multipleChoice: MultipleChoiceQuestion[];
  essay: EssayQuestion[]; // Giữ lại cho đề cũ
  trueFalse: TrueFalseQuestion[]; // Đề mới 2025
}

export interface SavedExamSummary {
  id: string;
  title: string;
  timestamp: number;
  topic: string;
}