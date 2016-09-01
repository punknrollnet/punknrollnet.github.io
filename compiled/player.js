'use strict';

var SCALE_HEIGHT = 0.6;

var player = new Vue({
    el: '#player',
    data: {
        bbox: null,
        current: null,
        index: 0,
        records: new Map(),
        sort_order: 'new',
        start_video: null,
        video_ids: [],
        youtube: null
    },
    ready: function ready() {
        // YouTube video IDs are 11 characters + the #
        if (document.location.hash && document.location.hash.length == 12) this.start_video = document.location.hash.replace('#', '');

        // Set height before loading data from reddit and youtube.
        this.bbox = this.$el.getBoundingClientRect();
        document.getElementById('video').style.height = this.bbox.width * SCALE_HEIGHT + 'px';

        this.hideRecords();
        this.createIframe();
    },
    methods: {
        createIframe: function createIframe() {
            var tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            var first = document.getElementsByTagName('script')[0];
            first.parentNode.insertBefore(tag, first);
        },
        genre: (function (_genre) {
            function genre(_x) {
                return _genre.apply(this, arguments);
            }

            genre.toString = function () {
                return _genre.toString();
            };

            return genre;
        })(function (genre) {
            this.$http({
                url: 'https://www.reddit.com/r/' + genre + '/search.json',
                method: 'GET',
                params: { q: 'url:youtube.com/watch', sort: this.sort_order, restrict_sr: 'on', t: 'all' }
            }).then(this.procResponse);
        }),
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
            this.loadPlaylist();
        },
        loadPlaylist: function loadPlaylist() {
            if (this.start_video && this.video_ids.includes(this.start_video)) this.index = this.video_ids.indexOf(this.start_video);
            this.youtube.cuePlaylist(this.video_ids, this.index);
        },
        loadRecords: function loadRecords() {
            var record_collection = document.getElementsByClassName('record');
            if (record_collection.length) this.local(record_collection);else if (genre) this.genre(genre);else if (document.location.search) {
                this.search(parseQuery(document.location).q);
            }
        },
        procResponse: function procResponse(response) {
            this.records.clear();
            var response_data = JSON.parse(response.body).data;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = response_data.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var child = _step.value;

                    var query = parseQuery(parseUrl(child.data.url));
                    if (query.v) {
                        this.video_ids.push(query.v);
                        this.records.set(query.v, child.data);
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

            this.loadPlaylist();
        },
        reload: function reload(order) {
            this.sort_order = order;
            // Start the newly loaded list from its beginning.
            this.start_video = null;
            // Hack to play from 1st video of new playlist because playlist of
            // youtube object cannot be cleared or otherwise changed.
            this.index = this.video_ids.length;
            this.loadRecords();
        },
        search: function search(text) {
            this.$http({
                url: 'https://www.reddit.com/search.json',
                method: 'GET',
                params: { q: text + ' url:youtube.com/watch', sort: this.sort_order, t: 'all' }
            }).then(this.procResponse);
        },
        stateChange: function stateChange(event) {
            if (event.data == YT.PlayerState.PLAYING) {
                var video = this.youtube.getVideoData();
                document.location.hash = video.video_id;
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
            'onReady': player.loadRecords,
            'onStateChange': player.stateChange
        },
        playerVars: {
            autoplay: 0,
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