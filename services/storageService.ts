import { ExamData, SavedExamSummary } from "../types";

const STORAGE_KEY = 'genhistory_exams';

export const saveExamToStorage = (exam: ExamData) => {
  try {
    const existing = getSavedExams();
    const updated = [exam, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save exam", e);
  }
};

export const getSavedExams = (): ExamData[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const getExamById = (id: string): ExamData | undefined => {
  const exams = getSavedExams();
  return exams.find(e => e.id === id);
};

export const deleteExam = (id: string) => {
    const exams = getSavedExams();
    const updated = exams.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
