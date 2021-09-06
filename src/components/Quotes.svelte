<script>
    import Icon from "svelte-awesome";
    import { chevronRight  } from "svelte-awesome/icons";
    // import { faThumbsUp } from '@fortawesome/free-regular-svg-icons';
    let box = document.getElementById('quotes')
    // let ww = box.offsetWidth
    console.log(box)
</script>

<section class="quotes">
    <h1>What ours clients think</h1>
    <p>
        Ours clients is very happy with <b>MaxStudio</b>.
    </p>
    <div class="quotes__nav">
        <a class="quotes__right" href="/#">
            <svg width="42px" height="61px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                <path id="arrow" d="M30.243,60.918L41.237,49.924L22.23,30.918L41.237,11.913L30.243,0.918L0.243,30.918L30.243,60.918Z" style="fill-rule:nonzero;" />
            </svg>
        </a>
        <a class="quotes__left" href="/#">
            <svg width="42px" height="61px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                <path id="arrow" d="M30.243,60.918L41.237,49.924L22.23,30.918L41.237,11.913L30.243,0.918L0.243,30.918L30.243,60.918Z" style="fill-rule:nonzero;" />
            </svg>
        </a>
    </div>
    <div id="quotes" class="quotes__container">
        <div class="quotes__scroll">
            <div class="quotes__item">
                <div class="quotes__text">
                    <!-- <img src="img/quotes.svg" alt=""> -->
                    <p>
                        In my Experience this gone very fluid, the <b>MaxStudio</b> se
                        superou. Prazer trabalhar con eles!
                    </p>
                </div>
                <div class="quotes__avatar">
                    <img src="./img/avatar_woman.svg" alt="" />
                    <div class="quotes__name">
                        <h2>We care about your dream</h2>
                        <p>Our team are from different part of the world</p>
                    </div>
                </div>
            </div>

            <div class="quotes__item">
                <div class="quotes__text">
                    <!-- <img src="img/quotes.svg" alt=""> -->
                    <p>
                        In my Experience this gone very fluid, the <b>MaxStudio</b> se
                        superou. Prazer trabalhar con eles!
                    </p>
                </div>
                <div class="quotes__avatar">
                    <img src="./img/avatar_woman.svg" alt="" />
                    <div class="quotes__name">
                        <h2>We care about your dream</h2>
                        <p>Our team are from different part of the world</p>
                    </div>
                </div>
            </div>

        </div>
    </div>
</section>

<style>
</style>
