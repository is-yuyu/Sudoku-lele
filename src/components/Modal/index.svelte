<script>
	import { fade, scale } from 'svelte/transition';
	import { modal, modalData } from '@sudoku/stores/modal';
	import { MODAL_NONE, MODAL_DURATION } from '@sudoku/constants';
	import types from './Types';

	const MODALS_DISABLED_OVERLAY = ['welcome', 'gameover'];

	function handleOverlayClick() {
		if (!MODALS_DISABLED_OVERLAY.includes($modal)) {
			modal.hide();
		}
	}

	function handleContentScroll(event) {
		// 阻止事件冒泡到背景
		event.stopPropagation();
	}
</script>

{#if $modal !== MODAL_NONE}
	<div class="modal">
		<button transition:fade={{duration: MODAL_DURATION}} class="modal-overlay" on:click={handleOverlayClick} tabindex="-1"></button>

		<div transition:scale={{duration: MODAL_DURATION}} class="modal-container">
			<div class="modal-content" on:scroll={handleContentScroll}>
				<svelte:component this={types[$modal]} data={$modalData} hideModal={modal.hide} />
			</div>
		</div>
	</div>
{/if}

<style>
	.modal {
		@apply fixed w-full h-full top-0 left-0 flex items-center justify-center;
		z-index: 9999;
	}

	.modal-overlay {
		@apply fixed inset-0 h-full w-full bg-black bg-opacity-50 outline-none cursor-default;
		z-index: 9999;
	}

	.modal-container {
		@apply bg-gray-custom w-11/12 mx-auto rounded-xl shadow-lg;
		z-index: 10000;
		max-height: 90vh;
		position: relative;
		display: flex;
		flex-direction: column;
	}

	.modal-content {
		@apply flex flex-col p-6 text-left;
		overflow-y: auto;
		max-height: 100%;
		position: relative;
		flex: 1;
	}

	@screen md {
		.modal-container {
			@apply max-w-md;
		}
	}
</style>