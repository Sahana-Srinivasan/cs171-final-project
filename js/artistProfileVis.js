

class ArtistProfileVis {
    constructor(_parentElement, _hotStuff, _audio) {
        this.parentElement = _parentElement;
        this.hotStuff = _hotStuff;
        this.audio = _audio;
        this.displayData = [];

        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 0, right: 40, bottom: 30, left: 10};
        vis.padding = {top: 30, right: 0, bottom: 0, left: 0};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height  - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        if(artistProfileName.innerText != "") vis.wrangleData();

    }
    wrangleData(){
        let vis = this;
        document.getElementById("top-hits").style.visibility = "visible";

        topTenArtists.forEach(d => {
            if(d.artist === artistProfileName.innerText){
                vis.displayData = d;
                console.log(vis.displayData);
            }
        })

        // populate the audio info of all the songs within the top 10 artists
        vis.updateVis();
    }

    updateVis(){
        let vis = this;
        console.log("updating top songs");

        let topSongs = vis.svg.selectAll(".top-artist-songs")
            .data(vis.displayData.songs);

        topSongs.enter().append("text")
            .attr("class", "top-artist-songs")
            .merge(topSongs)
            .attr("x", 0)
            .attr("y", (d,i) => 30 + i*30)
            .text(d => vis.audio.get(d).song)

        topSongs.exit().remove();

    }
}