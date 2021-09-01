<script>
  import Icon from 'svelte-awesome';
  import { beer, facebook,instagram ,linkedin} from 'svelte-awesome/icons';
//   import { beer, refresh, comment, codeFork, camera, ban } from 'svelte-awesome/icons';
//   import { faThumbsUp } from '@fortawesome/free-regular-svg-icons';

</script>

<header class="header">
    <nav class="flex flex-jc-sb flex-al-vc">
        <a href="/" class="logo flex flex-fg-gr flex-al-vc">
            <img
                src="img/Logo-MaxStudio-horizonltal-rgb.svg"
                alt=""
                srcset=""
            />
        </a>
        <div class="header__lang flex flex-al-vc">
            <select name="lang-swc" id="">
                <option value="eng">Eng</option>
                <option value="fra">Fra</option>
                <option value="esp">Esp</option>
            </select>
        </div>

        <div class="header__menu">
            <span />
            <span />
            <span />
        </div>
        <div class="header__menu-content">
            <ul class="header__menu-items">
                <li><a href="/">Home</a></li>
                <li><a href="/About">About</a></li>
                <li><a href="/Services">Services</a></li>
                <li><a href="/Cases">Cases</a></li>
                <li><a href="/Contact">Contact</a></li>
            </ul>
            <ul class="header__menu-social">
                <li><Icon data={facebook}/><a href="/#">Facebook</a></li>
                <li><Icon data={instagram}/><a href="/#">Instagram</a> </li>
                <li><Icon data={linkedin}/><a href="/#">Linkedin</a> </li>
            </ul>
        </div>
    </nav>
</header>

<style>
</style>
