import { writable } from 'svelte/store';

// 默认设置
const defaultSettings = {
  displayTimer: true,
  hintsLimited: false,
  hints: 3,
  highlightCells: true,
  highlightSame: true,
  highlightConflicting: true,
  showErrors: true,
  onlyAllowCandidates: false // 新增：仅允许填入候选数
};

function createSettings() {
  // 尝试从localStorage读取
  let initial = defaultSettings;
  try {
    const saved = localStorage.getItem('sudoku_settings');
    if (saved) {
      initial = { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (e) {}

  const { subscribe, set, update } = writable(initial);

  // 每次设置变更时保存到localStorage
  subscribe(value => {
    try {
      localStorage.setItem('sudoku_settings', JSON.stringify(value));
    } catch (e) {}
  });

  return {
    subscribe,
    set,
    update
  };
}

export const settings = createSettings(); 