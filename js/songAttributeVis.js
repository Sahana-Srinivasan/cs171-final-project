

class SongAttributeVis {
    constructor(_parentElement, _hotStuff, _audio) {
        this.parentElement = _parentElement;
        this.hotStuff = _hotStuff;
        this.audio = _audio;
        this.displayData = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 0, right: 40, bottom: 110, left: 10};
        vis.padding = {top: 10, right: 0, bottom: 0, left: 0};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.attrList = ["acousticness", "danceability", "energy", "instrumentalness", "liveness"]

        vis.x = d3.scaleBand()
            .domain(vis.attrList)
            .range([vis.width/4, vis.width*3/4])
            .paddingInner(0.8);

        vis.y = d3.scaleLinear()
            .domain([0,1])
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .tickSize(0);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", `translate(0,${vis.height})`)

        if (artistProfileName.innerText != "") vis.wrangleData();

    }
    wrangleData(){
        let vis = this;
        document.getElementById("song-attributes").style.visibility = "visible";
        let type = document.getElementById("song-selection").innerText;
        vis.displayData = [];
        // compute average across all the top songs for the artist
        vis.attributes = new Map();
        let songList;

        topTenArtists.forEach(d => {
            if(d.artist === artistProfileName.innerText){
                // obtain top hit song id list of the chosen artist
                songList = d.songs;
            }
        })

        let totSongs = 0;

        // iterate through each song id
        songList.forEach(songID => {
            if(vis.audio.get(songID).song === type || type === "ALL") {
                let attribute;
                totSongs = 0;
                // iterate through each attribute we need
                vis.attrList.forEach(attr => {
                    let data = [0,0];
                    let attrNum = 0;
                    attribute = attr;
                    if (vis.attributes.has(attr)) {
                        data = vis.attributes.get(attr);
                    }
                    if(!isNaN(vis.audio.get(songID)[attr])) {
                        data[0] += vis.audio.get(songID)[attr];
                        if(attr == "energy") console.log(vis.audio.get(songID)[attr]);
                        data[1]++;
                    }
                    vis.attributes.set(attr, data);
                })
            }
        })

        // convert attribute data into list
        vis.attrList.forEach(attr => {
            let data = vis.attributes.get(attr);
            let avg = data[0]/data[1];
            vis.displayData.push({attr, avg});
        })

        console.log(vis.displayData);

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        let rect = vis.svg.selectAll(".bars")
            .data(vis.displayData);

        rect.enter().append("rect")
            .attr("class", "bars")
            .merge(rect)
            .transition().duration(500)
            .attr("x", d => vis.x(d.attr))
            .attr("y", d => {
                let height = vis.y(d.avg);
                if(isNaN(height)) height = 0;
                return height;
            })
            .attr("rx", 6)
            .attr("width", vis.x.bandwidth())
            .attr("height", d => {
                console.log(vis.y(d.avg))
                if(isNaN(d.avg)) return vis.height - vis.y(0);
                return vis.height - vis.y(d.avg)
            })
            .attr("fill", "#AD785C");

        rect.exit().remove();

        let outline = vis.svg.selectAll(".outline")
            .data(vis.displayData);

        outline.enter().append("rect")
            .attr("class", "outline")
            .attr("x", d => vis.x(d.attr))
            .attr("y", d => {
                return vis.height - vis.y(0);
            })
            .attr("rx", 6)
            .attr("width", vis.x.bandwidth())
            .attr("height", vis.y(0))
            .attr("fill", "transparent")
            .attr("stroke", "black");


        // Update the y-axis
        vis.svg.select(".x-axis").call(vis.xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)");
    }
}