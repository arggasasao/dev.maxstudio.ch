<script>
	import Slider from "./components/Slider.svelte";
	import Services from "./components/Services.svelte";
	import Header from "./components/Header.svelte";
	import Footer from "./components/Footer.svelte";
	// import 'css/styles.css';
</script>

<svelte:head>
	<title>Max Studio - Digital Agency</title>
</svelte:head>

<main class="landing-main">
	<Header/>
	<Slider/>
	<Services/>
	<Footer/>
	<div class="bg-lines"></div>
	<div class="bg-bigx"></div>
</main>

<style>
	/* .landing-main{
		margin: 20px;
	} */
	/* @import  "css/styles.css"; */

</style>
