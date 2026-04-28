import React from 'react';
import { ExamData } from '../types';
import { History, Trash2, Clock, BookOpen } from 'lucide-react';

interface Props {
  exams: ExamData[];
  onSelect: (exam: ExamData) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
}

export const HistoryList: React.FC<Props> = ({ exams, onSelect, onDelete, selectedId }) => {
  if (exams.length === 0) {
    return (
      <div className="text-center p-6 card-history rounded-2xl">
        <div className="w-12 h-12 bg-parchment-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <History className="w-5 h-5 text-parchment-500" />
        </div>
        <p className="text-sm text-parchment-500">Chưa có đề thi nào được lưu.</p>
      </div>
    );
  }

  return (
    <div className="card-history rounded-2xl overflow-hidden flex flex-col max-h-[550px]">
      <div className="p-4 border-b border-parchment-300 bg-parchment-200/50">
        <h3 className="font-bold text-burgundy-700 flex items-center gap-2 text-sm heading-serif">
          <History className="w-4 h-4 text-gold-400" />
          Lịch sử tạo đề
          <span className="badge-gold ml-auto">{exams.length} đề</span>
        </h3>
      </div>
      <div className="overflow-y-auto flex-1 p-2.5 space-y-2">
        {exams.map((exam) => (
          <div 
            key={exam.id}
            className={`p-3 rounded-xl border transition-all cursor-pointer group relative ${
              selectedId === exam.id 
                ? 'bg-burgundy-50 border-burgundy-300 shadow-sm ring-1 ring-burgundy-200' 
                : 'bg-parchment-50 border-parchment-300 hover:border-gold-300 hover:bg-gold-50/30'
            }`}
            onClick={() => onSelect(exam)}
          >
            <div className="pr-7">
              <h4 className="font-semibold text-sm text-burgundy-800 line-clamp-1">{exam.title}</h4>
              <div className="flex items-center gap-1.5 mt-1.5 text-parchment-500">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{new Date(exam.timestamp).toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] bg-burgundy-100 text-burgundy-600 px-2 py-0.5 rounded-full font-semibold">
                  {exam.config.grade}
                </span>
                <span className="text-[10px] bg-parchment-200 text-parchment-600 px-2 py-0.5 rounded-full font-medium">
                  {exam.config.mcCount} TN / {exam.config.tfCount || 0} ĐS / {exam.config.essayCount || 0} TL
                </span>
              </div>
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(exam.id); }}
              className="absolute top-3 right-3 text-parchment-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
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
