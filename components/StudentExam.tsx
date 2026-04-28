
import React, { useState, useEffect } from 'react';
import { ExamData } from '../types';
import { Clock, CheckCircle, XCircle, ChevronLeft, Send, Award, RotateCcw } from 'lucide-react';

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

    // Part 1: Multiple Choice
    // In real exam: each is 0.25
    exam.multipleChoice.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        totalScore += 0.25;
      }
    });

    // Part 2: True/False
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
    // Assuming out of 10
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12 font-sans">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={onExit}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>
          
          <div className="flex flex-col items-center">
             <h1 className="font-bold text-gray-800 text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">
              {exam.title}
             </h1>
             {!isSubmitted && (
               <div className={`text-xs font-mono font-bold flex items-center gap-1 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
                 <Clock className="w-3 h-3" />
                 {formatTime(timeLeft)}
               </div>
             )}
          </div>

          <div className="w-24 flex justify-end">
            {isSubmitted && (
                <span className={`font-bold text-lg ${getScoreColor()}`}>
                  {score.toFixed(2)}/10
                </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8">
        
        {/* Result Banner */}
        {isSubmitted && (
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-edu-500 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-edu-100 p-3 rounded-full text-edu-600">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Kết quả bài làm</h2>
                <p className="text-gray-600">
                  Điểm Trắc nghiệm của bạn là <strong className={getScoreColor()}>{score.toFixed(2)} / 10 điểm</strong>.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 italic">
              * Đối với phần tự luận, vui lòng đối chiếu bài làm của bạn với đáp án gợi ý bên dưới.
            </p>
            <button 
               onClick={onExit}
               className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Làm đề khác
            </button>
          </div>
        )}

        {/* School Header on Paper */}
        <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase">ĐỀ THI MÔN LỊCH SỬ</h3>
            <h2 className="text-xl sm:text-2xl font-bold text-edu-900 mt-1">{exam.title}</h2>
            <div className="mt-2 text-sm text-gray-500">
              Môn: Lịch Sử • {exam.config.grade}
            </div>
        </div>

        {/* Multiple Choice Section */}
        {exam.multipleChoice.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <span className="bg-edu-600 text-white text-xs font-bold px-2 py-1 rounded">PHẦN 1</span>
              <h3 className="font-bold text-gray-800 text-lg">Trắc nghiệm</h3>
            </div>

            {exam.multipleChoice.map((q, idx) => {
              const isCorrect = isSubmitted && answers[q.id] === q.correctAnswer;
              const isWrong = isSubmitted && answers[q.id] !== q.correctAnswer && answers[q.id];
              const missed = isSubmitted && !answers[q.id];

              return (
                <div 
                  key={q.id} 
                  className={`bg-white rounded-xl shadow-sm border p-4 sm:p-6 transition-all ${
                    isSubmitted 
                      ? isCorrect 
                        ? 'border-green-200 bg-green-50/30' 
                        : isWrong 
                          ? 'border-red-200 bg-red-50/30'
                          : 'border-gray-200'
                      : 'border-gray-200 hover:border-edu-300'
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-sm">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-4 leading-relaxed">{q.question}</p>
                      
                      <div className="space-y-3">
                        {q.options.map((opt, i) => {
                          const key = String.fromCharCode(65 + i); // A, B, C, D
                          const isSelected = answers[q.id] === key;
                          const isThisCorrect = q.correctAnswer === key;
                          
                          let containerClass = "border-gray-200 hover:bg-gray-50 cursor-pointer";
                          let dotClass = "border-gray-300";

                          if (!isSubmitted) {
                            if (isSelected) {
                                containerClass = "border-edu-500 bg-edu-50";
                                dotClass = "border-edu-500 bg-edu-500";
                            }
                          } else {
                            // Submitted state styling
                            if (isThisCorrect) {
                                containerClass = "border-green-500 bg-green-100";
                                dotClass = "border-green-500 bg-green-500";
                            } else if (isSelected && !isThisCorrect) {
                                containerClass = "border-red-500 bg-red-100";
                                dotClass = "border-red-500 bg-red-500";
                            } else {
                                containerClass = "border-gray-200 opacity-60";
                            }
                          }

                          return (
                            <div 
                              key={i}
                              onClick={() => handleOptionSelect(q.id, key)}
                              className={`relative group flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${containerClass}`}
                            >
                              <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${dotClass}`}>
                                {((!isSubmitted && isSelected) || (isSubmitted && (isThisCorrect || isSelected))) && (
                                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                )}
                              </div>
                              <span className="text-sm sm:text-base text-gray-800">{cleanOptionText(opt)}</span>
                              
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
          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <span className="bg-edu-600 text-white text-xs font-bold px-2 py-1 rounded">PHẦN 2</span>
              <h3 className="font-bold text-gray-800 text-lg">Trắc nghiệm Đúng/Sai</h3>
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
                <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 relative">
                  {isSubmitted && (
                    <div className="absolute top-4 right-4 bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">
                      +{questionScore}đ
                    </div>
                  )}
                  <div className="flex gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-sm">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 leading-relaxed mb-2">Đọc đoạn tư liệu sau:</p>
                      <div className="p-3 bg-gray-50 border-l-4 border-gray-300 text-sm italic mb-4 text-gray-700">
                        {q.context}
                      </div>
                      
                      <div className="space-y-4">
                        {q.statements.map((stmt, i) => {
                          const label = String.fromCharCode(97 + i); // a, b, c, d
                          const selectedValue = qAnswers[stmt.id];
                          const hasAnswered = selectedValue !== undefined;
                          const isCorrect = isSubmitted && selectedValue === stmt.isTrue;
                          const isWrong = isSubmitted && hasAnswered && selectedValue !== stmt.isTrue;

                          let bgColor = "bg-white";
                          let borderColor = "border-gray-200";
                          if (isSubmitted) {
                            if (isCorrect) {
                              bgColor = "bg-green-50/50";
                              borderColor = "border-green-300";
                            } else if (isWrong) {
                              bgColor = "bg-red-50/50";
                              borderColor = "border-red-300";
                            }
                          }

                          return (
                            <div key={stmt.id} className={`p-3 rounded-lg border ${bgColor} ${borderColor} transition-colors`}>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1 flex gap-2">
                                  <span className="font-bold text-gray-700">{label}.</span>
                                  <span className="text-gray-800">{stmt.statement}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-shrink-0">
                                  {/* Right/Wrong Indicator (Submitted) */}
                                  {isSubmitted && hasAnswered && isCorrect && <CheckCircle className="w-5 h-5 text-green-600 mr-2" />}
                                  {isSubmitted && hasAnswered && isWrong && <XCircle className="w-5 h-5 text-red-500 mr-2" />}
                                  
                                  {/* Buttons */}
                                  <button
                                    onClick={() => handleTfSelect(q.id, stmt.id, true)}
                                    disabled={isSubmitted}
                                    className={`px-4 py-1.5 rounded text-sm font-semibold transition border ${
                                      selectedValue === true 
                                        ? 'bg-blue-600 text-white border-blue-600' 
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                    } ${isSubmitted ? 'opacity-70 cursor-not-allowed' : ''}`}
                                  >
                                    Đúng
                                  </button>
                                  <button
                                    onClick={() => handleTfSelect(q.id, stmt.id, false)}
                                    disabled={isSubmitted}
                                    className={`px-4 py-1.5 rounded text-sm font-semibold transition border ${
                                      selectedValue === false 
                                        ? 'bg-blue-600 text-white border-blue-600' 
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                    } ${isSubmitted ? 'opacity-70 cursor-not-allowed' : ''}`}
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
          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <span className="bg-edu-600 text-white text-xs font-bold px-2 py-1 rounded">PHẦN 3</span>
              <h3 className="font-bold text-gray-800 text-lg">Tự luận</h3>
            </div>

            {exam.essay.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-sm">
                      {idx + 1}
                    </span>
                    <p className="font-medium text-gray-800 leading-relaxed">{q.question}</p>
                </div>
                
                <textarea 
                  disabled={isSubmitted}
                  placeholder="Nhập câu trả lời của bạn..."
                  className="w-full min-h-[120px] p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-edu-500 outline-none text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                ></textarea>

                {isSubmitted && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg animate-fade-in">
                    <h4 className="font-bold text-yellow-800 text-sm mb-1">Gợi ý đáp án / Hướng dẫn chấm:</h4>
                    <p className="text-gray-700 text-sm">{q.rubric}</p>
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
                className="w-full bg-edu-600 hover:bg-edu-700 text-white font-bold py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 text-lg transition-transform active:scale-[0.98]"
                >
                <Send className="w-5 h-5" /> Nộp bài
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
