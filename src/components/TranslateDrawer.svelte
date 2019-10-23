<script>
import { wordToTranslate } from '../modules/stores.js';

let wtt;
let translations;

const sourceLang = 'fr';
const targetLang = 'en';

const key = window.localStorage.getItem('googleKey');

wordToTranslate.subscribe(val => {
	wtt = val;
	doTranslation(val);
});

async function doTranslation (val) {
	const response = await window.fetch(`https://translation.googleapis.com/language/translate/v2?q=${val}&source=${sourceLang}&target=${targetLang}&key=${key}`, {
		method: 'POST'
	});
	const res = await response.json();
	translations = res.data.translations;
};
</script>

<style>
	.translate-drawer {
		background-color: #fff;
		color: #000;
		padding: 8px;
		border-top-left-radius: 5px;
		border-top-right-radius: 5px;
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		top: 70%;
	}
</style>

{#if wtt}
	<div
		class="translate-drawer"
	>
		<input type="text" value="{wtt}"/>
		<div
			class="translated-text"
		>
			{#if translations}
				{#each translations as translation}
					<p>{translation.translatedText}</p>
				{/each}
			{/if}

		</div>
	</div>
{/if}
