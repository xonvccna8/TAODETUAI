
import React, { useState, useEffect } from 'react';
import { ExamData } from '../types';
import { Clock, CheckCircle, XCircle, ChevronLeft, Send, Award, RotateCcw, Scroll, BookOpen } from 'lucide-react';

interface Props {
  exam: ExamData;
  onExit: () => void;
}

export const StudentExam: React.FC<Props> = ({ exam, onExit }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [tfAnswers, setTfAnswers] = useState<Record<string, Record<string, boolean>>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(50 * 60); // 50 minutes in seconds (THPT 2025)

  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (questionId: string, optionKey: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionKey }));
  };

  const handleTfSelect = (questionId: string, statementId: string, value: boolean) => {
    if (isSubmitted) return;
    setTfAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [statementId]: value
      }
    }));
  };

  const cleanOptionText = (text: string) => {
    return text.replace(/^([A-D][.:)]\s*)+/i, "").trim();
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    
    let totalScore = 0;

    exam.multipleChoice.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        totalScore += 0.25;
      }
    });

    if (exam.trueFalse) {
      exam.trueFalse.forEach(q => {
        let correctStmts = 0;
        const qAnswers = tfAnswers[q.id] || {};
        
        q.statements.forEach(stmt => {
          if (qAnswers[stmt.id] !== undefined && qAnswers[stmt.id] === stmt.isTrue) {
            correctStmts++;
          }
        });

        if (correctStmts === 1) totalScore += 0.1;
        else if (correctStmts === 2) totalScore += 0.25;
        else if (correctStmts === 3) totalScore += 0.5;
        else if (correctStmts === 4) totalScore += 1.0;
      });
    }

    setScore(totalScore);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getScoreColor = () => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-gold-400';
    return 'text-red-600';
  };

  return (
    <div className="bg-parchment-100 min-h-screen pb-12 font-sans">
      {/* Header */}
      <div className="header-gradient text-white sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button 
            onClick={onExit}
            className="flex items-center gap-1 text-gold-200/70 hover:text-white transition"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">Quay lại</span>
          </button>
          
          <div className="flex flex-col items-center">
             <h1 className="font-bold text-sm sm:text-base truncate max-w-[200px] sm:max-w-md heading-serif">
              {exam.title}
             </h1>
             {!isSubmitted && (
               <div className={`text-xs font-mono font-bold flex items-center gap-1 ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-gold-200'}`}>
                 <Clock className="w-3 h-3" />
                 {formatTime(timeLeft)}
               </div>
             )}
          </div>

          <div className="w-24 flex justify-end">
            {isSubmitted && (
                <span className={`font-bold text-lg heading-serif ${getScoreColor()}`}>
                  {score.toFixed(2)}/10
                </span>
            )}
          </div>
        </div>
        <div className="gold-line"></div>
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Result Banner */}
        {isSubmitted && (
          <div className="card-history rounded-2xl p-6 border-l-4 border-l-gold-300 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gold-50 p-3 rounded-full">
                <Award className="w-8 h-8 text-gold-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-burgundy-800 heading-serif">Kết quả bài làm</h2>
                <p className="text-burgundy-600">
                  Điểm của bạn: <strong className={`text-xl ${getScoreColor()}`}>{score.toFixed(2)} / 10 điểm</strong>
                </p>
              </div>
            </div>
            <p className="text-sm text-parchment-500 italic">
              * Đối với phần tự luận, vui lòng đối chiếu bài làm của bạn với đáp án gợi ý bên dưới.
            </p>
            <button 
               onClick={onExit}
               className="mt-4 px-5 py-2.5 bg-parchment-200 hover:bg-parchment-300 text-burgundy-700 rounded-xl font-semibold transition flex items-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" /> Làm đề khác
            </button>
          </div>
        )}

        {/* School Header on Paper */}
        <div className="card-history rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-burgundy-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Scroll className="w-6 h-6 text-burgundy-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-burgundy-800 heading-serif">{exam.title}</h2>
            <div className="mt-2 text-sm text-parchment-500">
              Môn: Lịch Sử • {exam.config.grade} • 50 phút
            </div>
        </div>

        {/* Multiple Choice Section */}
        {exam.multipleChoice.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-parchment-300">
              <span className="badge-section">PHẦN 1</span>
              <h3 className="font-bold text-burgundy-800 text-lg heading-serif">Trắc nghiệm</h3>
              <span className="text-xs text-parchment-500 ml-auto">{exam.multipleChoice.length} câu</span>
            </div>

            {exam.multipleChoice.map((q, idx) => {
              const isCorrect = isSubmitted && answers[q.id] === q.correctAnswer;
              const isWrong = isSubmitted && answers[q.id] !== q.correctAnswer && answers[q.id];

              return (
                <div 
                  key={q.id} 
                  className={`card-history rounded-xl p-4 sm:p-5 transition-all ${
                    isSubmitted 
                      ? isCorrect 
                        ? 'border-green-300 bg-green-50/50' 
                        : isWrong 
                          ? 'border-red-300 bg-red-50/30'
                          : ''
                      : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-burgundy-100 text-burgundy-600 font-bold flex items-center justify-center text-sm">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-burgundy-900 mb-3 leading-relaxed">{q.question}</p>
                      
                      <div className="space-y-2.5">
                        {q.options.map((opt, i) => {
                          const key = String.fromCharCode(65 + i);
                          const isSelected = answers[q.id] === key;
                          const isThisCorrect = q.correctAnswer === key;
                          
                          let containerClass = "border-parchment-300 hover:bg-parchment-50 cursor-pointer";
                          let dotClass = "border-parchment-400";

                          if (!isSubmitted) {
                            if (isSelected) {
                                containerClass = "border-burgundy-400 bg-burgundy-50";
                                dotClass = "border-burgundy-500 bg-burgundy-500";
                            }
                          } else {
                            if (isThisCorrect) {
                                containerClass = "border-green-400 bg-green-100";
                                dotClass = "border-green-500 bg-green-500";
                            } else if (isSelected && !isThisCorrect) {
                                containerClass = "border-red-400 bg-red-100";
                                dotClass = "border-red-500 bg-red-500";
                            } else {
                                containerClass = "border-parchment-200 opacity-50";
                            }
                          }

                          return (
                            <div 
                              key={i}
                              onClick={() => handleOptionSelect(q.id, key)}
                              className={`relative group flex items-start gap-3 p-3 rounded-xl border-2 transition-all ${containerClass}`}
                            >
                              <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${dotClass}`}>
                                {((!isSubmitted && isSelected) || (isSubmitted && (isThisCorrect || isSelected))) && (
                                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                )}
                              </div>
                              <span className="text-sm sm:text-base text-burgundy-800">{cleanOptionText(opt)}</span>
                              
                              {isSubmitted && isThisCorrect && (
                                <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-600" />
                              )}
                              {isSubmitted && isSelected && !isThisCorrect && (
                                <XCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* True/False Section */}
        {exam.trueFalse && exam.trueFalse.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-parchment-300">
              <span className="badge-section">PHẦN 2</span>
              <h3 className="font-bold text-burgundy-800 text-lg heading-serif">Trắc nghiệm Đúng/Sai</h3>
              <span className="text-xs text-parchment-500 ml-auto">{exam.trueFalse.length} câu</span>
            </div>

            {exam.trueFalse.map((q, idx) => {
              const qAnswers = tfAnswers[q.id] || {};
              
              let questionScore = 0;
              if (isSubmitted) {
                let correctStmts = 0;
                q.statements.forEach(stmt => {
                  if (qAnswers[stmt.id] === stmt.isTrue) correctStmts++;
                });
                if (correctStmts === 1) questionScore = 0.1;
                else if (correctStmts === 2) questionScore = 0.25;
                else if (correctStmts === 3) questionScore = 0.5;
                else if (correctStmts === 4) questionScore = 1.0;
              }

              return (
                <div key={q.id} className="card-history rounded-xl p-4 sm:p-5 relative">
                  {isSubmitted && (
                    <div className="absolute top-4 right-4 badge-gold">
                      +{questionScore}đ
                    </div>
                  )}
                  <div className="flex gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-burgundy-100 text-burgundy-600 font-bold flex items-center justify-center text-sm">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-burgundy-800 leading-relaxed mb-2">Đọc đoạn tư liệu sau:</p>
                      <div className="p-3 bg-parchment-50 border-l-4 border-gold-300 text-sm italic mb-4 text-burgundy-700 rounded-r-lg">
                        {q.context}
                      </div>
                      
                      <div className="space-y-3">
                        {q.statements.map((stmt, i) => {
                          const label = String.fromCharCode(97 + i);
                          const selectedValue = qAnswers[stmt.id];
                          const hasAnswered = selectedValue !== undefined;
                          const isCorrect = isSubmitted && selectedValue === stmt.isTrue;
                          const isWrong = isSubmitted && hasAnswered && selectedValue !== stmt.isTrue;

                          let bgColor = "bg-parchment-50";
                          let borderColor = "border-parchment-300";
                          if (isSubmitted) {
                            if (isCorrect) {
                              bgColor = "bg-green-50";
                              borderColor = "border-green-300";
                            } else if (isWrong) {
                              bgColor = "bg-red-50";
                              borderColor = "border-red-300";
                            }
                          }

                          return (
                            <div key={stmt.id} className={`p-3 rounded-xl border ${bgColor} ${borderColor} transition-colors`}>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1 flex gap-2">
                                  <span className="font-bold text-burgundy-600">{label}.</span>
                                  <span className="text-burgundy-800 text-sm">{stmt.statement}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-shrink-0">
                                  {isSubmitted && hasAnswered && isCorrect && <CheckCircle className="w-5 h-5 text-green-600 mr-1" />}
                                  {isSubmitted && hasAnswered && isWrong && <XCircle className="w-5 h-5 text-red-500 mr-1" />}
                                  
                                  <button
                                    onClick={() => handleTfSelect(q.id, stmt.id, true)}
                                    disabled={isSubmitted}
                                    className={`tf-btn tf-btn-true ${selectedValue === true ? 'active' : ''} ${isSubmitted ? 'opacity-70 cursor-not-allowed' : ''}`}
                                  >
                                    Đúng
                                  </button>
                                  <button
                                    onClick={() => handleTfSelect(q.id, stmt.id, false)}
                                    disabled={isSubmitted}
                                    className={`tf-btn tf-btn-false ${selectedValue === false ? 'active' : ''} ${isSubmitted ? 'opacity-70 cursor-not-allowed' : ''}`}
                                  >
                                    Sai
                                  </button>
                                </div>
                              </div>
                              {isSubmitted && isWrong && (
                                <p className="text-xs text-red-600 mt-2 font-medium">
                                  (Đáp án đúng là: {stmt.isTrue ? "Đúng" : "Sai"})
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Essay Section */}
        {exam.essay && exam.essay.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-parchment-300">
              <span className="badge-section">PHẦN 3</span>
              <h3 className="font-bold text-burgundy-800 text-lg heading-serif">Tự luận</h3>
            </div>

            {exam.essay.map((q, idx) => (
              <div key={q.id} className="card-history rounded-xl p-4 sm:p-5">
                <div className="flex gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-burgundy-100 text-burgundy-600 font-bold flex items-center justify-center text-sm">
                      {idx + 1}
                    </span>
                    <p className="font-medium text-burgundy-800 leading-relaxed">{q.question}</p>
                </div>
                
                <textarea 
                  disabled={isSubmitted}
                  placeholder="Nhập câu trả lời của bạn..."
                  className="w-full min-h-[120px] p-3 input-history disabled:bg-parchment-100 disabled:text-parchment-500"
                ></textarea>

                {isSubmitted && (
                  <div className="mt-4 p-4 bg-gold-50 border border-gold-200 rounded-xl animate-fade-in">
                    <h4 className="font-bold text-gold-500 text-sm mb-1">Gợi ý đáp án / Hướng dẫn chấm:</h4>
                    <p className="text-burgundy-700 text-sm">{q.rubric}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer Action */}
        {!isSubmitted && (
            <div className="sticky bottom-4 z-30">
                <button 
                onClick={handleSubmit}
                className="w-full btn-primary flex items-center justify-center gap-2 text-lg py-4"
                >
                <Send className="w-5 h-5" /> Nộp bài
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
