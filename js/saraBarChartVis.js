
class SaraBarChartVis {

    constructor(_parentElement, _hotStuff) {
        this.parentElement = _parentElement;
        this.hotStuff = _hotStuff;
        this.colors = ["#7A533E", "#AD785C", "#CB997E", "#DDBEA9",
            "#FFE8D6", "#D4C7B0", "#A5A58D", "#6B705C",
            "#3F4238", "#20211C"];
        this.yearRange = [1965,2021]
        this.displayData = [];

        this.initVis();
    }

    initVis(){
        let vis = this;

		vis.margin = {top: 0, right: 40, bottom: 30, left: 130};
		vis.padding = {top: 30, right: 0, bottom: 0, left: 0};

		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height  - vis.margin.top - vis.margin.bottom;

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.colorScale = d3.scaleBand()
            .range(vis.colors);

        vis.x = d3.scaleLinear()
            .range([0, vis.width - 20]);

        vis.y = d3.scaleBand()
            .range([vis.padding.top, vis.height/1.3])
            .paddingInner(0.8);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y)
            .tickSize(0);

        vis.svg.append("g")
            .attr("class", "y-axis axis")

        vis.wrangleData();

    }

    wrangleData(){
        let vis = this;
        vis.displayData = [];
        vis.artistSongs = new Map();
        vis.songRank = new Map();

        vis.hotStuff.forEach(d => {
            if(d.Year >= vis.yearRange[0] && d.Year <= vis.yearRange[1]){ // change when you can adjust year
                let points = 0;
                if(vis.songRank.has(d.SongID)){
                    points = vis.songRank.get(d.SongID);
                }
                else {
                    let arr = [];
                    if (vis.artistSongs.has(d.Performer)){
                        arr = vis.artistSongs.get(d.Performer);
                    }
                    arr.push(d.SongID);
                    vis.artistSongs.set(d.Performer, arr);

                }
                points += 100 - d["Week Position"];
                vis.songRank.set(d.SongID, points);
            }
        })

        console.log(vis.artistSongs);
        console.log(vis.songRank);

        // iterate through artists to find their total rank
        // in the year weighted by ranking of their popular songs
        for(let artist of vis.artistSongs.keys()){
            let totalRank = 0;

            // iterate through each song
            vis.artistSongs.get(artist).forEach(song => {
                totalRank += vis.songRank.get(song);
            })
            vis.displayData.push({artist, totalRank});
        }

        vis.displayData = vis.displayData.sort((a,b) => {
            return b.totalRank - a.totalRank;
        })

        //console.log(vis.displayData);

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        vis.displayData = vis.displayData.slice(0,10);

        vis.displayData.forEach(d => {
            let artist = d.artist;
            let songs = vis.artistSongs.get(artist);
            songs = songs.sort((a,b) => {
                return vis.songRank.get(b)-vis.songRank.get(a);
            })
            topTenArtists.push({artist, songs});
        })

        vis.y.domain(vis.displayData.map(d => d.artist));
        vis.x.domain([0, d3.max(vis.displayData, d=> d.totalRank)]);
        vis.colorScale.domain([0, d3.max(vis.displayData, d=> d.totalRank)]);
        console.log(vis.x.domain());

        let rect = vis.svg.selectAll("rect")
            .data(vis.displayData);

        rect.enter().append("rect")
            .attr("class", "bars")
            .merge(rect)
            .transition().duration(500)
            .attr("x", 20)
            .attr("y", d => vis.y(d.artist))
            .attr("rx", 6)
            .attr("width", d => vis.x(d.totalRank))
            .attr("height", vis.y.bandwidth())
            .attr("fill", (d,i) => vis.colors[i]);

        rect.exit().remove();

        // Update the y-axis
        vis.svg.select(".y-axis").transition().duration(500).call(vis.yAxis);
        d3.selectAll(".tick text")
            .style("font-size", "1.25em")
            .on("mouseover", function(event, d) {
                d3.select(this).style("cursor", "pointer");
                d3.select(this).style("fill", "blue");
            })
            .on("mouseout", function(event ,d) {
                d3.select(this).style("cursor", "default");
                d3.select(this).style("fill", "black");
            })
            .on("click", function(event, d) {
                artistProfileName.innerHTML = d;
                document.getElementById("song-selection").innerText = "ALL";
                displayArtistProfile();
            });

    }

}

