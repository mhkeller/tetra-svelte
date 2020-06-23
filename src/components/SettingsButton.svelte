<script>
	export let showSettings;
</script>

<style>
	.show-settings {
		position: fixed;
		top: 7px;
		left: 3px;
		width: 30px;
		height: 30px;
		background: url(settings-btn-white.svg);
		background-size: contain;
		background-repeat: no-repeat;
		cursor: pointer;
	}
</style>

<div
	on:click={() => showSettings = true}
	class="show-settings"></div>
