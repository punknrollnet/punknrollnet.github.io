const SCALE_HEIGHT = 0.6;
const SCALE_PLAYER = 0.97;
const RD = "https://www.reddit.com";
function parseUrl(url) {
  var a = document.createElement("a");
  a.href = url;
  return a;
}
function parseQuery(url) {
  return url.search.replace("?", "").split("&amp;").reduce((previous, current) => {
    let tuple = current.split("=");
    previous[tuple[0]] = tuple[1];
    return previous;
  }, {});
}
Vue.component("playlist-item", {
  props: ["record"],
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
  el: "#player",
  mounted: function() {
    this.bbox = this.$el.getBoundingClientRect();
    document.getElementById("video").style.height = `${this.bbox.width * SCALE_HEIGHT}px`;
  },
  methods: {
    cuePlaylist: function() {
      if (this.start_video && this.video_ids.includes(this.start_video)) {
        let start = this.video_ids.indexOf(this.start_video);
        this.video_ids = this.video_ids.slice(start);
      }
      this.youtube.cuePlaylist(this.video_ids);
    },
    initPlayer: function() {
      this.youtube = new YT.Player("video", {
        height: this.bbox.width * SCALE_HEIGHT * SCALE_PLAYER,
        events: {
          "onReady": this.cuePlaylist,
          "onStateChange": this.stateChange
        },
        playerVars: {
          autoplay: 0,
          wmode: "transparent"
        },
        width: this.bbox.width * SCALE_PLAYER
      });
    },
    loadGenre: function(genre) {
      let period = this.sort_order === "hot" ? "week" : "all";
      this.$http({
        url: `${RD}/r/${genre}/search.json`,
        method: "GET",
        params: { q: "url:youtube.com/watch", sort: this.sort_order, restrict_sr: "on", t: period }
      }).then(this.procResponse, (error) => console.error(error));
    },
    loadPlaylist: function(genre) {
      let record_collection = document.getElementsByClassName("record");
      if (record_collection.length) {
        document.getElementById("playlist").style.display = "none";
        Array.from(record_collection).forEach((elt) => {
          this.video_ids.push(elt.id);
        });
      } else {
        this.loadGenre(genre);
      }
    },
    procResponse: function(response) {
      if (!response.ok) {
        return;
      }
      ;
      this.video_ids = [];
      this.records = /* @__PURE__ */ new Map();
      let body = response.body;
      if ("string" === typeof body) {
        body = JSON.parse(body);
      }
      for (let child of body.data.children) {
        let query = parseQuery(parseUrl(child.data.url));
        if (query.v && 11 == query.v.length && !this.video_ids.includes(query.v)) {
          this.video_ids.push(query.v);
          this.records.set(query.v, child.data);
        }
      }
      if (this.video_ids && this.reset) {
        this.cuePlaylist();
        this.reset = false;
      }
    },
    reload: function(order, genre) {
      this.sort_order = order;
      this.reset = true;
      this.start_video = null;
      this.loadGenre(genre);
    },
    stateChange: function(event) {
      if (event.data == YT.PlayerState.PLAYING) {
        let video = this.youtube.getVideoData();
        document.location.hash = video.video_id;
        document.title = `${video.title} - now playing on punknroll.net`;
        if (this.records.has(video.video_id)) {
          this.current = this.records.get(video.video_id);
          this.current.youtube = { id: video.video_id, title: video.title };
          let date = new Date(this.current.created_utc * 1e3);
          this.current.date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        }
      } else if (event.data == YT.PlayerState.ENDED) {
        this.current = null;
      }
    }
  }
});
