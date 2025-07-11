<script>
	import ActionBar from './ActionBar/index.svelte';
	import Keyboard from './Keyboard.svelte';
	import Board from '../Board/index.svelte';
	import Timer from './ActionBar/Timer.svelte';
	import Actions from './ActionBar/Actions.svelte';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let hintDetail = null;
	let highlightHint = false;
	let showHintDetail = false;

	function handleHintDetail(e) {
		hintDetail = e.detail;
		showHintDetail = true;
		highlightHint = false; // 新提示时默认不高亮
	}

	function handleToggleHintDetail() {
		showHintDetail = !showHintDetail;
		if (!showHintDetail) {
			hintDetail = null;
		}
	}

	function handleCellClick() {
		highlightHint = false;
	}

	function handleLocate() {
		highlightHint = true;
	}
</script>

<div class="px-4 pb-5 flex justify-center">
	<div class="w-full max-w-xl">
		<Board {hintDetail} {highlightHint} on:cellClick={handleCellClick} />
		<ActionBar {hintDetail} {highlightHint} {showHintDetail} on:locate={handleLocate}>
			<Timer />
			<Actions on:updateHintDetail={handleHintDetail} {showHintDetail} on:toggleHintDetail={handleToggleHintDetail} on:openBranchManager={() => dispatch('openBranchManager')} />
		</ActionBar>
		<Keyboard />
	</div>
</div>