import { AppData, DigraphGroup, Progress, RhymeGroup } from '../types';
import { INITIAL_GROUPS, INITIAL_RHYME_GROUPS, DEFAULT_PIN } from '../constants';

const DATA_KEY = 'digraph_app_data';
const PROGRESS_KEY = 'digraph_app_progress';

export const getAppData = (): AppData => {
  const stored = localStorage.getItem(DATA_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Migration: Ensure rhymeGroups exists if loading older data
      if (!parsed.rhymeGroups) {
        parsed.rhymeGroups = INITIAL_RHYME_GROUPS;
      }
      return parsed;
    } catch (e) {
      console.error("Failed to parse stored data", e);
      // Fallback
    }
  }
  return {
    groups: INITIAL_GROUPS,
    rhymeGroups: INITIAL_RHYME_GROUPS,
    pin: DEFAULT_PIN
  };
};

export const saveAppData = (data: AppData) => {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
};

export const getProgress = (): Progress => {
  const stored = localStorage.getItem(PROGRESS_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const saveProgress = (progress: Progress) => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

export const updateProgress = (digraph: string, isCorrect: boolean) => {
  const progress = getProgress();
  if (!progress[digraph]) {
    progress[digraph] = { correct: 0, total: 0 };
  }
  progress[digraph].total += 1;
  if (isCorrect) progress[digraph].correct += 1;
  saveProgress(progress);
};

export const resetProgress = () => {
  localStorage.removeItem(PROGRESS_KEY);
};