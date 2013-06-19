// ==UserScript==
// @name          Team Avolition Shoutbox Enhancements
// @description   Various enhancements for the Team Avolition shoutbox
// @include       /^http://www.teamavolition.com/index.php\?.*app=forums\/?(&.*)*$/
// @include       /^http://www.teamavolition.com/shoutbox\/?$/
// @include       /^http://www.teamavolition.com/index.php\?.*app=shoutbox\/?(&.*)*$/
// @version       1.1
// @updateURL     https://raw.github.com/rakiru/team_avo_shoutbox_enhancements/master/teamAvoShoutbox.user.js
// @icon          http://www.teamavolition.com/favicon.ico
// ==/UserScript==

var script = document.createElement("script");
script.setAttribute("src", "https://raw.github.com/chall8908/team_avo_shoutbox_enhancements/master/teamAvoShoutbox.min.js");
document.body.appendChild(script);