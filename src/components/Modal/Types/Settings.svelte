<script>
	import { slide } from 'svelte/transition';
	import Switch from '../../Utils/Switch.svelte';
	import { settings as settingsStore } from '@sudoku/stores/settings';
	import { MAX_HINTS } from '@sudoku/constants';

	export let data = {};
	export let hideModal;

	let settings = { ...$settingsStore };

	let hintsLimited = settings.hintsLimited;

	function handleSave() {
		settings.hintsLimited = hintsLimited;

		if (settings.hints < 0) settings.hints = 0;
		if (settings.hints > MAX_HINTS) settings.hints = MAX_HINTS;

		settingsStore.set(settings);
		hideModal();
	}
</script>

<h1 class="text-3xl font-semibold mb-6 leading-none">设置</h1>

<!--

- 游戏时显示计时器
- 高亮同一行/列/宫的格子
- 高亮相同数字的格子
- 高亮冲突数字
- 输入错误时显示错误提示

-->

<div class="flex flex-col mb-6 space-y-3">
	<!--<Switch bind:checked={settings.darkTheme} text="启用深色模式" id="dark-theme" />-->
	<Switch bind:checked={settings.displayTimer} text="游戏时显示计时器" id="display-timer" />

	<Switch bind:checked={hintsLimited} text="限制可用提示次数" id="hints-limited" />
	{#if hintsLimited}
		<div transition:slide class="inline-flex items-center">
			<label for="hints" class="flex-grow text-lg">可用提示次数</label>

			<input bind:value={settings.hints} class="number-input" id="hints" name="hints" type="number" min="0" max="81" />
		</div>
	{/if}

	<Switch bind:checked={settings.highlightCells} text="高亮同一行/列/宫的格子" id="highlight-cells" />
	<Switch bind:checked={settings.highlightSame} text="高亮相同数字的格子" id="highlight-matching" />
	<Switch bind:checked={settings.highlightConflicting} text="高亮冲突数字" id="highlight-conflicting" />
	<Switch bind:checked={settings.showErrors} text="输入错误时显示错误提示" id="show-errors" />

	<Switch bind:checked={settings.onlyAllowCandidates} text="仅允许填入候选数（禁用已存在数字）" id="only-allow-candidates" />
</div>

<div class="flex justify-end">
	<button class="btn btn-small mr-3" on:click={hideModal}>取消</button>
	<button class="btn btn-small btn-primary" on:click={handleSave}>保存</button>
</div>

<style>
	.number-input {
		@apply w-12 h-8 px-1 border-2 rounded-lg shadow-inner text-xl text-center leading-none;
	}

	.number-input:focus {
		@apply ring-2 ring-blue-400 outline-none;
	}
</style>