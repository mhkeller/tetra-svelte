<script>
import scaleCanvas from '../modules/scaleCanvas.js';
import { onMount } from 'svelte';

let video;
let captureCanvas;
let h = window.innerHeight;
let w;
let localStream;
let cameraOn = true;


</script>
<style>

</style>

<input type="file" capture="camera" accept="image/*" id="cameraInput" name="cameraInput">
