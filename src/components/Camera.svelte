<script>
// import scaleCanvas from '../modules/scaleCanvas.js';
import Box from './Box.svelte';
import { onMount } from 'svelte';

let image;
let width;
let height;
let imageData;
let boxes;

const lang = 'fra';

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
	setTimeout(() => {
		width = image.width;
		height = image.height;
		doOcr();
	}, 1000);
};

function doOcr () {
	(async () => {
		console.log('recognizing');
		const { data } = await worker.recognize(image);
		console.log(data.text);
		boxes = data.words;
		console.log('boxes', boxes);
		// await worker.terminate();
	})();
}

let files = [];

// function updateWidth () {
// 	setTimeout(() => {
// 		console.log(image, image.width, image.height);
// 		width = image.width;
// 		height = image.height;
// 	}, 1000)
// }

$: file = files[0];
$: if (file) fileReader.readAsDataURL(file);
</script>

<style>
	.open-camera {
		position: fixed;
		width: 100%;
		height: 10%;
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
		left: 50%;
		font-weight: bold;
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
		max-height: 100%;
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
	}
</style>

<div
	class="image-container"
	style="width:{width}px; height:{height}px"
>
	<img
		src="{imageData}"
		alt="uploaded image"
		bind:this="{image}"
	/>
	<div
		class="image-overlay"
		style="width:{width}px; height:{height}px"
	>
		{#if boxes}
			{#each boxes as box}
				<Box {box}/>
			{/each}
		{/if}
	</div>
</div>

<div class="open-camera">
	<input
		type="file"
		capture="camera"
		accept="image/*"
		name="cameraInput"
		bind:files
	>
</div>
