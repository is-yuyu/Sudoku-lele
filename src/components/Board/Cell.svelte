<script>
	import Candidates from './Candidates.svelte';
	import { fade } from 'svelte/transition';
	import { SUDOKU_SIZE } from '@sudoku/constants';
	import { cursor } from '@sudoku/stores/cursor';

	export let value;
	export let cellX;
	export let cellY;
	export let candidates;

	export let disabled;
	export let conflictingNumber;
	export let userNumber;
	export let selected;
	export let sameArea;
	export let sameNumber;
	export let wrongNumber = false; // 新增：用户填入的数字是否错误
	export let highlightPair = false;
	export let highlightEliminate = false;
	export let eliminateNums = [];
	export let highlightMain = false;
	export let highlightTrail = false;

	const borderRight = (cellX !== SUDOKU_SIZE && cellX % 3 !== 0);
	const borderRightBold = (cellX !== SUDOKU_SIZE && cellX % 3 === 0);
	const borderBottom = (cellY !== SUDOKU_SIZE && cellY % 3 !== 0);
	const borderBottomBold = (cellY !== SUDOKU_SIZE && cellY % 3 === 0);
</script>

<div class="cell row-start-{cellY} col-start-{cellX}"
     class:border-r={borderRight}
     class:border-r-4={borderRightBold}
     class:border-b={borderBottom}
     class:border-b-4={borderBottomBold}
     class:highlight-main={highlightMain}
     class:highlight-trail={highlightTrail}
     class:highlight-pair={highlightPair}
     class:highlight-eliminate={highlightEliminate}>

	{#if !disabled}
		<div class="cell-inner"
		     class:user-number={userNumber}
		     class:selected={selected}
		     class:same-area={sameArea}
		     class:same-number={sameNumber}
		     class:conflicting-number={conflictingNumber}
		     class:wrong-number={wrongNumber}>

			<button class="cell-btn" on:click={() => { cursor.set(cellX - 1, cellY - 1); dispatch('click'); }}>
				{#if candidates}
					<Candidates {candidates} eliminateNums={eliminateNums} />
				{:else}
					<span class="cell-text">{value || ''}</span>
				{/if}
			</button>

		</div>
	{/if}

</div>

<style>
	.cell {
		@apply h-full w-full row-end-auto col-end-auto;
	}

	.cell-inner {
		@apply relative h-full w-full text-gray-800;
	}

	.cell-btn {
		@apply absolute inset-0 h-full w-full;
	}

	.cell-btn:focus {
		@apply outline-none;
	}

	.cell-text {
		@apply leading-full text-base;
	}

	@media (min-width: 300px) {
		.cell-text {
			@apply text-lg;
		}
	}

	@media (min-width: 350px) {
		.cell-text {
			@apply text-xl;
		}
	}

	@media (min-width: 400px) {
		.cell-text {
			@apply text-2xl;
		}
	}

	@media (min-width: 500px) {
		.cell-text {
			@apply text-3xl;
		}
	}

	@media (min-width: 600px) {
		.cell-text {
			@apply text-4xl;
		}
	}

	.user-number {
		@apply text-primary;
	}

	.selected {
		@apply bg-primary text-white;
	}

	.same-area {
		@apply bg-primary-lighter;
	}

	.same-number {
		@apply bg-primary-light;
	}

	.conflicting-number {
		@apply text-red-600;
	}

	.wrong-number {
		color: #dc2626;
		background-color: #fef2f2;
	}

	.highlight-pair {
		@apply border-4 border-blue-400;
	}
	.highlight-eliminate {
		@apply border-4 border-yellow-400;
	}
	.highlight-main {
		border: 3px solid #22c55e;
		z-index: 30;
		position: relative;
		background: none !important;
	}
	.highlight-trail {
		background: #bae6fd !important;
		z-index: 20;
		position: relative;
	}
</style>