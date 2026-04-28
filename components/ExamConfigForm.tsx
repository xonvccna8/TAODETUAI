
import React, { useState } from 'react';
import { ExamConfig, CognitiveLevel } from '../types';
import { Loader2, Wand2, Sparkles, GraduationCap } from 'lucide-react';

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

const LEVEL_COLORS: Record<string, string> = {
  [CognitiveLevel.NHAN_BIET]: 'text-green-700',
  [CognitiveLevel.THONG_HIEU]: 'text-blue-700',
  [CognitiveLevel.VAN_DUNG]: 'text-orange-700',
  [CognitiveLevel.VAN_DUNG_CAO]: 'text-red-700',
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
    <div className="card-history p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-burgundy-500/10 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-burgundy-500" />
          </div>
          <h2 className="text-lg font-bold heading-serif text-burgundy-800">Thiết lập Đề thi</h2>
        </div>
        <button
          type="button"
          onClick={() => setConfig(prev => ({ ...prev, mcCount: 24, tfCount: 4, essayCount: 0 }))}
          className="text-xs badge-gold flex items-center gap-1 hover:opacity-80 transition cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          Chuẩn THPT 2025
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-burgundy-700 mb-1.5">📜 Chủ đề / Nội dung</label>
            <input
              type="text"
              required
              placeholder="VD: Cách mạng tháng Tám năm 1945"
              className="w-full input-history"
              value={config.topic}
              onChange={e => setConfig({ ...config, topic: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-burgundy-700 mb-1.5">🎓 Khối Lớp</label>
            <select
              className="w-full input-history"
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

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-parchment-50 p-3 rounded-xl border border-parchment-300">
            <label className="block text-xs font-bold text-burgundy-600 mb-1.5" title="Phần 1: Trắc nghiệm nhiều lựa chọn">
              📝 TN (Phần 1)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              className="w-full input-history text-center font-bold text-lg"
              value={config.mcCount}
              onChange={e => setConfig({ ...config, mcCount: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="bg-parchment-50 p-3 rounded-xl border border-parchment-300">
            <label className="block text-xs font-bold text-burgundy-600 mb-1.5" title="Phần 2: Trắc nghiệm Đúng/Sai">
              ✅ Đ/S (Phần 2)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              className="w-full input-history text-center font-bold text-lg"
              value={config.tfCount}
              onChange={e => setConfig({ ...config, tfCount: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="bg-parchment-50 p-3 rounded-xl border border-parchment-300">
            <label className="block text-xs font-bold text-burgundy-600 mb-1.5" title="Tự luận truyền thống">
              ✍️ Tự luận
            </label>
            <input
              type="number"
              min="0"
              max="10"
              className="w-full input-history text-center font-bold text-lg"
              value={config.essayCount || 0}
              onChange={e => setConfig({ ...config, essayCount: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="p-4 bg-parchment-50 rounded-xl border border-parchment-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-burgundy-700 text-sm flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" /> Ma trận nhận thức
            </h3>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${totalPercent === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {totalPercent}%
            </span>
          </div>
          
          <div className="space-y-3">
            {Object.values(CognitiveLevel).map((level) => (
              <div key={level} className="flex items-center gap-3">
                <label className={`w-28 text-xs font-bold ${LEVEL_COLORS[level] || 'text-gray-600'}`}>{level}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  className="flex-1"
                  value={config.distribution[level]}
                  onChange={e => handleDistributionChange(level, parseInt(e.target.value))}
                />
                <span className="w-10 text-sm font-bold text-burgundy-700 text-right">{config.distribution[level]}%</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full btn-primary flex items-center justify-center gap-2 text-base"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              Đang tạo đề (ChatGPT)...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Tạo Đề Thi Ngay
            </>
          )}
        </button>
      </form>
    </div>
  );
};
