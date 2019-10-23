<script>
import { wordToTranslate } from '../modules/stores.js';
export let box;

let activeWord;

wordToTranslate.subscribe(val => {
	activeWord = val;
});
function sendForTranslation () {
	wordToTranslate.set(box.text);
}
</script>

<style>
	.box {
		position: absolute;
		border: 1px solid red;
	}
	.active {
		background-color: rgba(255, 0, 0, .35);
	}
</style>

<div
	class="box {box.text === activeWord ? 'active' : ''}"
	style="left: {box.bbox.x0}px; top: {box.bbox.y0}px; width: {box.bbox.x1 - box.bbox.x0}px; height: {box.bbox.y1 - box.bbox.y0}px"
	on:click={sendForTranslation}
	></div>
