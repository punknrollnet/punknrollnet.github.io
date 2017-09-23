const SCALE_HEIGHT=0.6,SCALE_PLAYER=0.97,RD='https://www.reddit.com';function parseUrl(b){var c=document.createElement('a');return c.href=b,c}function parseQuery(a){return a.search.replace('?','').split('&amp;').reduce((a,b)=>{let c=b.split('=');return a[c[0]]=c[1],a},{})}Vue.component('playlist-item',{props:['record'],template:`<div class="row">
            <div class="column column-10">
                <img :src="'https://i.ytimg.com/vi/' + record.youtube.id + '/default.jpg'" alt="Video preview">
            </div>
            <div class="column">
                <h2 class="yt-title">{{ record.youtube.title }}</h2>
                <p><strong>Score:</strong> {{ record.score }} - <a :href="RD + record.permalink">{{ record.title }}</a><br>
                  submitted <span class="muted">{{ record.date }}</span> by <a :href="RD + '/user/' + record.author">/u/{{ record.author }}</a>.</p>
            </div>
        </div>`});let PlayerBase=Vue.extend({el:'#player',mounted:function(){this.bbox=this.$el.getBoundingClientRect(),document.getElementById('video').style.height=`${this.bbox.width*SCALE_HEIGHT}px`},methods:{cuePlaylist:function(){if(this.start_video&&this.video_ids.includes(this.start_video)){let a=this.video_ids.indexOf(this.start_video);this.video_ids=this.video_ids.slice(a)}this.youtube.cuePlaylist(this.video_ids)},initPlayer:function(){this.youtube=new YT.Player('video',{height:this.bbox.width*SCALE_HEIGHT*SCALE_PLAYER,events:{onReady:this.cuePlaylist,onStateChange:this.stateChange},playerVars:{autoplay:0,wmode:'transparent'},width:this.bbox.width*SCALE_PLAYER})},loadGenre:function(a){let b='hot'===this.sort_order?'day':'all';this.$http({url:`${RD}/r/${a}/search.json`,method:'GET',params:{q:'url:youtube.com/watch',sort:this.sort_order,restrict_sr:'on',t:b}}).then(this.procResponse)},loadPlaylist:function(a){let b=document.getElementsByClassName('record');b.length?(document.getElementById('playlist').style.display='none',Array.from(b).forEach((a)=>{this.video_ids.push(a.id)})):this.loadGenre(a)},procResponse:function(a){if(!a.ok)return;this.video_ids=[],this.records=new Map;let b=a.body;'string'==typeof b&&(b=JSON.parse(b));for(let c of b.data.children){let a=parseQuery(parseUrl(c.data.url));a.v&&11==a.v.length&&(this.video_ids.push(a.v),this.records.set(a.v,c.data))}this.video_ids&&this.reset&&(this.cuePlaylist(),this.reset=!1)},reload:function(a,b){this.sort_order=a,this.reset=!0,this.start_video=null,this.loadGenre(b)},stateChange:function(a){if(a.data==YT.PlayerState.PLAYING){let a=this.youtube.getVideoData();if(document.location.hash=a.video_id,document.title=`${a.title} - now playing on punknroll.net`,this.records.has(a.video_id)){this.current=this.records.get(a.video_id),this.current.youtube={id:a.video_id,title:a.title};let b=new Date(1e3*this.current.created_utc);this.current.date=`${b.getFullYear()}-${b.getMonth()+1}-${b.getDate()}`}}else a.data==YT.PlayerState.ENDED&&(this.current=null)}}});