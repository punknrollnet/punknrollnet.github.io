'use strict';

var width = 1000;
//document.getElementById('playlist').style.display = 'none';

var tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
var first = document.getElementsByTagName('script')[0];
first.parentNode.insertBefore(tag, first);

var youtube_ids = [];
Array.from(document.getElementsByClassName('record')).forEach(function (elt) {
    youtube_ids.push(elt.id);
});

var youtube = undefined;
function onYouTubeIframeAPIReady() {
    youtube = new YT.Player('video', {
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        },
        height: width * 0.6,
        playerVars: {
            autoplay: 0,
            wmode: 'transparent'
        },
        width: width
    });
}

function onPlayerReady(event) {
    youtube.cuePlaylist(youtube_ids);
}

function onPlayerStateChange(event) {
    console.log(event);
}