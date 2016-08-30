'use strict';

var bbox = document.getElementById('player').getBoundingClientRect(),
    info = document.getElementById('video-info'),
    youtube = undefined;

var player = new Vue({
    el: '#player',
    data: {
        info: false,
        title: '',
        video_ids: []
    },
    ready: function ready() {
        this.getVideos();
    },
    methods: {
        createIframe: function createIframe() {
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var first = document.getElementsByTagName('script')[0];
            first.parentNode.insertBefore(tag, first);
        },
        getVideos: function getVideos() {
            var _this = this;

            this.$http({
                url: 'https://www.reddit.com/r/punk/search.json',
                method: 'GET',
                data: { q: 'url:youtube.com/watch', sort: 'new', restrict_sr: 'on', t: 'all' }
            }).then(function (response) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = response.data.data.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var child = _step.value;

                        var query = parseQuery(parseUrl(child.data.url));
                        if (query.v) {
                            _this.video_ids.push(query.v);
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator['return']) {
                            _iterator['return']();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                player.createIframe();
            });
        },
        next: function next(event) {
            youtube.nextVideo();
        },
        pause: function pause(event) {
            youtube.pauseVideo();
        },
        play: function play(event) {
            player.info = true;
            youtube.playVideo();
        },
        previous: function previous(event) {
            youtube.previousVideo();
        },
        ready: function ready(event) {
            //event.target.playVideo();
        },
        stateChange: function stateChange(event) {
            console.log(event);
            player.title = youtube.getVideoData().title;
        },
        stop: function stop(event) {
            player.info = false;
            youtube.stopVideo();
        }
    }
});

function onYouTubeIframeAPIReady() {
    youtube = new YT.Player('video', {
        controls: 0,
        height: bbox.width * 0.66,
        events: {
            'onReady': player.ready,
            'onStateChange': player.stateChange
        },
        playerVars: {
            autoplay: 0,
            playlist: player.video_ids.join(','),
            wmode: 'transparent'
        },
        width: bbox.width
    });
};

function parseUrl(url) {
    var a = document.createElement('a');
    a.href = url;
    return a;
}

function parseQuery(url) {
    return url.search.replace('?', '').split('&amp;').reduce(function (previous, current) {
        var tuple = current.split('=');
        previous[tuple[0]] = tuple[1];
        return previous;
    }, {});
}