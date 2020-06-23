<script>
	import Camera from './components/Camera.svelte';
	import Settings from './components/Settings.svelte';
	import SettingsButton from './components/SettingsButton.svelte';

	let inputLanguage = 'fr';
	let outputLanguage = 'en';

	let ocrKey = window.localStorage.getItem('ocr_key');
	let translateKey = window.localStorage.getItem('translate_key');

	let showSettings = false;
</script>

<style>
	:global(body) {
		background-color: #000;
	}
</style>

{#if showSettings}
	<Settings
		bind:inputLanguage
		bind:outputLanguage
		bind:ocrKey
		bind:translateKey
		bind:showSettings
	/>
{:else}
	<SettingsButton
		bind:showSettings
	/>
	<Camera
		bind:showSettings
		inputLanguage
		outputLanguage
		ocrKey
		translateKey
	/>
{/if}

