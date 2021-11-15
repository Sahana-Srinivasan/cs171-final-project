
class SahanaVis {

    constructor(_parentElement, _hotStuff, _billboard, _audio) {
        this.parentElement = _parentElement;
        this.hotStuff = _hotStuff;
        this.billboard = _billboard;
        this.audio = _audio;

        this.initVis();
    }

    initVis() {
        let vis = this;

        console.log("h, sahana");

		vis.margin = {top: 0, right: 40, bottom: 30, left: 100};
		vis.padding = {top: 30, right: 0, bottom: 0, left: 0};

		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height  - vis.margin.top - vis.margin.bottom;

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
            
        // Date parser
        vis.formatDate = d3.timeFormat("%Y");
        vis.parseDate= d3.timeParse("%m/%d/%Y")

        // Scales
        vis.x = d3.scaleTime()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        // Initialize axis components
        vis.xAxis = d3.axisBottom().scale(vis.x);
        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");
        vis.yAxis = d3.axisLeft().scale(vis.y);
        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis");

        this.wrangleData();

        console.log(vis.hotStuff);

        console.log(vis.billboard);
        console.log(vis.audio);

    }

    wrangleData() {
        let vis = this;

        // create a dict of songs, with keys being songIds and values being all the relevant attrs
        vis.songDict = {}
        vis.audio.forEach((song) => {
            if (!vis.songDict.hasOwnProperty(song.song_id)) {
                vis.songDict[song.song_id] = song;
            }
        })

        vis.attrsList = ["acousticness", "danceability", "energy", "instrumentalness", "liveness", "loudness", "tempo"];
        vis.weeklyDict = {}
        vis.billboard.forEach((entry) => {
            if (vis.weeklyDict.hasOwnProperty(entry.week_id)) {
                if (vis.songDict.hasOwnProperty(entry.song_id)) {
                    vis.attrsList.forEach((attr) => {
                        let attrVal = vis.songDict[entry.song_id][attr];
                        if (!isNaN(attrVal)) {
                            //console.log(attrVal);
                            vis.weeklyDict[entry.week_id][attr] += attrVal;
                            let attrCount = attr + "Count";
                            vis.weeklyDict[entry.week_id][attrCount] += 1;
                        }
                    })
                    //console.log("a")
                } 
            }
            else {
                if (vis.songDict.hasOwnProperty(entry.song_id)) {
                    vis.weeklyDict[entry.week_id] = {}
                    vis.attrsList.forEach((attr) => {
                        let attrVal = vis.songDict[entry.song_id][attr];
                        if (!isNaN(attrVal)) {
                            //console.log(attrVal);
                            vis.weeklyDict[entry.week_id][attr] = attrVal;
                            let attrCount = attr + "Count";
                            vis.weeklyDict[entry.week_id][attrCount] = 1;
                        }
                    })
                }
            }
        })

        console.log(vis.weeklyDict); // main dataset to display

        vis.weeklyList = []
        Object.keys(vis.weeklyDict).forEach((entry) => {
            let listEntry = vis.weeklyDict[entry];
            listEntry["date"] = entry;
            vis.weeklyList.push(listEntry);
        })
        console.log(vis.weeklyList);

        this.updateVis();

    }

    updateVis() {
        let vis = this;

        // Set the x domain

        // Set the y domain
        let startDate = d3.min(Object.keys(vis.weeklyDict), d => vis.parseDate(d));
        let endDate = d3.max(Object.keys(vis.weeklyDict), d => vis.parseDate(d));
        vis.x.domain([startDate, endDate]);

        // Set y domain based on selected attribute
        let attrWideMax = -1;
        let attrWideMin = 1;
    
        vis.attrsList.forEach((attr) => {
            let localMax = d3.max(vis.weeklyList, d => d[attr]);
            let localMin = d3.min(vis.weeklyList, d => d[attr]);
            if (localMax > attrWideMax) {
                attrWideMax = localMax;
            }
            if (localMin < attrWideMin) {
                attrWideMin = localMin;
            }
        })

        vis.y.domain([attrWideMin, attrWideMax]);

        // bind line to data
        var line = vis.svg.selectAll(".line")
		    .data([vis.weeklyList]);

        // line update - NOT SHOWING UP (NAN somwhere??)
        line
            .enter()
            .append("path")
            .attr("class","line")
            .merge(line)
            .attr("d", d3.line()
                .x(function(d) { 
                    if (!isNaN(d.acousticness)) {
                        console.log(vis.parseDate(d.date))
                        console.log(vis.x(vis.parseDate((d.date))))
                        return vis.x(vis.parseDate(d.date)); 
                    }
                })
                .y(function(d) {
                    if (!isNaN(d.acousticness)) {
                        console.log(vis.y(d.acousticness));
                        return vis.y(d.acousticness); 
                    }
                }))
            //("none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2.5);

        // axes
        vis.svg.select(".y-axis")
            .call(vis.yAxis);
        vis.svg.select(".x-axis")
            .call(vis.xAxis);

        // hover on the line --> displays attribute name

    }
}
