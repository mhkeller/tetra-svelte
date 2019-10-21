<script>
import scaleCanvas from '../modules/scaleCanvas.js';
import { onMount } from 'svelte';

let video;
let captureCanvas;
let h = window.innerHeight;
let w;
let localStream;
let cameraOn = true;

const config = { video: { height: h, facingMode: 'environment' }, audio: false };

onMount (() => {
  // initCamera();
  // const context = captureCanvas.getContext('2d');
  // scaleCanvas(captureCanvas, context, w, h);
});

/* --------------------------------------------
 * TODO, set up cameraOn as a writable store value
 */
function reshowCamera () {
  cameraOn = true;
  clearOverlays();
}

function initCamera () {
  const log = msg => console.log(msg);
  navigator.mediaDevices.getUserMedia(config)
    .then(stream => {
      video.srcObject = stream;
      localStream = stream;
      return stream;
    })
    .then(() => new Promise(resolve => {
      video.onloadedmetadata = resolve;
      return resolve;
    }))
    .then(() => {
      log('Success: ' + video.videoWidth + 'x' + video.videoHeight);
      w = video.videoWidth;
      h = video.videoHeight;
    })
    .catch(log);
}

function clearOverlays () {
  const context = captureCanvas.getContext('2d');
  context.clearRect(0, 0, w, h);
}

function capture () {
  cameraOn = !cameraOn;
  const context = captureCanvas.getContext('2d');
  context.drawImage(video, 0, 0, w, h);
  showCamera = false;
}
</script>
<style>
  #video,
  #video-capture-canvas,
  #video-overlay {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translate(-50%, 0);
  }
  .toolbar {
    list-style: none;
    height: 20%;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;
    display: flex;
    background-color: #000;
  }
  .toolbar li {
    width: 33%;
    position: relative;
    height: 100%;
  }
  .toolbar li:hover {
    cursor: pointer;
  }
  .hidden {
    visibility: hidden;
    pointer-events: none;
  }
  #capture-btn:before,
  #capture-btn:after {
    content: '';
    border-radius: 50%;
    background-color: #fff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  #capture-btn:hover:before,
  #capture-btn:hover:after {
    background-color: #ccc;
  }
  #capture-btn:active:before,
  #capture-btn:active:after {
    background-color: #aaa;
  }
  #capture-btn:after {
    width: 52px;
    height: 52px;
    border: 4px #000 solid;
  }
  #capture-btn:before {
    width: 65px;
    height: 65px;
  }

  #retake-btn:before {
    position: absolute;
    content: 'Retake';
    text-align: center;
    width: 100%;
    top: 50%;
    transform: translate(0, -50%);
    color: yellow;
  }

</style>

<!-- <video id="video" width="{w}" height="{h}" autoplay playsinline muted bind:this={video} class="{cameraOn ? '' : 'hidden'}"></video>
<canvas id="video-capture-canvas" bind:this={captureCanvas} width="{w}" height="{h}"></canvas>
<div id="video-overlay" style="width:{w}px; height:{h}px;"></div>
 --><input type="file" capture="camera" accept="image/*" id="cameraInput" name="cameraInput">
<ul class="toolbar">
  <li id="retake-btn" class="toolbar-btn {cameraOn ? 'hidden' : ''}" on:click="{reshowCamera}"></li><li id="capture-btn" class="toolbar-btn {cameraOn ? '' : 'hidden'}" on:click="{capture}"></li>
</ul>
