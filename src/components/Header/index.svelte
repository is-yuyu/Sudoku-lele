<script>
	import Buttons from './Buttons.svelte';
	import Dropdown from './Dropdown.svelte';
</script>

<div class="px-4 py-4 flex justify-center text-white">
	<div class="w-full max-w-xl">

		<nav class="flex flex-row items-center justify-between w-full gap-4">
			<Dropdown />
			<slot name="import" />
			<Buttons />
		</nav>

	</div>
</div>