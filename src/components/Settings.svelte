<script>
	export let inputLanguage = 'fr';
	export let outputLanguage = 'en';

	export let ocrKey;
	export let translateKey;
	export let showSettings;
</script>

<style>
	.input-container {
		padding: 14px;
	}
	input {
		width: 100%;
	}
</style>

<div class="input-container">
	<input
		placeholder="Input language..."
		bind:value={inputLanguage}
	/>
	<input
		placeholder="Output language..."
		bind:value={outputLanguage}
	/>
	<input
		placeholder="Enter OCR key..."
		bind:value={ocrKey}
	/>
	<input
		placeholder="Enter translation key..."
		bind:value={translateKey}
	/>
	<button
		on:click={() => showSettings = false}
	>Close</button>
</div>
