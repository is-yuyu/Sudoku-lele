// 分支点全局store，管理分支点的增删查改和本地存储同步
import { writable } from 'svelte/store';
import BranchPoint from '../models/BranchPoint.js';
import { get } from 'svelte/store';
import { userGrid } from '@sudoku/stores/grid';
import { candidates } from '@sudoku/stores/candidates';
import { derived } from 'svelte/store';

// 读取本地存储的所有分支点
function loadBranchPoints() {
    const arr = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('branchpoint_')) {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    const obj = JSON.parse(data);
                    arr.push(new BranchPoint(obj.id, obj.name, obj.timestamp, obj.boardData, obj.steps));
                } catch (e) {
                    // 数据损坏，跳过
                }
            }
        }
    }
    // 按时间排序
    arr.sort((a, b) => b.timestamp - a.timestamp);
    return arr;
}

function createBranchPointsStore() {
    const { subscribe, set, update } = writable(loadBranchPoints());

    return {
        subscribe,
        // 新增分支点
        add: (branchPoint) => {
            branchPoint.save();
            update(list => {
                const newList = [branchPoint, ...list];
                // 最多10个，超出删除最早的
                if (newList.length > 10) {
                    const last = newList.pop();
                    last.delete();
                }
                return newList;
            });
        },
        // 删除分支点
        remove: (id) => {
            BranchPoint.restore(id)?.delete();
            update(list => list.filter(bp => bp.id !== id));
        },
        // 恢复分支点
        restore: (id) => {
            return BranchPoint.restore(id);
        },
        // 刷新（如外部有变动）
        refresh: () => set(loadBranchPoints())
    };
}

export const branchPoints = createBranchPointsStore();

export function getCurrentBoardData() {
    // 深拷贝userGrid和candidates，避免引用问题
    const grid = JSON.parse(JSON.stringify(get(userGrid)));
    const cand = JSON.parse(JSON.stringify(get(candidates)));
    return {
        grid,
        candidates: cand
    };
}

function getCurrentStepCount() {
	// 返回实际的历史记录长度
	return historyStack.length;
}

export function restoreBoardData(boardData) {
	if (!boardData || !boardData.grid) return;
	
	const grid = boardData.grid;
	// 恢复棋盘数据
	for (let y = 0; y < grid.length; y++) {
		for (let x = 0; x < grid[y].length; x++) {
			userGrid.set({ x, y }, grid[y][x]);
		}
	}
	
	// 恢复候选数
	if (boardData.candidates) {
		// 先清空所有候选数
		for (let y = 0; y < 9; y++) {
			for (let x = 0; x < 9; x++) {
				candidates.clear({ x, y });
			}
		}
		// 恢复保存的候选数
		for (const key in boardData.candidates) {
			const [x, y] = key.split(',').map(Number);
			for (const n of boardData.candidates[key]) {
				candidates.add({ x, y }, n);
			}
		}
	}
}

let historyStack = [];
let redoStack = [];

export const historyLength = writable(0);
export const redoLength = writable(0);

function updateHistoryStores() {
    historyLength.set(historyStack.length);
    redoLength.set(redoStack.length);
}

export function pushHistory() {
    const grid = JSON.parse(JSON.stringify(get(userGrid)));
    const cand = JSON.parse(JSON.stringify(get(candidates)));
    historyStack.push({ grid, candidates: cand });
    if (historyStack.length > 50) historyStack.shift();
    redoStack = [];
    updateHistoryStores();
}

export function undoHistory() {
    if (historyStack.length === 0) return;
    const last = historyStack.pop();
    const grid = JSON.parse(JSON.stringify(get(userGrid)));
    const cand = JSON.parse(JSON.stringify(get(candidates)));
    redoStack.push({ grid, candidates: cand });
    restoreBoardData(last);
    updateHistoryStores();
}

export function redoHistory() {
    if (redoStack.length === 0) return;
    const next = redoStack.pop();
    const grid = JSON.parse(JSON.stringify(get(userGrid)));
    const cand = JSON.parse(JSON.stringify(get(candidates)));
    historyStack.push({ grid, candidates: cand });
    restoreBoardData(next);
    updateHistoryStores();
}

export const canUndo = derived([], () => historyStack.length > 0);
export const canRedo = derived([], () => redoStack.length > 0); 