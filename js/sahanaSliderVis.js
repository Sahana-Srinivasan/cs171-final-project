
class SahanaSliderVis {

    constructor(_parentElement, _weeklyDict, _weeklyList, _topSongs, _songDict, _eventHandler) {
        this.parentElement = _parentElement;
        this.weeklyDict = _weeklyDict;
        this.weeklyList = _weeklyList;
        this.topSongs = _topSongs;
        this.songDict = _songDict;
        this.eventHandler = _eventHandler;

        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.formatDateIntoYear = d3.timeFormat("%Y");
        vis.formatDate = d3.timeFormat("%b %Y");
        vis.parseDate = d3.timeParse("%m/%d/%Y");
        vis.startDate = d3.min(Object.keys(vis.weeklyDict), d => vis.parseDate(d));
        vis.endDate = d3.max(Object.keys(vis.weeklyDict), d => vis.parseDate(d));
        vis.date = vis.startDate;

        vis.margin = {top:50, right:100, bottom:0, left:50},
            
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height  - vis.margin.top - vis.margin.bottom;
    
        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        vis.moving = false;
        vis.currentValue = 0;
        vis.targetValue = vis.width;

        vis.playButton = d3.select("#play-button");
        vis.songButton = d3.select("#song-button");
            
        vis.x = d3.scaleTime()
            .domain([vis.startDate, vis.endDate])
            .range([0, vis.targetValue])
            .clamp(true);

        vis.slider = vis.svg.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.height/5 + ")");

        vis.slider.append("line")
            .attr("class", "track")
            .attr("x1", vis.x.range()[0])
            .attr("x2", vis.x.range()[1])
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-inset")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-overlay")
            .call(d3.drag()
                .on("start.interrupt", function() { vis.slider.interrupt(); })
                .on("start drag", function(d) {
                    vis.currentValue = d.x;
                    vis.update(vis.x.invert(vis.currentValue)); 
                })
            );

        vis.slider.insert("g", ".track-overlay")
            .attr("class", "ticks")
            .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
            .data(vis.x.ticks(10))
            .enter()
            .append("text")
            .attr("x", vis.x)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .text(function(d) { return vis.formatDateIntoYear(d); });

        vis.handle = vis.slider.insert("circle", ".track-overlay")
            .attr("class", "handle")
            .attr("r", 9);

        vis.label = vis.slider.append("text")  
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .text(vis.formatDate(vis.startDate))
            .attr("transform", "translate(0," + (-25) + ")")

        vis.playButton
            .on("click", function() {
            var button = d3.select(this);
            if (button.text() == "Pause") {
              vis.moving = false;
              vis.timer.stop();
              // timer = 0;
              button.text("Play Animation");
            } else {
              vis.moving = true;
              vis.timer = d3.timer((elapsed) => {
                vis.update(vis.x.invert(vis.currentValue));
                vis.currentValue = vis.currentValue + (vis.targetValue/5051);
                if (vis.currentValue > vis.targetValue) {
                    vis.moving = false;
                    vis.currentValue = 0;
                    vis.timer.stop();
                    // timer = 0;
                    vis.playButton.text("Play Animation");
                }
              }, 100);
            //   vis.currentValue = vis.currentValue + (vis.targetValue/151);
            //   vis.update(vis.x.invert(vis.currentValue));
              button.text("Pause");
            }
          })
        // SVG drawing area
        vis.songSvg = d3.select("#song-viz").append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        let currYear = vis.formatDateIntoYear(vis.date)
        let topSongName = vis.topSongs[currYear][0]["title"]
        let topSongArtist = vis.topSongs[currYear][0]["artist"]
        document.getElementById("top-song-display").innerText = topSongName + " by " + topSongArtist;

        vis.songButton
          .on("click", function() {
            var audio = document.getElementById('audio');
            var button = d3.select(this);
            var source = document.getElementById('audioSource');
            if (button.text() == "Mute (Annual Top Song)") {
                audio.pause();
                button.text("Unmute (Annual Top Song)");
            }
            else {
                let currYear = vis.formatDateIntoYear(vis.date)
                let topSongId = vis.topSongs[currYear][0]["song_id"]
                source.src = vis.songDict[topSongId].spotify_track_preview_url
                let topSongName = vis.topSongs[currYear][0]["title"]
                let topSongArtist = vis.topSongs[currYear][0]["artist"]
                
                if (vis.songDict[topSongId].spotify_track_preview_url == "NA") {
                    document.getElementById("top-song-display").innerText = topSongName + " by " + topSongArtist + " (audio preview not available)";
                }
                else {
                    document.getElementById("top-song-display").innerText = topSongName + " by " + topSongArtist;
                }
                audio.load(); //call this to just preload the audio without playing
                audio.play();
                      
                vis.year = currYear
                button.text("Mute (Annual Top Song)");
            }
          }
       )

    }

    update(h) {
        let vis = this;
        // update position and text of label according to slider scale
        vis.handle.attr("cx", vis.x(h));
        vis.label
          .attr("x", vis.x(h))
          .text(vis.formatDate(h));
        
          let currYear = vis.formatDateIntoYear(h)

        let topSongName = vis.topSongs[currYear][0]["title"]
        let topSongArtist = vis.topSongs[currYear][0]["artist"]
        

        if (vis.songButton.text() == "Mute (Annual Top Song)") {
            var audio = document.getElementById('audio');
            var source = document.getElementById('audioSource');
            
            if (currYear != vis.year) {
                let topSongId = vis.topSongs[currYear][0]["song_id"]
                source.src = vis.songDict[topSongId].spotify_track_preview_url
                
                if (vis.songDict[topSongId].spotify_track_preview_url == "NA") {
                    document.getElementById("top-song-display").innerText = topSongName + " by " + topSongArtist + " (audio preview not available)";
                }
                else {
                    document.getElementById("top-song-display").innerText = topSongName + " by " + topSongArtist;
                    
                }
                audio.load(); //call this to just preload the audio without playing
                audio.play();
            }
            vis.year = currYear;
        }
        else {
            document.getElementById("top-song-display").innerText = topSongName + " by " + topSongArtist;
        }

        vis.date = h;
        vis.eventHandler.trigger("yearChanged", h);
      }
}
