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
		fill: transparent;
		stoke-width: 1px;
		stroke: red;
	}
	.active {
		fill: rgba(255, 0, 0, .35);
	}
</style>

<svelte:options namespace='svg'/>

<rect
	class="box {box.description === activeWord ? 'active' : ''}"
	x={box.boundingPoly.vertices[0].x}
	y={box.boundingPoly.vertices[0].y}
	width={box.boundingPoly.vertices[1].x - box.boundingPoly.vertices[0].x}
	height={box.boundingPoly.vertices[2].y - box.boundingPoly.vertices[0].y}
	on:click={sendForTranslation}
	></rect>
