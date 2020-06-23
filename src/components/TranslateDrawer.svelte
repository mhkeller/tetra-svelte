<script>
	import { wordToTranslate } from '../modules/stores.js';
	import { onMount } from 'svelte';

	let wtt;
	let translations;
	let input;

	export let translateKey;
	export let inputLanguage;
	export let outputLanguage;

	onMount(() => {
		wordToTranslate.subscribe(val => {
			if (document.activeElement !== input) {
				if (input) {
					input.value = sanitize(val) || '';
				}
			}
			wtt = val;
			doTranslation(val);
		});
	});

	async function doTranslation (val) {
		const response = await window.fetch(`https://translation.googleapis.com/language/translate/v2?q=${val}&source=${inputLanguage}&target=${outputLanguage}&key=${translateKey}`, {
			method: 'POST'
		});
		const res = await response.json();
		translations = res.data.translations;
	}

	function destroy () {
		input.value = null;
		wordToTranslate.set(null);
	}

	function sanitize (val) {
		return typeof val === 'string' ? val.replace(/(\.|!|\?|,)/g, '') : val;
	}
</script>

<style>
	.translate-drawer {
		background-color: #e8e5de;
		color: #000;
		padding: 20px;
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		top: 70%;
		z-index: 9;
	}
	input {
		background-color: #f2f0ec;
		border-radius: 5px;
		width: 100%;
	}
	.translated-text {
		display: flex;
		flex-direction: row;
	}
	.close-btn {
		background-color: #99cc99;
		position: absolute;
		bottom: 0;
		height: 2%;
		left: 0;
		right: 0;
		text-align: center;
		padding: 20px 0;
		cursor: pointer;
		border-top: 1px solid #000;
	}
	.close-btn:after {
		content: 'Close';
		position: absolute;
		color: #000;
		top: 50%;
		font-size: 20px;
		font-family: Helvetica, sans-serif;
		left: 50%;
		pointer-events: none;
		transform: translate(-50%, -50%);
	}

	.close-btn:hover {
		background-color: #85c185;
	}
	.close-btn:active {
		background-color: #7bbc7b;
	}
</style>

{#if wtt !== null}
	<div
		class="translate-drawer"
	>
		<input bind:this={input} type="search" on:input={(e) => wordToTranslate.set(e.target.value)}/>
		<div
			class="translated-text"
		>
			{#if translations}
				{#each translations as translation}
					<div class="translated-word">{sanitize(translation.translatedText)}</div>
				{/each}
			{/if}
		</div>
		<div class="close-btn" on:click="{destroy}"></div>
	</div>
{/if}
