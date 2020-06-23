<script>
	export let showSettings;
</script>

<style>
	.show-settings {
		position: fixed;
		top: 3px;
		left: 3px;
		width: 3vw;
		height: 3vw;
		background: url(settings-btn-white.svg);
		background-size: contain;
		background-repeat: no-repeat;
		cursor: pointer;
	}
</style>

<div
	on:click={() => showSettings = true}
	class="show-settings"></div>
