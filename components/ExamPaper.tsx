
import React from 'react';
import { ExamData, MultipleChoiceQuestion, EssayQuestion } from '../types';
import { FileDown, CheckCircle2, PlayCircle } from 'lucide-react';

interface Props {
  exam: ExamData;
  onTakeExam: () => void;
}

export const ExamPaper: React.FC<Props> = ({ exam, onTakeExam }) => {

  const exportToWord = () => {
    // Basic HTML to Doc export strategy
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title><style>body{font-family: 'Times New Roman', serif; font-size: 13pt;}</style></head><body>";
    
    // Get the HTML content from the preview div
    const examContent = document.getElementById('exam-preview-content')?.innerHTML;
    
    if (!examContent) return;

    const footer = "</body></html>";
    const sourceHTML = header + examContent + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${exam.title.replace(/\s+/g, '_')}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  // Helper function to clean option text (remove "A.", "A)", "a." from start)
  const cleanOptionText = (text: string) => {
    // Regex matches "A.", "A)", "A " repeatedly at the start to handle cases like "A. A. Content"
    return text.replace(/^([A-D][.:)]\s*)+/i, "").trim();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50 rounded-t-xl">
        <h3 className="font-bold text-gray-700 hidden sm:block">Xem trước Đề thi</h3>
        <div className="flex w-full sm:w-auto gap-2">
            <button
            onClick={onTakeExam}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm text-sm font-medium"
            >
            <PlayCircle className="w-4 h-4" />
            Làm bài Online
            </button>
            <button
            onClick={exportToWord}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium"
            >
            <FileDown className="w-4 h-4" />
            Xuất file Word
            </button>
        </div>
      </div>

      {/* Paper Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 bg-gray-50">
        <div 
          id="exam-preview-content" 
          className="max-w-[210mm] mx-auto bg-white p-6 sm:p-[20mm] shadow-md min-h-[297mm]"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-lg font-bold uppercase mb-1">ĐỀ THI MÔN LỊCH SỬ</h1>
            <h2 className="text-xl font-bold uppercase mb-4">{exam.title}</h2>
            <div className="flex justify-between text-sm italic mb-4 px-8">
              <p>Môn: Lịch Sử - {exam.config.grade}</p>
              <p>Thời gian làm bài: 50 phút</p>
            </div>
            <div className="border-t-2 border-black w-1/3 mx-auto mb-6"></div>
          </div>

          {/* Part 1: Multiple Choice */}
          {exam.multipleChoice.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3 uppercase">Phần I. Trắc nghiệm nhiều phương án lựa chọn ({exam.multipleChoice.length} câu)</h3>
              <div className="space-y-4">
                {exam.multipleChoice.map((q, index) => (
                  <div key={q.id} className="break-inside-avoid">
                    <p className="font-semibold mb-1">
                      <span className="underline">Câu {index + 1}:</span> {q.question} 
                      <span className="text-xs font-normal text-gray-500 ml-2 italic">[{q.level}]</span>
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 ml-4">
                      {q.options.map((opt, i) => {
                        const label = String.fromCharCode(65 + i); // A, B, C, D
                        return (
                          <div key={i} className={label === q.correctAnswer ? "font-bold text-blue-800" : ""}>
                            {label}. {cleanOptionText(opt)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Part 2: True/False */}
          {exam.trueFalse && exam.trueFalse.length > 0 && (
            <div className="mb-6 mt-6">
              <h3 className="font-bold text-lg mb-3 uppercase">Phần II. Trắc nghiệm Đúng/Sai ({exam.trueFalse.length} câu)</h3>
              <p className="italic text-sm mb-4">Thí sinh đọc đoạn ngữ liệu và chọn Đúng hoặc Sai cho mỗi ý a, b, c, d.</p>
              <div className="space-y-6">
                {exam.trueFalse.map((q, index) => (
                  <div key={q.id} className="break-inside-avoid border border-gray-300 p-4 rounded-lg bg-gray-50/50">
                    <p className="font-semibold mb-2">
                      <span className="underline">Câu {index + 1}:</span> Đọc đoạn tư liệu sau:
                      <span className="text-xs font-normal text-gray-500 ml-2 italic">[{q.level}]</span>
                    </p>
                    <div className="mb-4 p-3 bg-white border-l-4 border-gray-400 text-gray-800 text-sm italic">
                      {q.context}
                    </div>
                    <div className="space-y-2 ml-4">
                      {q.statements.map((stmt, i) => {
                        const label = String.fromCharCode(97 + i); // a, b, c, d
                        return (
                          <div key={stmt.id} className="flex items-start gap-2">
                            <span className="font-semibold w-6">{label}.</span>
                            <span className="flex-1">{stmt.statement}</span>
                            <span className={`font-bold ml-4 ${stmt.isTrue ? "text-green-600" : "text-red-600"}`}>
                              [{stmt.isTrue ? "Đúng" : "Sai"}]
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Part 3: Essay */}
          {exam.essay && exam.essay.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-3 uppercase mt-6">Phần III. Tự luận ({exam.essay.length} câu)</h3>
              <div className="space-y-6">
                {exam.essay.map((q, index) => (
                  <div key={q.id} className="break-inside-avoid">
                    <p className="font-semibold mb-2">
                      <span className="underline">Câu {index + 1}:</span> {q.question}
                      <span className="text-xs font-normal text-gray-500 ml-2 italic">[{q.level}]</span>
                    </p>
                    <div className="ml-4 p-3 bg-gray-50 border-l-4 border-gray-300 text-sm">
                      <span className="font-bold italic underline">Hướng dẫn chấm:</span> {q.rubric}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
