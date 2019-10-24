<script>
import scaleCanvas from '../modules/scaleCanvas.js';
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
let canvas;

const lang = 'fr';
let srcOrientation;

const ocrKey = window.localStorage.getItem('ocr_key');

wordToTranslate.subscribe(val => {
	wtt = val;
});

const fileReader = new window.FileReader();
const fileReaderBase64 = new window.FileReader();
fileReaderBase64.onload = function () {
	imageData = fileReaderBase64.result;
	console.log('loaded');
};

fileReader.onload = function (e) {
	var view = new DataView(e.target.result);

	if (view.getUint16(0, false) !== 0xFFD8) {
		srcOrientation = -2;
		return;
	}

	var length = view.byteLength;
	var offset = 2;

	while (offset < length) {
		var marker = view.getUint16(offset, false);
		offset += 2;

		if (marker === 0xFFE1) {
			if (view.getUint32(offset += 2, false) !== 0x45786966) {
				srcOrientation = -1;
				return;
			}
			var little = view.getUint16(offset += 6, false) === 0x4949;
			offset += view.getUint32(offset + 4, little);
			var tags = view.getUint16(offset, little);
			offset += 2;

			for (var i = 0; i < tags; i++) {
				if (view.getUint16(offset + (i * 12), little) === 0x0112) {
					srcOrientation = view.getUint16(offset + (i * 12) + 8, little);
					return;
				}
			}
		} else if ((marker & 0xFF00) !== 0xFF00) {
			break;
		} else {
			offset += view.getUint16(offset, false);
		}
	}
	srcOrientation = -1;
};

function doOcr () {
	(async () => {
		/* --------------------------------------------
		 * Create a ghost canvas
		 */
		console.log('srcoriientation', srcOrientation);
		const base64 = resetOrientation(imageData, width, height, srcOrientation).split(',')[1];
		// const canvas = document.createElement('canvas');
		// const ctx = canvas.getContext('2d');
		// canvas.width = width;
		// canvas.height = height;
		// ctx.drawImage(image, 0, 0, width, height);
		// const base64 = canvas.toDataURL().split(',')[1];

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
							languageHints: [lang]
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

function setDimensions () {
	console.log('setting dimensions');
	({ width, height } = this);
	doOcr();
}

function resetOrientation (srcBase64, width, height, srcOrientation) {
	// var canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	// set proper canvas dimensions before transform & export
	// scaleCanvas(canvas, ctx, width, height);
	if (srcOrientation > 4 && srcOrientation < 9) {
		canvas.width = height;
		canvas.height = width;
	} else {
		canvas.width = width;
		canvas.height = height;
	}

	// transform context before drawing image
	switch (srcOrientation) {
		case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
		case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
		case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
		case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
		case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
		case 7: ctx.transform(0, -1, -1, 0, height, width); break;
		case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
		default: break;
	}

	// draw image
	ctx.drawImage(image, 0, 0, width, height);

	// export base64
	// console.log(canvas.toDataURL());
	return canvas.toDataURL();
}

let files = [];

$: file = files[0];
// $: if (file) imageData = URL.createObjectURL(file);
$: if (file) fileReader.readAsArrayBuffer(file.slice(0, 64 * 1024));
$: if (file) fileReaderBase64.readAsDataURL(file);
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
		<canvas bind:this={canvas}></canvas>
	{/if}
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
