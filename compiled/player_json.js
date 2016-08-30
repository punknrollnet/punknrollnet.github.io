'use strict';

var player = new Vue({
    el: '#player',
    data: {
        info: false,
        records: null,
        reddit: null,
        month: 11,
        subreddit: 'punk',
        video_ids: [],
        year: 2015,
        youtube: null
    },
    ready: function ready() {
        this.createIframe();
    },
    methods: {
        createIframe: function createIframe() {
            var tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            var first = document.getElementsByTagName('script')[0];
            first.parentNode.insertBefore(tag, first);
        },
        getFileName: function getFileName() {
            return '/archive/' + this.subreddit + '/' + this.year + '/' + this.month + '.json';
        },
        loadPlaylist: function loadPlaylist() {
            var _this = this;

            this.info = false;
            this.$http({
                url: this.getFileName(),
                method: 'GET'
            }).then(function (response) {
                _this.records = JSON.parse(response.data);
                _this.video_ids = _this.records.map(function (d) {
                    return d.yt_vid;
                }).slice(0, 100);
                _this.youtube.cuePlaylist(_this.video_ids);
            });
        },
        ready: function ready(event) {
            this.loadPlaylist();
        },
        stateChange: function stateChange(event) {
            if (event.data == YT.PlayerState.PLAYING) {
                var video = this.youtube.getVideoData(),
                    vidx = this.video_ids.indexOf(video.video_id);
                this.reddit = this.records[vidx];

                // format date here:
                var date = new Date(this.reddit.created_utc * 1000);
                this.reddit.date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

                this.info = true;
            }
        },
        stop: function stop(event) {
            this.info = false;
            this.youtube.stopVideo();
        }
    }
});

function onYouTubeIframeAPIReady() {
    var bbox = player.$el.getBoundingClientRect();
    player.youtube = new YT.Player('video', {
        height: bbox.width * 0.6,
        events: {
            'onReady': player.ready,
            'onStateChange': player.stateChange
        },
        playerVars: {
            autoplay: 0,
            wmode: 'transparent'
        },
        width: bbox.width
    });
};