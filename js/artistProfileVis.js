

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

        // vis.margin = {top: 0, right: 40, bottom: 10, left: 4};
        // vis.padding = {top: 30, right: 0, bottom: 0, left: 0};
        //
        // vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        // vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height  - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        // vis.svg = d3.select("#" + vis.parentElement).append("svg")
        //     .attr("width", vis.width + vis.margin.left + vis.margin.right)
        //     .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        //     .append("g")
        //     .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        if(artistProfileName.innerText != "") vis.wrangleData();

    }
    wrangleData(){
        let vis = this;
        document.getElementById("top-hits").style.visibility = "visible";

        topTenArtists.forEach(d => {
            if(d.artist === artistProfileName.innerText){
                vis.displayData = d;
            }
        })

        vis.displayData = vis.displayData.songs.slice(0,3);
        //console.log(vis.displayData);

        // populate the audio info of all the songs within the top 10 artists
        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        let table = d3.select("#top-hits2")
        vis.rows = table.selectAll("tr")
            .data(vis.displayData);
        vis.rows.exit().remove();
        vis.rows = vis.rows.enter()
            .append("tr")
            .attr("class", "top-song-row")
            .merge(vis.rows)
            .on("click", function(event, d) {
                document.getElementById("song-selection").innerText = vis.audio.get(d).song;
                document.getElementById("song-here").src = vis.audio.get(d).spotify_track_preview_url;
                displayArtistProfile();
            });

        vis.cells = vis.rows.selectAll("td")
            .data((d,i)=> {
                let album = "Single";
                if(vis.audio.get(d).spotify_track_album[0] != "{"){
                    album = vis.audio.get(d).spotify_track_album;
                }
                return [i+1, vis.audio.get(d).song, album];
            })
        vis.cells.exit().remove();
        vis.cells.enter().append("td")
            .merge(vis.cells)
            .text(d=>d)
            .attr("class", (d,i) => {
                if(i === 0) return "song-place";
            });
        //
        //
        // let topSongs = vis.svg.selectAll(".top-artist-songs")
        //     .data(vis.displayData.songs);
        //
        // topSongs.enter().append("text")
        //     .attr("class", "top-artist-songs")
        //     .merge(topSongs)
        //     .attr("x", 0)
        //     .attr("y", (d,i) => 30 + i*30)
        //     .text((d,i) => (i+1)+" "+vis.audio.get(d).song)
        //     .on("mouseover", function(event, d) {
        //         d3.select(this).style("cursor", "pointer");
        //     })
        //     .on("mouseout", function(event ,d) {
        //         d3.select(this).style("cursor", "default");
        //     })
        //     .on("click", function(event, d) {
        //         document.getElementById("song-selection").innerText = vis.audio.get(d).song;
        //         displayArtistProfile();
        //     });
        //
        // topSongs.exit().remove();

    }
}