<script>
	import { onMount } from 'svelte';
	import { validateSencode } from '@sudoku/sencode';
	import game from '@sudoku/game';
	import { modal } from '@sudoku/stores/modal';
	import { gameWon } from '@sudoku/stores/game';
	import Board from './components/Board/index.svelte';
	import Controls from './components/Controls/index.svelte';
	import Header from './components/Header/index.svelte';
	import Modal from './components/Modal/index.svelte';
	import { branchPoints, historyLength } from './stores/branchPoints.js';
	import BranchPoint from './models/BranchPoint.js';
	import { userGrid } from '@sudoku/stores/grid';
	import { candidates } from '@sudoku/stores/candidates';
	import { solution } from './stores/solution.js';
	import { get } from 'svelte/store';

	gameWon.subscribe(won => {
		if (won) {
			game.pause();
			modal.show('gameover');
		}
	});

	// 监听userGrid变化，当游戏开始时计算正确答案
	let lastCalculationTime = 0;
	const CALCULATION_DEBOUNCE = 1000; // 1秒防抖
	let settings = null;
	
	// 导入settings store
	import { settings as settingsStore } from '@sudoku/stores/settings';
	
	// 监听settings变化
	settingsStore.subscribe($settings => {
		settings = $settings;
	});
	
	userGrid.subscribe($userGrid => {
		// 只有在开启错误检测时才计算正确答案
		if (!settings || !settings.showErrors) {
			return;
		}
		
		const now = Date.now();
		if (now - lastCalculationTime < CALCULATION_DEBOUNCE) {
			return; // 防抖，避免频繁计算
		}
		
		// 检查是否有足够的数字开始游戏（至少17个数字）
		let filledCount = 0;
		for (let y = 0; y < 9; y++) {
			for (let x = 0; x < 9; x++) {
				if ($userGrid[y][x] !== 0) {
					filledCount++;
				}
			}
		}
		
		// 如果有足够的数字，计算正确答案
		if (filledCount >= 17) {
			try {
				lastCalculationTime = now;
				solution.setSolution($userGrid);
			} catch (error) {
				console.error('计算正确答案时出错:', error);
			}
		}
	});

	let showBranchModal = false;
	let branchName = '';
	let branchError = '';
	let confirmRestoreId = null;
	let confirmDeleteId = null;
	let confirmDeleteName = '';

	let showImportModal = false;
	let importUrl = '';
	let importError = '';

	let editingBranchId = null;
	let editingBranchName = '';

	// 获取当前棋盘快照和步数
	function getCurrentBoardData() {
		// 从userGrid和candidates获取当前棋盘和候选数，序列化为对象
		const grid = JSON.parse(JSON.stringify(get(userGrid)));
		const cand = JSON.parse(JSON.stringify(get(candidates)));
		return {
			grid,
			candidates: cand
		};
	}
	function getCurrentStepCount() {
		// 获取当前步数（基于历史记录长度）
		return get(historyLength);
	}

	function handleAddBranch() {
		if (branchPoints && $branchPoints.length >= 10) {
			branchError = '最多保存10个分支点，请先删除部分分支点';
			return;
		}
		const id = Date.now().toString();
		const name = branchName.trim() || `分支点 - ${new Date().toLocaleTimeString()}`;
		const timestamp = Date.now();
		const boardData = getCurrentBoardData();
		const steps = getCurrentStepCount();
		const bp = new BranchPoint(id, name, timestamp, boardData, steps);
		branchPoints.add(bp);
		branchName = '';
		branchError = '';
		showBranchModal = false;
	}

	function handleDeleteBranch(id, name) {
		confirmDeleteId = id;
		confirmDeleteName = name;
	}

	function confirmDelete() {
		branchPoints.remove(confirmDeleteId);
		confirmDeleteId = null;
		confirmDeleteName = '';
	}

	function cancelDelete() {
		confirmDeleteId = null;
		confirmDeleteName = '';
	}

	function handleRestoreBranch(id) {
		confirmRestoreId = id;
	}

	function confirmRestore() {
		const bp = branchPoints.restore(confirmRestoreId);
		if (bp) {
			// 恢复棋盘状态（反序列化bp.boardData）
			const boardData = bp.boardData;
			if (boardData && boardData.grid) {
				// 恢复棋盘数据
				for (let y = 0; y < boardData.grid.length; y++) {
					for (let x = 0; x < boardData.grid[y].length; x++) {
						userGrid.set({ x, y }, boardData.grid[y][x]);
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
		}
		confirmRestoreId = null;
		showBranchModal = false;
	}

	function cancelRestore() {
		confirmRestoreId = null;
	}

	function handleImportSudokuWiki() {
		showImportModal = true;
		importUrl = '';
		importError = '';
	}

	async function doImport() {
		importError = '';
		try {
			const res = await fetch(importUrl);
			const html = await res.text();
			// 解析棋盘数据
			const match = html.match(/var puzzle = \"([0-9\.]{81})\"/);
			if (!match) {
				importError = '未找到有效棋盘数据';
				return;
			}
			const puzzle = match[1].replace(/\./g, '0').split('').map(Number);
			if (puzzle.length !== 81) {
				importError = '棋盘数据长度不正确';
				return;
			}
			// 解析难度标签
			let difficulty = '';
			// 1. 尝试查找id="level"
			const levelMatch = html.match(/<span[^>]*id=['\"]level['\"][^>]*>([^<]+)<\/span>/i);
			if (levelMatch) {
				difficulty = levelMatch[1].trim();
			} else {
				// 2. 尝试查找"Difficulty: xxx"
				const diffMatch = html.match(/Difficulty:\s*<\/b>\s*([A-Za-z]+)/i);
				if (diffMatch) {
					difficulty = diffMatch[1].trim();
				}
			}
			// 转为9x9数组并加载
			for (let y = 0; y < 9; y++) {
				for (let x = 0; x < 9; x++) {
					userGrid.set({ x, y }, puzzle[y * 9 + x]);
				}
			}
			showImportModal = false;
			// 弹窗提示难度
			if (difficulty) {
				alert(`导入成功，难度评级：${difficulty}`);
			} else {
				alert('导入成功，未能识别难度标签');
			}
		} catch (e) {
			importError = 'URL解析失败或网络错误';
		}
	}

	function handleEditBranch(id, currentName) {
		editingBranchId = id;
		editingBranchName = currentName;
	}

	function saveBranchName() {
		if (editingBranchId && editingBranchName.trim()) {
			// 更新分支点名称
			const bp = branchPoints.restore(editingBranchId);
			if (bp) {
				bp.name = editingBranchName.trim();
				bp.save();
				branchPoints.refresh();
			}
		}
		editingBranchId = null;
		editingBranchName = '';
	}

	function cancelEdit() {
		editingBranchId = null;
		editingBranchName = '';
	}

	onMount(() => {
		let hash = location.hash;

		if (hash.startsWith('#')) {
			hash = hash.slice(1);
		}

		let sencode;
		if (validateSencode(hash)) {
			sencode = hash;
		}

		modal.show('welcome', { onHide: game.resume, sencode });
	});
</script>

<!-- Timer, Menu, etc. -->
<header>
	<Header>
		<!-- 通过具名插槽传递导入按钮 -->
		<button slot="import" class="btn btn-header bg-primary text-white flex items-center justify-center" on:click={handleImportSudokuWiki} title="导入SudokuWiki题目">
			<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:1.5em;height:1.5em;">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
			</svg>
			<span class="ml-1">导入</span>
		</button>
	</Header>
</header>
<!-- Sudoku Field and Controls -->
<footer>
	<Controls />
</footer>

<Modal />

{#if showImportModal}
<div class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
    <div class="bg-white p-6 rounded shadow-xl max-w-xs">
        <div class="mb-2">请输入SudokuWiki题目页URL：</div>
        <input class="input input-bordered w-full mb-2" bind:value={importUrl} placeholder="https://www.sudokuwiki.org/Sudoku.htm?..." />
        {#if importError}
            <div class="text-red-500 mb-2">{importError}</div>
        {/if}
        <button class="btn btn-primary w-full mb-2" on:click={doImport}>解析并导入</button>
        <button class="btn w-full" on:click={() => showImportModal = false}>取消</button>
    </div>
</div>
{/if}

<!-- 删除分支点弹窗相关的所有代码（showBranchModal、分支点管理弹窗、confirmRestoreId、confirmDeleteId等） -->

<style global>
	@import "./styles/global.css";
	.branch-btn {
		border: 2px solid #fff;
		box-shadow: 0 0 0 2px #fff;
		z-index: 51;
	}
	/* 其它原有样式可继续合并到这里 */
</style>