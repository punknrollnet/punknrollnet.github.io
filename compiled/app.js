let vm = new PlayerBase({
  data: {
    current: null,
    bbox: null,
    records: null,
    reset: false,
    sort_order: "new",
    start_video: null,
    video_ids: []
  },
  created: function() {
    if (document.location.hash && document.location.hash.length == 12) {
      this.start_video = document.location.hash.replace("#", "");
    }
    this.loadPlaylist(genre);
  }
});
function onYouTubeIframeAPIReady() {
  vm.initPlayer();
}
