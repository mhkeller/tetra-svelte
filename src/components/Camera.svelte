<script>
// import scaleCanvas from '../modules/scaleCanvas.js';
import Box from './Box.svelte';
import TranslateDrawer from './TranslateDrawer.svelte';
import { onMount } from 'svelte';
import { wordToTranslate } from '../modules/stores.js';

let image;
let width;
let height;
let imageData;
let boxes;
let wtt;

const lang = 'fra';

wordToTranslate.subscribe(val => {
	wtt = val;
});

const worker = window.Tesseract.createWorker({
	logger: m => console.log(m)
});

async function init () {
	await worker.load();
	await worker.setParameters({
		tessjs_create_box: 1
	});
	await worker.loadLanguage(lang);
	await worker.initialize(lang);
	console.log('done initializing');
}

init();

const fileReader = new window.FileReader();
fileReader.onload = function () {
	imageData = fileReader.result;
};

function doOcr () {
	(async () => {
		/* --------------------------------------------
		 * Create a ghost canvas
		 */
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = width;
		canvas.height = height;
		ctx.drawImage(image, 0, 0, width, height);

		const { data } = await worker.recognize(canvas);
		console.log(data.text);
		boxes = data.words;
		// await worker.terminate();
	})();
}

function setDimensions() {
	({ width, height } = this);
	doOcr();
}

let files = [];

$: file = files[0];
$: if (file) fileReader.readAsDataURL(file);
</script>

<style>
	.open-camera {
		position: fixed;
		width: 100%;
		height: 8%;
		bottom: 0;
		background-color: #6699cc;
		border-top-left-radius: 5px;
		border-top-right-radius: 5px;
	}
	.open-camera:after {
		content: 'Take picture';
		position: absolute;
		color: #fff;
		top: 50%;
		font-size: 20px;
		font-family: Helvetica, sans-serif;
		left: 50%;
		pointer-events: none;
		transform: translate(-50%, -50%);
	}
	.open-camera:hover {
		background-color: #538cc6;
	}
	input {
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
	}

	img {
		max-width: 100%;
		max-height: 90vh;
	}

	.image-container {
		position: relative;
		left: 50%;
		transform: translate(-50%, 0);
	}

	.image-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>

<div
	class="image-container"
	style="width:{width}px; height:{height}px"
>
	{#if imageData}
		<img
			src="{imageData}"
			alt="uploaded image"
			bind:this={image}
			on:load={setDimensions}
		/>
	{/if}
	<div
		class="image-overlay"
	>
		{#if boxes}
			{#each boxes as box}
				<Box
					{box}
				/>
			{/each}
		{/if}
	</div>
</div>

{#if wtt}
	<TranslateDrawer/>
{/if}
<div class="open-camera">
	<input
		type="file"
		capture="camera"
		accept="image/*"
		name="cameraInput"
		bind:files
	>
</div>
