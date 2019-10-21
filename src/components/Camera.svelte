<script>
import scaleCanvas from '../modules/scaleCanvas.js';
import { onMount } from 'svelte';

let imageData;

const fileReader = new window.FileReader();
fileReader.onload = function () {
	imageData = fileReader.result; // data <-- in this var you have the file data in Base64 format
	console.log(imageData);
};

let files = [];

$: file = files[0];
$: if (file) fileReader.readAsDataURL(file);

// function getImage () {
// 	fileReader.readAsDataURL(this.files[0]);
// }
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
</style>

<img src="{imageData}"/>

<p>{file ? file.name : 'load a file'}</p>
<div class="open-camera">
	<input
		type="file"
		capture="camera"
		accept="image/*"
		name="cameraInput"
		bind:files
	>
</div>
