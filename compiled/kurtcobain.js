// https://vis4.net/labs/multihue/#colors=white,lightgrey,silver,dimgrey|steps=9|bez=0|coL=1
'use strict';

var colors = ['#ffffff', '#ebebeb', '#d7d7d7', '#c4c4c4', '#b1b1b1', '#9e9e9e'].reverse();

// https://github.com/brez/stopwords/blob/master/lib/stopwords.rb
var stopwords = ['don', 've', 'doesn', 'a', 'cannot', 'into', 'our', 'thus', 'about', 'co', 'is', 'ours', 'to', 'above', 'could', 'it', 'ourselves', 'together', 'across', 'down', 'its', 'out', 'too', 'after', 'during', 'itself', 'over', 'toward', 'afterwards', 'each', 'last', 'own', 'towards', 'again', 'eg', 'latter', 'per', 'under', 'against', 'either', 'latterly', 'perhaps', 'until', 'all', 'else', 'least', 'rather', 'up', 'almost', 'elsewhere', 'less', 'same', 'upon', 'alone', 'enough', 'ltd', 'seem', 'us', 'along', 'etc', 'many', 'seemed', 'very', 'already', 'even', 'may', 'seeming', 'via', 'also', 'ever', 'me', 'seems', 'was', 'although', 'every', 'meanwhile', 'several', 'we', 'always', 'everyone', 'might', 'she', 'well', 'among', 'everything', 'more', 'should', 'were', 'amongst', 'everywhere', 'moreover', 'since', 'what', 'an', 'except', 'most', 'so', 'whatever', 'and', 'few', 'mostly', 'some', 'when', 'another', 'first', 'much', 'somehow', 'whence', 'any', 'for', 'must', 'someone', 'whenever', 'anyhow', 'former', 'my', 'something', 'where', 'anyone', 'formerly', 'myself', 'sometime', 'whereafter', 'anything', 'from', 'namely', 'sometimes', 'whereas', 'anywhere', 'further', 'neither', 'somewhere', 'whereby', 'are', 'had', 'never', 'still', 'wherein', 'around', 'has', 'nevertheless', 'such', 'whereupon', 'as', 'have', 'next', 'than', 'wherever', 'at', 'he', 'no', 'that', 'whether', 'be', 'hence', 'nobody', 'the', 'whither', 'became', 'her', 'none', 'their', 'which', 'because', 'here', 'noone', 'them', 'while', 'become', 'hereafter', 'nor', 'themselves', 'who', 'becomes', 'hereby', 'not', 'then', 'whoever', 'becoming', 'herein', 'nothing', 'thence', 'whole', 'been', 'hereupon', 'now', 'there', 'whom', 'before', 'hers', 'nowhere', 'thereafter', 'whose', 'beforehand', 'herself', 'of', 'thereby', 'why', 'behind', 'him', 'off', 'therefore', 'will', 'being', 'himself', 'often', 'therein', 'with', 'below', 'his', 'on', 'thereupon', 'within', 'beside', 'how', 'once', 'these', 'without', 'besides', 'however', 'one', 'they', 'would', 'between', 'i', 'only', 'this', 'yet', 'beyond', 'ie', 'onto', 'those', 'you', 'both', 'if', 'or', 'though', 'your', 'but', 'in', 'other', 'through', 'yours', 'by', 'inc', 'others', 'throughout', 'yourself', 'can', 'indeed', 'otherwise', 'thru', 'yourselves'];

