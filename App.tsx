import React, { useState, useEffect } from 'react';
import { ExamConfigForm } from './components/ExamConfigForm';
import { ExamPaper } from './components/ExamPaper';
import { HistoryList } from './components/HistoryList';
import { StudentExam } from './components/StudentExam';
import { ExamConfig, ExamData } from './types';
import { generateExam } from './services/geminiService';
import { saveExamToStorage, getSavedExams, deleteExam } from './services/storageService';
import { BookOpen, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentExam, setCurrentExam] = useState<ExamData | null>(null);
  const [history, setHistory] = useState<ExamData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'teacher' | 'student'>('teacher');

  // Load history on mount
  useEffect(() => {
    setHistory(getSavedExams());
  }, []);

  const handleGenerate = async (config: ExamConfig) => {
    setIsGenerating(true);
    setError(null);
    try {
      const newExam = await generateExam(config);
      setCurrentExam(newExam);
      saveExamToStorage(newExam);
      setHistory(getSavedExams());
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tạo đề thi. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectExam = (exam: ExamData) => {
    setCurrentExam(exam);
    setError(null);
    setViewMode('teacher'); // Always switch back to teacher view when selecting a new exam
    // Scroll to top of preview on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteExam = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đề thi này không?")) {
      deleteExam(id);
      setHistory(getSavedExams());
      if (currentExam?.id === id) {
        setCurrentExam(null);
      }
    }
  };

  // Render Student View (Full Screen)
  if (viewMode === 'student' && currentExam) {
    return <StudentExam exam={currentExam} onExit={() => setViewMode('teacher')} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* Header */}
      <header className="bg-edu-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">GenHistory Exam Pro</h1>
              <p className="text-xs text-white/60">Tạo đề thi Lịch sử THPT chuẩn 2025</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3 text-red-700 shadow-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Configuration & History (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <ExamConfigForm onGenerate={handleGenerate} isGenerating={isGenerating} />
            <HistoryList 
              exams={history} 
              onSelect={handleSelectExam} 
              onDelete={handleDeleteExam}
              selectedId={currentExam?.id}
            />
          </div>

          {/* Right Column: Preview (8 cols) */}
          <div className="lg:col-span-8">
            {currentExam ? (
              <ExamPaper 
                exam={currentExam} 
                onTakeExam={() => setViewMode('student')}
              />
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 opacity-40" />
                </div>
                <p className="text-lg font-medium">Chưa có đề thi nào được chọn</p>
                <p className="text-sm mt-2">Hãy thiết lập thông số và nhấn "Tạo Đề Thi Ngay" hoặc chọn từ lịch sử.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;