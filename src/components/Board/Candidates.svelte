<script>
	import { CANDIDATE_COORDS } from '@sudoku/constants';

	export let candidates = [];
	export let eliminateNums = [];
</script>

<div class="candidate-grid">
	{#each CANDIDATE_COORDS as [row, col], index}
		<div class="candidate row-start-{row} col-start-{col}"
		     class:invisible={!candidates.includes(index + 1)}
		     class:visible={candidates.includes(index + 1)}
		     class:eliminate={eliminateNums && eliminateNums.includes(index + 1)}>
			{index + 1}
		</div>
	{/each}
</div>

<style>
	.candidate-grid {
		@apply grid h-full w-full p-1;
	}

	.candidate {
		@apply h-full w-full row-end-auto col-end-auto leading-full;
	}

	.eliminate {
		@apply text-yellow-600 bg-yellow-100 font-bold;
	}
</style>