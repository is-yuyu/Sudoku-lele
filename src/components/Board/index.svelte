<script>
	import { BOX_SIZE } from '@sudoku/constants';
	import { gamePaused } from '@sudoku/stores/game';
	import { grid, userGrid, invalidCells } from '@sudoku/stores/grid';
	import { settings } from '@sudoku/stores/settings';
	import { cursor } from '@sudoku/stores/cursor';
	import { candidates } from '@sudoku/stores/candidates';
	import { solution } from '../../stores/solution.js';
	import Cell from './Cell.svelte';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	// 接收hintDetail参数
	export let hintDetail = null;
	export let highlightHint = false;

	function isSelected(cursorStore, x, y) {
		return cursorStore.x === x && cursorStore.y === y;
	}

	function isSameArea(cursorStore, x, y) {
		if (cursorStore.x === null && cursorStore.y === null) return false;
		if (cursorStore.x === x || cursorStore.y === y) return true;

		const cursorBoxX = Math.floor(cursorStore.x / BOX_SIZE);
		const cursorBoxY = Math.floor(cursorStore.y / BOX_SIZE);
		const cellBoxX = Math.floor(x / BOX_SIZE);
		const cellBoxY = Math.floor(y / BOX_SIZE);
		return (cursorBoxX === cellBoxX && cursorBoxY === cellBoxY);
	}

	function getValueAtCursor(gridStore, cursorStore) {
		if (cursorStore.x === null && cursorStore.y === null) return null;

		return gridStore[cursorStore.y][cursorStore.x];
	}

	// 检查用户填入的数字是否错误
	let errorCache = new Map();
	
	function isWrongNumber(userValue, x, y) {
		if (!$settings.showErrors || userValue === 0) return false;
		
		// 检查是否是用户填入的数字（不是原始数字）
		const isUserNumber = $grid[y][x] === 0;
		if (!isUserNumber) return false;
		
		// 使用缓存避免重复计算
		const cacheKey = `${x},${y},${userValue}`;
		if (errorCache.has(cacheKey)) {
			return errorCache.get(cacheKey);
		}
		
		// 检查是否与正确答案不符
		const correctValue = $solution[y] && $solution[y][x] ? $solution[y][x] : 0;
		const isWrong = userValue !== correctValue;
		
		// 缓存结果
		errorCache.set(cacheKey, isWrong);
		
		// 限制缓存大小
		if (errorCache.size > 100) {
			const firstKey = errorCache.keys().next().value;
			errorCache.delete(firstKey);
		}
		
		return isWrong;
	}
	
	// 当solution变化时清空缓存
	$: if ($solution) {
		errorCache.clear();
	}
</script>

<div class="board-padding relative z-10" on:click={() => dispatch('cellClick')}>
	<div class="max-w-xl relative">
		<div class="w-full" style="padding-top: 100%"></div>
	</div>
	<div class="board-padding absolute inset-0 flex justify-center">

		<div class="bg-white shadow-2xl rounded-xl overflow-hidden w-full h-full max-w-xl grid" class:bg-gray-200={$gamePaused}>

			{#each $userGrid as row, y}
				{#each row as value, x}
					<Cell {value}
					      cellY={y + 1}
					      cellX={x + 1}
					      candidates={$candidates[x + ',' + y]}
					      disabled={$gamePaused}
					      selected={isSelected($cursor, x, y)}
					      userNumber={$grid[y][x] === 0}
					      sameArea={$settings.highlightCells && !isSelected($cursor, x, y) && isSameArea($cursor, x, y)}
					      sameNumber={$settings.highlightSame && value && !isSelected($cursor, x, y) && getValueAtCursor($userGrid, $cursor) === value}
					      conflictingNumber={$settings.highlightConflicting && $grid[y][x] === 0 && $invalidCells.includes(x + ',' + y)}
					      wrongNumber={isWrongNumber(value, x, y)}
					      highlightMain={highlightHint && hintDetail && hintDetail.cell && hintDetail.cell.row === y && hintDetail.cell.col === x}
					      highlightTrail={highlightHint && hintDetail && hintDetail.trail && hintDetail.trail.some(c => c.row === y && c.col === x)}
					      highlightPair={hintDetail && hintDetail.cells && hintDetail.cells.some(c => c.row === y && c.col === x)}
					      highlightEliminate={hintDetail && hintDetail.eliminate && hintDetail.eliminate.find(e => e.row === y && e.col === x)}
					      eliminateNums={hintDetail && hintDetail.eliminate && hintDetail.eliminate.find(e => e.row === y && e.col === x) ? hintDetail.eliminate.find(e => e.row === y && e.col === x).remove : []}
					      on:click={() => dispatch('cellClick')}
					/>
				{/each}
			{/each}

		</div>

	</div>
</div>

<style>
	.board-padding {
		@apply px-4 pb-4;
	}
	
	/* 移动端优化：棋盘最大宽度100vw，最小宽度320px，始终居中 */
	@media (max-width: 600px) {
		.max-w-xl {
			max-width: 100vw !important;
			min-width: 320px;
		}
		.board-padding {
			padding-left: 2vw;
			padding-right: 2vw;
			padding-bottom: 2vw;
		}
	}
</style>