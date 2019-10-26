<script>
import { wordToTranslate } from '../modules/stores.js';
export let box;

let activeWord;

wordToTranslate.subscribe(val => {
	activeWord = val;
});

function sendForTranslation () {
	wordToTranslate.set(box.description);
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
	class="box {box.description === activeWord ? 'active' : ''}"
	style="left: {box.boundingPoly.vertices[0].x}px; top: {box.boundingPoly.vertices[0].y}px; width: {box.boundingPoly.vertices[1].x - box.boundingPoly.vertices[0].x}px; height: {box.boundingPoly.vertices[2].y - box.boundingPoly.vertices[0].y}px"
	on:click={sendForTranslation}
	></div>
