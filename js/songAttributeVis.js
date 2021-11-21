

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

        vis.margin = {top: 0, right: 40, bottom: 30, left: 10};
        vis.padding = {top: 30, right: 0, bottom: 0, left: 0};

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
            .range([vis.height-50, 50]);

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
        vis.displayData = [];
        // compute average across all the top songs for the artist
        console.log("wrangling datain song attributes");
        vis.attributes = new Map();
        let songList;
        topTenArtists.forEach(d => {
            if(d.artist === artistProfileName.innerText){
                // obtain top hit song id list of the chosen artist
                songList = d.songs;
            }
        })

        // iterate through each song id
        songList.forEach(songID => {
            // iterate through each attribute we need
            vis.attrList.forEach(attr => {
                let attrNum = 0;
                if(vis.attributes.has(attr)){
                    attrNum = vis.attributes.get(attr);
                }
                attrNum += vis.audio.get(songID)[attr];
                vis.attributes.set(attr, attrNum);
            })
        })
        console.log(vis.attributes);

        // convert attribute data into list
        vis.attrList.forEach(attr => {
            let data = vis.attributes.get(attr)/songList.length;
            vis.displayData.push({attr, data});
        })

        console.log(vis.displayData);
        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        let rect = vis.svg.selectAll("rect")
            .data(vis.displayData);

        rect.enter().append("rect")
            .attr("class", "bars")
            .merge(rect)
            .attr("x", d => vis.x(d.attr))
            .attr("y", d => {
                console.log(d.data);
                console.log(vis.y(d.data));
                return vis.height - vis.y(d.data);
            })
            .attr("rx", 6)
            .attr("width", vis.x.bandwidth())
            .attr("height", d => vis.y(d.data))
            .attr("fill", "#fec5bb");

        rect.exit().remove();

        // Update the y-axis
        vis.svg.select(".x-axis").call(vis.xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)");
    }
}