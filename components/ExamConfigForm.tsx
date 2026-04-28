
import React, { useState } from 'react';
import { ExamConfig, CognitiveLevel } from '../types';
import { Loader2, Wand2 } from 'lucide-react';

interface Props {
  onGenerate: (config: ExamConfig) => void;
  isGenerating: boolean;
}

const DEFAULT_CONFIG: ExamConfig = {
  topic: '',
  grade: 'Lớp 12',
  mcCount: 24,
  tfCount: 4,
  essayCount: 0,
  distribution: {
    [CognitiveLevel.NHAN_BIET]: 40,
    [CognitiveLevel.THONG_HIEU]: 30,
    [CognitiveLevel.VAN_DUNG]: 20,
    [CognitiveLevel.VAN_DUNG_CAO]: 10,
  }
};

export const ExamConfigForm: React.FC<Props> = ({ onGenerate, isGenerating }) => {
  const [config, setConfig] = useState<ExamConfig>(DEFAULT_CONFIG);

  const totalPercent = Object.values(config.distribution).reduce((a: number, b: number) => a + b, 0);

  const handleDistributionChange = (level: CognitiveLevel, value: number) => {
    setConfig(prev => ({
      ...prev,
      distribution: {
        ...prev.distribution,
        [level]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPercent !== 100) {
      alert(`Tổng phần trăm các mức độ phải bằng 100%. Hiện tại: ${totalPercent}%`);
      return;
    }
    if (!config.topic.trim()) {
      alert("Vui lòng nhập chủ đề kiểm tra.");
      return;
    }
    onGenerate(config);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-edu-900">
          <Wand2 className="w-6 h-6" />
          <h2 className="text-xl font-bold">Thiết lập Đề thi</h2>
        </div>
        <button
          type="button"
          onClick={() => setConfig(prev => ({ ...prev, mcCount: 24, tfCount: 4, essayCount: 0 }))}
          className="text-xs bg-edu-100 text-edu-700 hover:bg-edu-200 px-3 py-1.5 rounded-md font-medium transition"
        >
          Cấu trúc chuẩn THPT 2025
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Chủ đề / Nội dung kiến thức</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Cách mạng tháng Tám năm 1945"
              className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-edu-500 focus:border-edu-500 outline-none transition"
              value={config.topic}
              onChange={e => setConfig({ ...config, topic: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khối Lớp</label>
            <select
              className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-edu-500 outline-none"
              value={config.grade}
              onChange={e => setConfig({ ...config, grade: e.target.value })}
            >
              <option value="Lớp 6">Lớp 6</option>
              <option value="Lớp 7">Lớp 7</option>
              <option value="Lớp 8">Lớp 8</option>
              <option value="Lớp 9">Lớp 9</option>
              <option value="Lớp 10">Lớp 10</option>
              <option value="Lớp 11">Lớp 11</option>
              <option value="Lớp 12">Lớp 12</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" title="Phần 1: Trắc nghiệm nhiều lựa chọn">TN (Phần 1)</label>
            <input
              type="number"
              min="0"
              max="50"
              className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-edu-500 outline-none"
              value={config.mcCount}
              onChange={e => setConfig({ ...config, mcCount: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" title="Phần 2: Trắc nghiệm Đúng/Sai">Đúng/Sai (Phần 2)</label>
            <input
              type="number"
              min="0"
              max="10"
              className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-edu-500 outline-none"
              value={config.tfCount}
              onChange={e => setConfig({ ...config, tfCount: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" title="Tự luận truyền thống">Tự luận (Cũ)</label>
            <input
              type="number"
              min="0"
              max="10"
              className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-edu-500 outline-none"
              value={config.essayCount || 0}
              onChange={e => setConfig({ ...config, essayCount: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Ma trận nhận thức</h3>
            <span className={`text-sm font-bold ${totalPercent === 100 ? 'text-green-600' : 'text-red-500'}`}>
              Tổng: {totalPercent}%
            </span>
          </div>
          
          <div className="space-y-4">
            {Object.values(CognitiveLevel).map((level) => (
              <div key={level} className="flex items-center gap-4">
                <label className="w-32 text-sm text-gray-600 font-medium">{level}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-edu-600"
                  value={config.distribution[level]}
                  onChange={e => handleDistributionChange(level, parseInt(e.target.value))}
                />
                <span className="w-12 text-sm font-bold text-gray-700 text-right">{config.distribution[level]}%</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-3 bg-edu-600 hover:bg-edu-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              Đang tạo đề (Gemini Flash Lite)...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Tạo Đề Thi Tiết Kiệm
            </>
          )}
        </button>
      </form>
    </div>
  );
};
