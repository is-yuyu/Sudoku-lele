<script>
	import ActionBar from './ActionBar/index.svelte';
	import Keyboard from './Keyboard.svelte';
	import Board from '../Board/index.svelte';
	import Timer from './ActionBar/Timer.svelte';
	import Actions from './ActionBar/Actions.svelte';

	let hintDetail = null;
	let highlightHint = false;

	function handleHintDetail(e) {
		hintDetail = e.detail;
		highlightHint = false; // 新提示时默认不高亮
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
		<ActionBar {hintDetail} {highlightHint} on:locate={handleLocate}>
			<Timer />
			<Actions on:updateHintDetail={handleHintDetail} />
		</ActionBar>
		<Keyboard />
	</div>
</div>