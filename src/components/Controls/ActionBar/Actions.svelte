<script>
	import { candidates } from '@sudoku/stores/candidates';
	import { userGrid, grid } from '@sudoku/stores/grid';
	import { cursor } from '@sudoku/stores/cursor';
	import { hints } from '@sudoku/stores/hints';
	import { notes } from '@sudoku/stores/notes';
	import { settings } from '@sudoku/stores/settings';
	import { keyboardDisabled } from '@sudoku/stores/keyboard';
	import { gamePaused } from '@sudoku/stores/game';
	import { undoHistory } from '../../../stores/branchPoints.js';
	import { redoHistory } from '../../../stores/branchPoints.js';
	import { canUndo, canRedo } from '../../../stores/branchPoints.js';
	import { historyLength, redoLength } from '../../../stores/branchPoints.js';
	import StrategyEngine from '../../../models/StrategyEngine.js';
	import Board from '../../../models/Board.js';
	import { modal } from '@sudoku/stores/modal';
	import { get } from 'svelte/store';
	import { createEventDispatcher } from 'svelte';
	import { branchPoints } from '../../../stores/branchPoints.js';
	import BranchPoint from '../../../models/BranchPoint.js';
	import { restoreBoardData } from '../../../stores/branchPoints.js';
	import { getCurrentBoardData } from '../../../stores/branchPoints.js';
	const dispatch = createEventDispatcher();

	$: hintsAvailable = $hints > 0;

	let isCalculatingHint = false; // 新增：是否正在计算提示
	let showBranchModal = false;
	let branchName = '';
	let branchError = '';
	let editingBranchId = null;
	let editingBranchName = '';
	let confirmRestoreId = null;
	let confirmDeleteId = null;
	let confirmDeleteName = '';

	export let showHintDetail = false;
	let lastHint = null;

	function handleHint() {
		if (hintsAvailable) {
			if ($candidates.hasOwnProperty($cursor.x + ',' + $cursor.y)) {
				candidates.clear($cursor);
			}

			userGrid.applyHint($cursor);
		}
	}

	// 显示提示
	function showHint(hint) {
		modal.show('hint', {
			hint: hint,
			onApply: () => {
				// 应用提示
				if (hint && hint.cell) {
					userGrid.set({ x: hint.cell.col, y: hint.cell.row }, hint.value);
				}
			},
			onLocate: () => {
				// 定位到提示位置
				if (hint && hint.cell) {
					cursor.set(hint.cell.col, hint.cell.row);
				}
			},
			onShowCandidates: () => {
				// 显示候选数
				if (hint && hint.cell) {
					showCandidateAnalysis(hint.cell.row, hint.cell.col);
				}
			}
		});
	}

	// 获取下一步提示
	async function getNextHint() {
		if (isCalculatingHint) {
			return; // 防止重复点击
		}
		
		try {
			isCalculatingHint = true;
			console.log('Getting next hint...');
			
			// 检查userGrid是否存在
			if (!$userGrid) {
				throw new Error('userGrid store is not available');
			}
			
			console.log('UserGrid state:', $userGrid);
			
			// 创建Board实例
			const board = new Board();
			console.log('Board created:', board);
			
			// 填充当前棋盘状态
			for (let row = 0; row < 9; row++) {
				for (let col = 0; col < 9; col++) {
					const cellValue = $userGrid[row][col];
					if (cellValue !== 0) {
						board.cells[row][col].value = cellValue;
						// 检查是否是原始数字（从grid store获取）
						const gridStore = get(grid);
						board.cells[row][col].isOriginal = gridStore[row][col] !== 0;
					}
				}
			}
			
			console.log('Board state after filling:', board.cells);
			
			// 创建策略引擎实例
			const strategyEngine = new StrategyEngine();
			console.log('StrategyEngine created:', strategyEngine);
			
			// 调用策略引擎
			const hint = strategyEngine.getNextHint(board);
			console.log('StrategyEngine result:', hint);
			
			if (hint) {
				lastHint = hint;
				dispatch('updateHintDetail', hint);
			} else {
				console.log('No hint found');
				alert('当前没有可用的提示策略');
			}
		} catch (error) {
			console.error('获取提示时出错:', error);
			console.error('Error stack:', error.stack);
			alert(`获取提示时出现错误：${error.message}`);
		} finally {
			isCalculatingHint = false;
		}
	}

	// 计算指定位置的候选数，不修改棋盘状态
	function calculateCandidates(board, row, col) {
		const candidates = [];
		
		// 如果格子已经有值，返回空数组
		if (board.cells[row][col].value !== 0) {
			return candidates;
		}
		
		// 检查每个数字1-9是否可以在该位置
		for (let n = 1; n <= 9; n++) {
			if (isValidPlacement(board, row, col, n)) {
				candidates.push(n);
			}
		}
		
		return candidates;
	}

	// 检查在指定位置放置数字是否合法
	function isValidPlacement(board, row, col, value) {
		// 检查行
		for (let c = 0; c < 9; c++) {
			if (c !== col && board.cells[row][c].value === value) {
				return false;
			}
		}
		
		// 检查列
		for (let r = 0; r < 9; r++) {
			if (r !== row && board.cells[r][col].value === value) {
				return false;
			}
		}
		
		// 检查宫
		const boxRow = Math.floor(row / 3) * 3;
		const boxCol = Math.floor(col / 3) * 3;
		for (let r = boxRow; r < boxRow + 3; r++) {
			for (let c = boxCol; c < boxCol + 3; c++) {
				if ((r !== row || c !== col) && board.cells[r][c].value === value) {
					return false;
				}
			}
		}
		
		return true;
	}

	function getWikiUrl(strategyType) {
		const wikiUrls = {
			'Naked Single': 'https://www.sudokuwiki.org/Naked_Singles',
			'Hidden Single': 'https://www.sudokuwiki.org/Hidden_Singles',
			'Pointing Pairs': 'https://www.sudokuwiki.org/Pointing_Pairs',
			'Naked Pairs': 'https://www.sudokuwiki.org/Naked_Pairs',
			'Hidden Pairs': 'https://www.sudokuwiki.org/Hidden_Pairs',
			'Locked Candidates': 'https://www.sudokuwiki.org/Locked_Candidates'
		};
		return wikiUrls[strategyType] || 'https://www.sudokuwiki.org/Sudoku.htm';
	}



	// 显示候选数分析
	function showCandidateAnalysis(row, col) {
		// 创建Board实例进行分析
		const board = new Board();
		
		// 填充当前棋盘状态
		for (let r = 0; r < 9; r++) {
			for (let c = 0; c < 9; c++) {
				const cellValue = $userGrid[r][c];
				if (cellValue !== 0) {
					board.cells[r][c].value = cellValue;
					const gridStore = get(grid);
					board.cells[r][c].isOriginal = gridStore[r][c] !== 0;
				}
			}
		}
		
		// 计算指定位置的候选数
		const candidates = calculateCandidates(board, row, col);
		
		// 分析每个候选数
		let analysis = `位置 (${row + 1}, ${col + 1}) 的候选数分析：\n\n`;
		analysis += `当前候选数：${candidates.length > 0 ? candidates.join('、') : '无'}\n\n`;
		
		if (candidates.length === 0) {
			analysis += `该位置没有候选数，说明：\n`;
			analysis += `1. 该位置已有数字\n`;
			analysis += `2. 或者该位置无法填入任何数字（棋盘有冲突）\n`;
		} else if (candidates.length === 1) {
			analysis += `只有一个候选数 ${candidates[0]}，这是 Naked Single 策略\n`;
		} else {
			analysis += `有 ${candidates.length} 个候选数，需要进一步分析\n\n`;
			
			// 分析每个被排除的数字
			const excludedNumbers = [];
			for (let n = 1; n <= 9; n++) {
				if (!candidates.includes(n)) {
					excludedNumbers.push(n);
				}
			}
			
			if (excludedNumbers.length > 0) {
				analysis += `被排除的数字：${excludedNumbers.join('、')}\n`;
				analysis += `排除原因：\n`;
				
				for (const num of excludedNumbers) {
					const conflicts = findConflicts(board, row, col, num);
					analysis += `- 数字 ${num}：${conflicts}\n`;
				}
			}
		}
		
		// 显示分析结果
		alert(analysis);
	}
	
	// 找出冲突的具体位置（复用策略中的方法）
	function findConflicts(board, row, col, value) {
		const conflicts = [];
		
		// 检查行冲突
		for (let c = 0; c < 9; c++) {
			if (c !== col && board.cells[row][c].value === value) {
				conflicts.push(`第${row + 1}行第${c + 1}列已有${value}`);
			}
		}
		
		// 检查列冲突
		for (let r = 0; r < 9; r++) {
			if (r !== row && board.cells[r][col].value === value) {
				conflicts.push(`第${r + 1}行第${col + 1}列已有${value}`);
			}
		}
		
		// 检查宫冲突
		const boxRow = Math.floor(row / 3) * 3;
		const boxCol = Math.floor(col / 3) * 3;
		for (let r = boxRow; r < boxRow + 3; r++) {
			for (let c = boxCol; c < boxCol + 3; c++) {
				if ((r !== row || c !== col) && board.cells[r][c].value === value) {
					conflicts.push(`第${r + 1}行第${c + 1}列已有${value}`);
				}
			}
		}
		
		return conflicts.join('，');
	}

	function handleAddBranch() {
		if (branchPoints && $branchPoints.length >= 10) {
			branchError = '最多保存10个分支点，请先删除部分分支点';
			return;
		}
		const name = branchName.trim() || `分支点 - ${new Date().toLocaleTimeString()}`;
		const id = Date.now().toString();
		const timestamp = Date.now();
		const boardData = JSON.stringify(getCurrentBoardData()); // 保存完整快照
		const steps = $historyLength;
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
		if (bp && bp.boardData) {
			restoreBoardData(JSON.parse(bp.boardData));
		}
		confirmRestoreId = null;
		showBranchModal = false;
	}
	function cancelRestore() {
		confirmRestoreId = null;
	}
	function handleEditBranch(id, currentName) {
		editingBranchId = id;
		editingBranchName = currentName;
	}
	function saveBranchName() {
		if (editingBranchId && editingBranchName.trim()) {
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

	function handleNextHintBtn() {
		if (showHintDetail) {
			dispatch('toggleHintDetail');
		} else {
			getNextHint();
		}
	}
</script>

<div class="action-buttons space-x-3">
	<!-- 分支点按钮 -->
	<button class="btn btn-round" title="分支点" on:click={() => showBranchModal = true}>
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h6m0 0l-3-3m3 3l-3 3m6-6v12" />
		</svg>
	</button>

	<button class="btn btn-round" disabled={$gamePaused || $historyLength === 0} title="Undo" on:click={undoHistory}>
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
		</svg>
	</button>

	<button class="btn btn-round" disabled={$gamePaused || $redoLength === 0} title="Redo" on:click={redoHistory}>
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 90 00-8 8v2M21 10l-6 6m6-6l-6-6" />
		</svg>
	</button>

	<button class="btn btn-round btn-badge" 
		disabled={$keyboardDisabled || !hintsAvailable || $userGrid[$cursor.y][$cursor.x] !== 0} 
		on:click={handleHint} 
		title="Hints ({$hints})">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
		</svg>

		{#if $settings.hintsLimited}
			<span class="badge" class:badge-primary={hintsAvailable}>{$hints}</span>
		{/if}
	</button>

	<!-- 下一步提示按钮 -->
	<button
		class="btn btn-round btn-badge"
		disabled={isCalculatingHint}
		on:click={handleNextHintBtn}
		title={isCalculatingHint ? "正在计算..." : (showHintDetail ? "关闭提示" : "下一步提示")}
	>
		{#if isCalculatingHint}
			<svg class="icon-outline animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
			</svg>
		{:else if showHintDetail}
			<!-- 白底蓝边黑色“×”icon -->
			<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#111" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6l-12 12" />
			</svg>
		{:else}
			<!-- 白底蓝边黑色“？”icon -->
			<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#111" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M12 14a4 4 0 10-4-4" />
			</svg>
		{/if}
		<span class="badge">{isCalculatingHint ? "..." : (showHintDetail ? "×" : "?")}</span>
	</button>

	<button class="btn btn-round btn-badge" on:click={notes.toggle} title="Notes ({$notes ? 'ON' : 'OFF'})">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
		</svg>

		<span class="badge tracking-tighter" class:badge-primary={$notes}>{$notes ? 'ON' : 'OFF'}</span>
	</button>

</div>

{#if showBranchModal}
<div class="fixed inset-0 z-40">
	<div class="absolute inset-0 bg-black bg-opacity-30" on:click={() => showBranchModal = false}></div>
	<div class="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl p-6 z-50 flex flex-col">
		<h2 class="text-lg font-bold mb-2">分支点管理</h2>
		<div class="mb-2 flex">
			<input class="input input-bordered flex-1 mr-2" placeholder="分支点名称（可选）" bind:value={branchName} />
			<button class="btn btn-primary" on:click={handleAddBranch}>标记分支点</button>
		</div>
		{#if branchError}
			<div class="text-red-500 mb-2">{branchError}</div>
		{/if}
		<div class="text-xs text-gray-500 mb-2">最多保存10个分支点，按时间排序</div>
		<ul class="divide-y max-h-60 overflow-y-auto">
			{#each $branchPoints as bp}
				<li class="py-2">
					{#if editingBranchId === bp.id}
						<div class="flex items-center space-x-2">
							<input class="input input-bordered flex-1 text-sm" bind:value={editingBranchName} />
							<button class="btn btn-xs btn-success" on:click={saveBranchName}>保存</button>
							<button class="btn btn-xs" on:click={cancelEdit}>取消</button>
						</div>
					{:else}
						<div class="flex items-center justify-between">
							<div class="flex-1">
								<div class="font-semibold text-sm">{bp.name}</div>
								<div class="text-xs text-gray-500">
									{new Date(bp.timestamp).toLocaleString()} | 步数: {bp.steps}
								</div>
							</div>
							<div class="flex space-x-1">
								<button class="btn btn-xs btn-info" on:click={() => handleEditBranch(bp.id, bp.name)} title="重命名">✏️</button>
								<button class="btn btn-xs btn-success" on:click={() => handleRestoreBranch(bp.id)} title="回溯">↩️</button>
								<button class="btn btn-xs btn-error" on:click={() => handleDeleteBranch(bp.id, bp.name)} title="删除">🗑️</button>
							</div>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
		{#if $branchPoints.length === 0}
			<div class="text-center text-gray-500 py-4">暂无分支点</div>
		{/if}
		<button class="btn btn-block mt-4" on:click={() => showBranchModal = false}>关闭</button>
	</div>
</div>
{/if}
{#if confirmRestoreId}
	<div class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
		<div class="bg-white p-6 rounded shadow-xl max-w-xs">
			<div class="mb-4">确定回溯至该分支点？当前操作将被覆盖。</div>
			<button class="btn btn-primary w-full mb-2" on:click={confirmRestore}>确认</button>
			<button class="btn w-full" on:click={cancelRestore}>取消</button>
		</div>
	</div>
{/if}
{#if confirmDeleteId}
	<div class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
		<div class="bg-white p-6 rounded shadow-xl max-w-xs">
			<div class="mb-4">确定删除分支点“{confirmDeleteName}”？此操作不可逆。</div>
			<button class="btn btn-primary w-full mb-2" on:click={confirmDelete}>确认</button>
			<button class="btn w-full" on:click={cancelDelete}>取消</button>
		</div>
	</div>
{/if}


<style>
	.action-buttons {
		@apply flex flex-wrap justify-evenly self-end;
	}

	.btn-badge {
		@apply relative;
	}

	.badge {
		min-height: 20px;
		min-width:  20px;
		@apply p-1 rounded-full leading-none text-center text-xs text-white bg-gray-600 inline-block absolute top-0 left-0;
	}

	.badge-primary {
		@apply bg-primary;
	}
</style>