var suicide_note = "To Boddah  Speaking from the tongue of an experienced simpleton who obviously would rather be an emasculated, infantile complain-ee. This note should be pretty easy to understand.  All the warnings from the punk rock 101 courses over the years, since my first introduction to the, shall we say, ethics involved with independence and the embracement of your community has proven to be very true. I haven't felt the excitement of listening to as well as creating music along with reading and writing for too many years now. I feel guity beyond words about these things.  For example when we're back stage and the lights go out and the manic roar of the crowds begins., it doesn't affect me the way in which it did for Freddie Mercury, who seemed to love, relish in the the love and adoration from the crowd which is something I totally admire and envy. The fact is, I can't fool you, any one of you. It simply isn't fair to you or me. The worst crime I can think of would be to rip people off by faking it and pretending as if I'm having 100% fun. Sometimes I feel as if I should have a punch-in time clock before I walk out on stage. I've tried everything within my power to appreciate it (and I do,God, believe me I do, but it's not enough). I appreciate the fact that I and we have affected and entertained a lot of people. It must be one of those narcissists who only appreciate things when they're gone. I'm too sensitive. I need to be slightly numb in order to regain the enthusiasms I once had as a child.  On our last 3 tours, I've had a much better appreciation for all the people I've known personally, and as fans of our music, but I still can't get over the frustration, the guilt and empathy I have for everyone. There's good in all of us and I think I simply love people too much, so much that it makes me feel too fucking sad. The sad little, sensitive, unappreciative, Pisces, Jesus man. Why don't you just enjoy it? I don't know!  I have a goddess of a wife who sweats ambition and empathy and a daughter who reminds me too much of what i used to be, full of love and joy, kissing every person she meets because everyone is good and will do her no harm. And that terrifies me to the point to where I can barely function. I can't stand the thought of Frances becoming the miserable, self-destructive, death rocker that I've become.  I have it good, very good, and I'm grateful, but since the age of seven, I've become hateful towards all humans in general. Only because it seems so easy for people to get along that have empathy. Only because I love and feel sorry for people too much I guess.  Thank you all from the pit of my burning, nauseous stomach for your letters and concern during the past years. I'm too much of an erratic, moody baby! I don't have the passion anymore, and so remember, it's better to burn out than to fade away.  Peace, love, empathy. Kurt Cobain  Frances and Courtney, I'll be at your alter. Please keep going Courtney, for Frances. For her life, which will be so much happier without me.  I LOVE YOU, I LOVE YOU!";

var text = suicide_note.toLowerCase().replace(/"'"/g, '').replace(/\W+/g, ' ').replace(/\s{2,}/g, ' ').trim(),
    words = text.split(' '),
    counts = {};

words.forEach(function (word) {
    if (-1 !== stopwords.indexOf(word) || word.length < 3) return;
    if (!counts.hasOwnProperty(word)) counts[word] = 0;
    counts[word]++;
});
var counts_list = d3.entries(counts);

words = counts_list.map(function (d) {
    return { text: d.key, size: d.value };
});

var min = d3.min(counts_list, function (d) {
    return d.value;
}),
    max = d3.max(counts_list, function (d) {
    return d.value;
}),
    fontSize = d3.scale.linear().range([min, max * 1.8]),
    bbox = d3.select('#vis').node().getBoundingClientRect(),
    w = bbox.width,
    h = w * 0.7,
    offset = 1.8,
    svg = null,
    g = null;

var quantize = d3.scale.quantize().domain([min, max]).range(colors);

function draw(data) {
    svg = d3.select('#vis svg');
    g = svg.attr('width', w).attr('height', h).append('g').attr('transform', 'translate(' + (w >> 1) + ',' + (h >> 1) + ')');

    g.selectAll('text').data(words).enter().append('text').transition().duration(500).style('font-size', function (d) {
        return d.size + 'px';
    }).style('fill', function (d) {
        return quantize(counts[d.text]);
    }).attr('text-anchor', 'start').attr('transform', function (d) {
        return 'translate(' + [offset * d.x, offset * d.y] + ')rotate(' + d.rotate + ')';
    }).text(function (d) {
        return d.text;
    });
}

function genCloud() {
    var cloud = d3.layout.cloud();
    cloud.size([w, h]).words(words).rotate(0).font('Impact').fontSize(function (d) {
        return fontSize(d.size);
    }).on('end', draw).start();

    return cloud;
}

function init() {
    genCloud();
    d3.select('#refresh').on('click', function () {
        // re-map so layout can be re-drawn
        words = counts_list.map(function (d) {
            return { text: d.key, size: d.value };
        });
        g.selectAll('text').remove();
        genCloud();
    });
}

window.onload = init;