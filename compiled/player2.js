const SCALE_HEIGHT = 0.6;
// Prevent video from overlapping on the right.
const SCALE_PLAYER = 0.97;

const RD = 'https://www.reddit.com';

function parseUrl(url) {
    var a = document.createElement('a');
    a.href = url;
    return a;
}

function parseQuery(url) {
    return url.search.replace('?', '').split('&amp;').reduce((previous, current) => {
        let tuple = current.split('=');
        previous[tuple[0]] = tuple[1];
        return previous;
    }, {});
}

Vue.component('playlist-item', {
    props: ['record'],
    template: `<div class="row">
            <div class="column column-10">
                <img :src="'https://i.ytimg.com/vi/' + record.youtube.id + '/default.jpg'" alt="Video preview">
            </div>
            <div class="column">
                <h2 class="yt-title">{{ record.youtube.title }}</h2>
                <p><strong>Score:</strong> {{ record.score }} - <a :href="RD + record.permalink">{{ record.title }}</a><br>
                  submitted <span class="muted">{{ record.date }}</span> by <a :href="RD + '/user/' + record.author">/u/{{ record.author }}</a>.</p>
            </div>
        </div>`
});

let PlayerBase = Vue.extend({
    el: '#player',
    mounted: function () {
        // Set height before loading data from reddit and youtube.
        this.bbox = this.$el.getBoundingClientRect();
        document.getElementById('video').style.height = `${this.bbox.width * SCALE_HEIGHT}px`;
    },
    methods: {
        cuePlaylist: function () {
            // Cut off videos before current if set
            if (this.start_video && this.video_ids.includes(this.start_video)) {
                let start = this.video_ids.indexOf(this.start_video);
                this.video_ids = this.video_ids.slice(start);
            }
            this.youtube.cuePlaylist(this.video_ids);
        },
        initPlayer: function () {
            this.youtube = new YT.Player('video', {
                height: this.bbox.width * SCALE_HEIGHT * SCALE_PLAYER,
                events: {
                    'onReady': this.cuePlaylist,
                    'onStateChange': this.stateChange
                },
                playerVars: {
                    autoplay: 0,
                    wmode: 'transparent'
                },
                width: this.bbox.width * SCALE_PLAYER
            });
        },
        loadGenre: function (genre) {
            this.$http({
                url: `${RD}/r/${genre}/search.json`,
                method: 'GET',
                params: { q: 'url:youtube.com/watch', sort: this.sort_order, restrict_sr: 'on', t: 'all' }
            }).then(this.procResponse);
        },
        loadPlaylist: function (genre) {
            // Local playlist data is marked up with HTML
            let record_collection = document.getElementsByClassName('record');
            if (record_collection.length) {
                document.getElementById('playlist').style.display = 'none';
                Array.from(record_collection).forEach(elt => {
                    this.video_ids.push(elt.id);
                });
            } else {
                this.loadGenre(genre);
            }
        },
        procResponse: function (response) {
            if (!response.ok) {
                return;
            };
            this.video_ids = [];
            this.records = new Map();
            let body = response.body;
            if ('string' === typeof body) {
                body = JSON.parse(body);
            }
            for (let child of body.data.children) {
                let query = parseQuery(parseUrl(child.data.url));
                // Make sure youtube video ID is valid.
                if (query.v && 11 == query.v.length) {
                    this.video_ids.push(query.v);
                    this.records.set(query.v, child.data);
                }
            }
            if (this.video_ids && this.reset) {
                this.cuePlaylist();
                this.reset = false;
            }
        },
        reload: function (order, genre) {
            this.sort_order = order;
            this.reset = true;
            this.start_video = null;
            this.loadGenre(genre);
        },
        stateChange: function (event) {
            if (event.data == YT.PlayerState.PLAYING) {
                // Set location hash so videos can be bookmarked.
                let video = this.youtube.getVideoData();
                document.location.hash = video.video_id;
                document.title = `${video.title} - now playing on punknroll.net`;
                if (this.records.has(video.video_id)) {
                    this.current = this.records.get(video.video_id);
                    this.current.youtube = { id: video.video_id, title: video.title };
                    let date = new Date(this.current.created_utc * 1000);
                    this.current.date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                }
            } else if (event.data == YT.PlayerState.ENDED) {
                this.current = null;
            }
        }
    }
});