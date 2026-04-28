import React from 'react';
import { ExamData } from '../types';
import { History, FileText, Trash2 } from 'lucide-react';

interface Props {
  exams: ExamData[];
  onSelect: (exam: ExamData) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
}

export const HistoryList: React.FC<Props> = ({ exams, onSelect, onDelete, selectedId }) => {
  if (exams.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Chưa có đề thi nào được lưu.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[600px]">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          <History className="w-4 h-4" />
          Lịch sử tạo đề
        </h3>
      </div>
      <div className="overflow-y-auto flex-1 p-2 space-y-2">
        {exams.map((exam) => (
          <div 
            key={exam.id}
            className={`p-3 rounded-lg border transition-all cursor-pointer group relative ${
              selectedId === exam.id 
                ? 'bg-edu-50 border-edu-500 shadow-sm' 
                : 'bg-white border-gray-100 hover:border-edu-200 hover:bg-gray-50'
            }`}
            onClick={() => onSelect(exam)}
          >
            <div className="pr-6">
              <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">{exam.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{new Date(exam.timestamp).toLocaleString('vi-VN')}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                  {exam.config.grade}
                </span>
                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                  {exam.config.mcCount} TN / {exam.config.tfCount || 0} ĐS / {exam.config.essayCount || 0} TL
                </span>
              </div>
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(exam.id); }}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Xóa đề này"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
