<script>
  import Icon from 'svelte-awesome';
  import { beer, facebook,instagram ,linkedin} from 'svelte-awesome/icons';

</script>

<footer>
    <div class="footer__left">
        <p>maxstudio@2021</p>
    </div>
    <div class="footer__center">
        <ul>
            <li class="footer__link-instagram">
                <a href="http://instagram/maxstudio"><Icon data={instagram}/></a>
            </li>
            <li class="footer__link-facebook">
                <a href="http://instagram/maxstudio"><Icon data={facebook}/></a>
            </li>
            <li class="footer__link-linkedin">
                <a href="http://instagram/maxstudio"><Icon data={linkedin}/></a>
            </li>
        </ul>

    </div>
    <div class="footer__right">
        <a href="mailto:info@maxstudio.ch?subject=Testing out mailto!">info@maxstudio.ch</a>
    </div>
</footer>

<style>
</style>