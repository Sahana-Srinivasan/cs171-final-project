
class SahanaVis {

    constructor(_parentElement, _weeklyDict, _weeklyList, _attr) {
        this.parentElement = _parentElement;
        this.weeklyDict = _weeklyDict;
        this.weeklyList = _weeklyList;
        this.attr = _attr;

        this.initVis();
    }

    initVis() {
        let vis = this;

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

    }

    wrangleData() {
        let vis = this;

        // filter and sort data based on the chosen attribute 
        vis.filtered_data = vis.weeklyList.filter((value) => {
            return !isNaN(value[vis.attr])
        });

        vis.filtered_data.sort(function(x, y){
            return d3.ascending(vis.parseDate(x.date), vis.parseDate(y.date));
        })

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
        let attrMin = d3.min(vis.weeklyList, d => d[vis.attr]);
        let attrMax = d3.max(vis.weeklyList, d => d[vis.attr]);

        vis.y.domain([attrMin, attrMax]);

    
        var linegraph = vis.svg.append("path")
            .attr("class", "line");
            

        var line = d3.line()
                .x(function(d, index) { 
                    if (!isNaN(d[vis.attr])) {
                        return vis.x(vis.parseDate(d.date)); 
                    }
                    else {
                        return 0;
                    }
                })
                .y(function(d, index) {
                    if (!isNaN(d[vis.attr])) {
                        return vis.y(d[vis.attr]); 
                    }
                    else {
                        return 0;
                    }
                })
                .curve(d3.curveLinear);

        linegraph.attr("d", line(vis.filtered_data))
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2.5)
                .attr("fill", "none");

        // axes
        vis.svg.select(".y-axis")
            .call(vis.yAxis);
        vis.svg.select(".x-axis")
            .call(vis.xAxis);

        console.log("finished updating viz");

        // hover on the line --> displays attribute name

    }
}

let promises = [
    d3.csv("data/hot_stuff.csv", row => {
        row["Peak Position"] = +row["Peak Position"];
        row["Previous Week Position"] = +row["Previous Week Position"];
        row["Week Position"] = +row["Week Position"];
        row["WeekID"] = dateParser(row["WeekID"]);
        row["Year"] = +d3.timeFormat("%Y")(row["WeekID"]);
        row["Weeks on Chart"] = +row["Weeks on Chart"];
        return row;
    }),
    d3.csv("data/billboard.csv"), // seems to be the same as hot stuff so not editing for now
    d3.csv("data/audio_features.csv", row => {
        row["acousticness"] = +row["acousticness"];
        row["danceability"] = +row["danceability"];
        row["energy"] = +row["energy"];
        row["instrumentalness"] = +row["instrumentalness"];
        row["key"] = +row["key"];
        row["liveness"] = +row["liveness"];
        row["loudness"] = +row["loudness"];
        row["mode"] = +row["mode"];
        row["speechiness"] = +row["speechiness"];
        row["spotify_track_duration_ms"] = +row["spotify_track_duration_ms"];
        row["spotify_track_popularity"] = +row["spotify_track_popularity"];
        row["tempo"] = +row["tempo"];
        row["time_signature"] = +row["time_signature"];
        row["valence"] = +row["valence"];
        return row;
    })
];

dateFormatter = d3.timeFormat("%Y-%m-%d");
dateParser = d3.timeParse("%m/%d/%Y");
let desiredAttrs = [""]

Promise.all(promises)
    .then(function (data) {
        createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function createVis(data) {
    let hotStuff = data[0]
    let billboard = data[1]
    let audio = data[2]

    let attrsList = ["acousticness", "danceability", "energy", "instrumentalness", "loudness", "tempo"];
    let weeklyDict = preProcess(billboard, audio, attrsList);
    let weeklyList = dictToList(weeklyDict, attrsList);
    console.log("weekly list");
    console.log(weeklyList);
    console.log("weekly Dict");
    console.log(weeklyDict)



    attrsList.forEach((attr) => {
        let vis = new SahanaVis(attr + "-over-time", weeklyDict, weeklyList, attr);
    })

    //let sahanaVis = new SahanaVis("attr-over-time", hotStuff, billboard, audio);
}

function dictToList(weeklyDict, attrsList) {
    let weeklyList = []
    Object.keys(weeklyDict).forEach((entry) => {
        let listEntry = weeklyDict[entry];
        listEntry["date"] = entry;
        attrsList.forEach((attr) => {
            listEntry[attr] = listEntry[attr] / listEntry[attr + "Count"];
        })
        weeklyList.push(listEntry);
    })

    return weeklyList;
}

function preProcess(billboard, audio, attrsList) {
    // create a dict of songs, with keys being songIds and values being all the relevant attrs
    let songDict = {}
    audio.forEach((song) => {
        if (!songDict.hasOwnProperty(song.song_id)) {
            songDict[song.song_id] = song;
        }
    })

    let weeklyDict = {}
    billboard.forEach((entry) => {
        if (weeklyDict.hasOwnProperty(entry.week_id)) {
            if (songDict.hasOwnProperty(entry.song_id)) {
                attrsList.forEach((attr) => {
                    let attrVal = songDict[entry.song_id][attr];
                    if (!isNaN(attrVal)) {
                        //console.log(attrVal);
                        weeklyDict[entry.week_id][attr] += attrVal;
                        let attrCount = attr + "Count";
                        weeklyDict[entry.week_id][attrCount] += 1;
                    }
                })
                //console.log("a")
            } 
        }
        else {
            if (songDict.hasOwnProperty(entry.song_id)) {
                weeklyDict[entry.week_id] = {}
                attrsList.forEach((attr) => {
                    let attrVal = songDict[entry.song_id][attr];
                    if (!isNaN(attrVal)) {
                        //console.log(attrVal);
                        weeklyDict[entry.week_id][attr] = attrVal;
                        let attrCount = attr + "Count";
                        weeklyDict[entry.week_id][attrCount] = 1;
                    }
                })
            }
        }
    })

    return weeklyDict;

}
