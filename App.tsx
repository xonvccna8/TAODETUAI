import React, { useState, useEffect } from 'react';
import { ExamConfigForm } from './components/ExamConfigForm';
import { ExamPaper } from './components/ExamPaper';
import { HistoryList } from './components/HistoryList';
import { StudentExam } from './components/StudentExam';
import { ExamConfig, ExamData } from './types';
import { generateExam } from './services/geminiService';
import { saveExamToStorage, getSavedExams, deleteExam } from './services/storageService';
import { BookOpen, AlertCircle, Scroll, Landmark, Star } from 'lucide-react';

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
    setViewMode('teacher');
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
    <div className="min-h-screen bg-parchment-100 pb-12">
      {/* Header */}
      <header className="header-gradient text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gold-300/20 p-2.5 rounded-xl border border-gold-300/30">
              <Scroll className="w-6 h-6 text-gold-200" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight heading-serif tracking-wide">GenHistory Exam Pro</h1>
              <p className="text-xs text-gold-200/70">Tạo đề thi Lịch sử THPT • Chuẩn cấu trúc 2025</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-gold-200/50 text-xs">
            <Landmark className="w-4 h-4" />
            <span>Powered by ChatGPT AI</span>
          </div>
        </div>
        <div className="gold-line"></div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 border-l-4 border-l-red-500 p-4 rounded-xl flex items-center gap-3 text-red-700 shadow-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
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
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center card-history rounded-2xl border-2 border-dashed border-parchment-400 text-parchment-500">
                <div className="w-20 h-20 bg-parchment-200 rounded-full flex items-center justify-center mb-5">
                  <Scroll className="w-10 h-10 opacity-40 text-burgundy-400" />
                </div>
                <p className="text-lg font-semibold heading-serif text-burgundy-600">Chưa có đề thi nào được chọn</p>
                <p className="text-sm mt-2 text-parchment-500 max-w-xs text-center">Hãy thiết lập thông số và nhấn "Tạo Đề Thi Ngay" hoặc chọn từ lịch sử bên trái.</p>
                <div className="flex items-center gap-1 mt-4 text-gold-400">
                  <Star className="w-3 h-3" /><Star className="w-3 h-3" /><Star className="w-3 h-3" />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;