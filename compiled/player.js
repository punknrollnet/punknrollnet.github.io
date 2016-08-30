'use strict';

var SCALE_HEIGHT = 0.6;

var player = new Vue({
    el: '#player',
    data: {
        bbox: null,
        current: null,
        records: new Map(),
        video_ids: [],
        youtube: null
    },
    ready: function ready() {
        // Set height before loading data from reddit and youtube.
        this.bbox = this.$el.getBoundingClientRect();
        document.getElementById('video').style.height = this.bbox.width * SCALE_HEIGHT + 'px';
        this.hideRecords();
        this.loadPlaylist();
    },
    methods: {
        createIframe: function createIframe() {
            var tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            var first = document.getElementsByTagName('script')[0];
            first.parentNode.insertBefore(tag, first);
        },
        hideRecords: function hideRecords() {
            this.current = null;
            Array.from(document.getElementsByClassName('record'), function (elt) {
                elt.style.display = 'none';
            });
        },
        local: function local(record_collection) {
            var _this = this;

            Array.from(record_collection).forEach(function (elt) {
                _this.video_ids.push(elt.id);
            });
            this.createIframe();
        },
        loadPlaylist: function loadPlaylist() {
            var record_collection = document.getElementsByClassName('record');
            if (record_collection.length) this.local(record_collection);else if (genre) this.remote(genre);
        },
        remote: function remote(genre) {
            var _this2 = this;

            this.$http({
                url: 'https://www.reddit.com/r/' + genre + '/search.json',
                method: 'GET',
                params: { q: 'url:youtube.com/watch', sort: 'new', restrict_sr: 'on', t: 'all' }
            }).then(function (response) {
                _this2.records.clear();
                var response_data = JSON.parse(response.body).data;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = response_data.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var child = _step.value;

                        var query = parseQuery(parseUrl(child.data.url));
                        if (query.v) {
                            _this2.video_ids.push(query.v);
                            _this2.records.set(query.v, child.data);
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
        stateChange: function stateChange(event) {
            if (event.data == YT.PlayerState.PLAYING) {
                var video = this.youtube.getVideoData();
                document.title = video.title + ' - now playing on punknroll.net';

                this.hideRecords();

                var record = document.getElementById(video.video_id);
                if (record) record.style.display = 'block';else if (this.records.has(video.video_id)) {
                    this.current = this.records.get(video.video_id);
                    this.current.youtube = { id: video.video_id, title: video.title };
                    // format date here:
                    var date = new Date(this.current.created_utc * 1000);
                    this.current.date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                }
            }
        },
        stop: function stop(event) {
            this.hideRecords();
            this.youtube.stopVideo();
        }
    }
});

function onYouTubeIframeAPIReady() {
    player.youtube = new YT.Player('video', {
        height: player.bbox.width * SCALE_HEIGHT,
        events: {
            'onReady': player.ready,
            'onStateChange': player.stateChange
        },
        playerVars: {
            autoplay: 0,
            playlist: player.video_ids.join(','),
            wmode: 'transparent'
        },
        width: player.bbox.width
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