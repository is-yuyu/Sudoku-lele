<script>
	export let id = '';
	export let text = '';
	export let checked = false;
	export let disabled = false;
</script>

<label for="{id}" class="inline-flex items-center">
	<span class="flex-grow cursor-pointer text-lg">{text}</span>

	<span class="switch">
		<input {id} name="{id}" type="checkbox" class="sr-only" {disabled} bind:checked />
		<span class="track"></span>
		<span class="thumb"></span>
	</span>
</label>

<style>
	.switch {
		@apply inline-block relative align-middle cursor-pointer select-none bg-transparent;
	}

	.track {
		@apply block w-12 h-6 bg-gray-600 rounded-full shadow-inner;
	}

	.thumb {
		@apply block transition-all duration-300 ease-in-out absolute top-0 left-0 w-6 h-6 bg-white border-2 border-gray-600 rounded-full;
	}

	input[type='checkbox']:checked ~ .thumb {
		@apply transform translate-x-full border-primary;
	}

	input[type='checkbox']:checked ~ .track {
		@apply transform transition-colors bg-primary;
	}

	input[type='checkbox']:disabled ~ .track {
		@apply bg-gray-500;
	}

	input[type='checkbox']:disabled ~ .thumb {
		@apply bg-gray-100 border-gray-500;
	}

	input[type='checkbox']:focus + .track,
	input[type='checkbox']:active + .track {
		@apply outline-none focus:ring-2 focus:ring-blue-500;
	}
</style>