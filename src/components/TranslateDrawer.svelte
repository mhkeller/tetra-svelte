<script>
import { wordToTranslate } from '../modules/stores.js';

let wtt;
let translations;

const sourceLang = 'fr';
const targetLang = 'en';

const key = window.localStorage.getItem('translate_key');

wordToTranslate.subscribe(val => {
	wtt = val;
	doTranslation(val);
});

async function doTranslation (val) {
	const response = await window.fetch(`https://translation.googleapis.com/language/translate/v2?q=${val}&source=${sourceLang}&target=${targetLang}&key=${key}`, {
		method: 'POST'
	});
	const res = await response.json();
	console.log(res);
	translations = res.data.translations;
};

function destroy () {
	wtt = null;
}
</script>

<style>
	.translate-drawer {
		background-color: #e8e5de;
		color: #000;
		padding: 20px;
		border-top-left-radius: 5px;
		border-top-right-radius: 5px;
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		top: 70%;
		z-index: 9;
		box-shadow: 0 0 12px #000;
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
		height: 8%;
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

{#if wtt}
	<div
		class="translate-drawer"
	>
		<input type="search" value="{wtt}"/>
		<div
			class="translated-text"
		>
			{#if translations}
				{#each translations as translation}
					<div class="translated-word">{translation.translatedText}</div>
				{/each}
			{/if}
		</div>
		<div class="close-btn" on:click="{destroy}"></div>
	</div>
{/if}
