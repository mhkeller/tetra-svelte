<script>
	import scaleCanvas from '../modules/scaleCanvas.js';
	import Box from './Box.svelte';
	import TranslateDrawer from './TranslateDrawer.svelte';
	import { onMount } from 'svelte';
	import { wordToTranslate } from '../modules/stores.js';

	export let inputLanguage;
	export let outputLanguage;
	export let ocrKey;
	export let translateKey;

	let width;
	let height;
	let boxes;
	let wtt = null;
	let imageContainer;
	let canvasContainer;

	wordToTranslate.subscribe(val => {
		wtt = val;
	});

	function imageLoaded (canvas) {
		// This doesn't seem to clear the contents
		canvasContainer.innerHTML = '';
		boxes = null;
		canvasContainer.appendChild(canvas);
		// This doesn't asign values to `width` or `height`
		width = canvas.style.width.replace('px', '');
		height = canvas.style.height.replace('px', '');

		const base64 = canvas.toDataURL().split(',')[1];
		doOcr(base64);
	}

	function doOcr (base64) {
		(async () => {
			const response = await window.fetch(`https://vision.googleapis.com/v1/images:annotate?key=${ocrKey}`, {
				method: 'POST',
				body: JSON.stringify({
					requests: [
						{
							image: {
								content: base64
							},
							features: [
								{
									type: 'TEXT_DETECTION'
								}
							],
							imageContext: {
								languageHints: [inputLanguage]
							}
						}
					]
				})
			});
			const res = await response.json();

			// const { data } = await worker.recognize(canvas);
			console.log(res);
			boxes = res.responses[0].textAnnotations;
			// await worker.terminate();
		})();
	}

	let files = [];
	const options = {
		maxWidth: window.innerWidth,
		maxHeight: window.innerHeight * 0.92,
		// pixelRatio: window.devicePixelRatio,
		canvas: true,
		// orientation: true,
		cover: true
	};

	$: file = files[0];
	$: if (file) window.loadImage(file, imageLoaded, options);
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
		content: 'Take picture!';
		position: absolute;
		color: #000;
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
		visibility: hidden;
	}

	.image-container {
		position: relative;
		left: 50%;
		transform: translate(-50%, 0);
		overflow-y: scroll;
		overflow-x: hidden;
	}

	canvas{
		position: absolute;
		top: 0;
		left: 0;
	}
	.image-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
	.wtt {
		height: 70% !important;
	}
</style>

<div
	class="image-container"
	style="width:{width}px; height:{height}px;"
	bind:this={imageContainer}
	class:wtt={wtt !== null}
>
	<div bind:this={canvasContainer}></div>
	<div
		class="image-overlay"
	>
		{#if boxes}
			{#each boxes as box}
				{#if !box.locale}
					<Box {box} />
				{/if}
			{/each}
		{/if}
	</div>
</div>

{#if wtt !== null}
	<TranslateDrawer
		{inputLanguage}
		{outputLanguage}
		{translateKey}
	/>
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
