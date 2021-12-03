

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
                let audio = document.getElementById("audio");
                document.getElementById("audioSource").src = vis.audio.get(d).spotify_track_preview_url;
                if(!audio.paused) {
                    console.log("music playing");
                    audio.pause();
                } else {
                    audio.load();
                    audio.play();
                }
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

    }
}