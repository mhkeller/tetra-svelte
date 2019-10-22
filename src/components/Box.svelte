<script>
	export let box;

function log () {
	console.log(box.text);
}
</script>

<style>
	.box {
		position: absolute;
		border: 1px solid red;
	}
</style>

<div
	class="box"
	style="left: {box.bbox.x0}px; top: {box.bbox.y0}px; width: {box.bbox.x1 - box.bbox.x0}px; height: {box.bbox.y1 - box.bbox.y0}px"
	on:click={log}
	></div>
