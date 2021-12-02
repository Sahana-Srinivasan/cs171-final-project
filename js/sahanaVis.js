let colors = ["#7A533E", "#AD785C", "#CB997E", "#DDBEA9",
              "#FFE8D6", "#D4C7B0", "#A5A58D", "#6B705C",
              "#3F4238", "#20211C"];

let colors_dict = {
    "acousticness": "#7A533E",
    "danceability": "#CB997E",
    "energy": "#DDBEA9",
    "instrumentalness": "#A5A58D",
    "tempo": "#3F4238"
}

// Create a sleep function to time the way the lines/circles update
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// Inspiration for play / pause animation code: https://bl.ocks.org/officeofjane/47d2b0bfeecfcb41d2212d06d095c763

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

		vis.margin = {top: 0, right: 40, bottom: 30, left: 175};
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


        vis.svg.append("text")
        .attr("class", "y label")
        .attr("x", -vis.margin.left)
        .attr("y", vis.padding.top)
        .text(vis.attr);

        // Initialize axis components
        vis.xAxis = d3.axisBottom().scale(vis.x);
        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");
        vis.yAxis = d3.axisLeft().scale(vis.y).ticks(4);
        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis");

         // Set y domain based on selected attribute
         let attrMin = d3.min(vis.weeklyList, d => d[vis.attr]);
         let attrMax = d3.max(vis.weeklyList, d => d[vis.attr]);
 
         vis.y.domain([attrMin, attrMax]);

        // Label for graph on the left column
        //vis.yAxisGroup.append("text").attr("class", "graph-label").text(vis.attr);

        //console.log("init graph");

       
        vis.filtered_data = vis.weeklyList.filter((value) => {
            return !isNaN(value[vis.attr])
        });
        

        let startDate = d3.min(Object.keys(vis.weeklyDict), d => vis.parseDate(d));
        this.wrangleData(startDate);


    }

    wrangleData(startDate) {
        let vis = this;

        vis.filtered_data = vis.filtered_data.filter((value) => {
            return !isNaN(value[vis.attr])
        });

        vis.filtered_data.sort(function(x, y){
            return d3.ascending(vis.parseDate(x.date), vis.parseDate(y.date));
        })

        //console.log("graph wrangled");
        this.updateVis(startDate);

    }

    updateVis(startDate) {
        let vis = this;

        // Set the x domain

        // Set the y domain
        //let startDate = d3.min(Object.keys(vis.weeklyDict), d => vis.parseDate(d));
        let endDate = d3.max(Object.keys(vis.weeklyDict), d => vis.parseDate(d));
        
        let threeYearDate = d3. timeDay.offset(startDate, 1825);
        if (threeYearDate < endDate) {
            endDate = threeYearDate;
        }
        vis.x.domain([startDate, endDate]);
        //console.log(startDate,endDate);
        //console.log(int(vis.formatDate(startDate)) + 2);

    

    

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


        var linegraph = vis.svg.selectAll(".line").data([vis.filtered_data]);

        linegraph
                .enter()
                .append("path")
                .attr("class", "line")
                .merge(linegraph)
                .transition()
                .duration(40)
                .attr("d", d3.line()
                    .x(function(d) { 
                        if (!isNaN(d[vis.attr])) {
                            return vis.x(vis.parseDate(d.date)); 
                        }
                        else {
                            return 0;
                        }
                    })
                    .y(function(d) {
                        if (!isNaN(d[vis.attr])) {
                            return vis.y(d[vis.attr]); 
                        }
                        else {
                            return 0;
                        }
                })
                )
                //.data(vis.filtered_data)
                .attr("stroke", colors_dict[vis.attr])
                .attr("stroke-width", 2)
                .attr("fill", "none");


        // axes
        vis.svg.select(".y-axis").transition().duration(500)
            .call(vis.yAxis);
        vis.svg.select(".x-axis").transition().duration(40)
            .call(vis.xAxis);

        //console.log("finished updating viz");

        // hover on the line --> displays attribute name

    }

    dateChange(h) {
        //console.log(h);

        let vis = this;

        let endDate = d3.max(Object.keys(vis.weeklyDict), d => vis.parseDate(d));
        
        let threeYearDate = d3.timeDay.offset(h, 1825);
        if (threeYearDate < endDate) {
            endDate = threeYearDate;
        }

		// Filter data accordingly without changing the original data
		vis.filtered_data = vis.weeklyList.filter( value => {
			return (vis.parseDate(value.date) >= h &&
            vis.parseDate(value.date) <= endDate);
        });
        
        //console.log(vis.filtered_data);

        //console.log("date changed");
		// Update the visualization
		vis.wrangleData(h);
    }
}


class SliderVis {

    constructor(_parentElement, _weeklyDict, _weeklyList, _topSongs, _songDict) {
        this.parentElement = _parentElement;
        this.weeklyDict = _weeklyDict;
        this.weeklyList = _weeklyList;
        this.topSongs = _topSongs;
        this.songDict = _songDict;

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
                vis.currentValue = vis.currentValue + (vis.targetValue/2051);
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
                //if (currYear != vis.year) {
                    let topSongId = vis.topSongs[currYear][0]["song_id"]
                    source.src = vis.songDict[topSongId].spotify_track_preview_url
                
                    audio.load(); //call this to just preload the audio without playing
                    audio.play();
                //}
                
                vis.year = currYear
                button.text("Mute (Annual Top Song)");
            }
           // generate a random song


            // let currYear = vis.formatDateIntoYear(vis.date)
            // let topSongId = vis.topSongs[currYear][0]["song_id"]
            // source.src = vis.songDict[topSongId].spotify_track_preview_url
        
            // audio.load(); //call this to just preload the audio without playing
            // audio.play(); //call this to play the song right away

            // var source = document.getElementById('song-here');
            // source.src = vis.weeklyList[randInt].spotify_track_preview_url;
            // console.log(vis.weeklyList[randInt]);
            // console.log(source.src)
        //    //let randInt = Math.floor(Math.random() * vis.weeklyList.length);
        //    d3.select("#song-here").attr("src", vis.weeklyList[randInt].spotify_track_preview_url)
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

        if (vis.songButton.text() == "Mute (Annual Top Song)") {
            var audio = document.getElementById('audio');
            var source = document.getElementById('audioSource');
            
            let currYear = vis.formatDateIntoYear(h)
            if (currYear != vis.year) {
                let topSongId = vis.topSongs[currYear][0]["song_id"]
                source.src = vis.songDict[topSongId].spotify_track_preview_url
                console.log(source.src);
            
                audio.load(); //call this to just preload the audio without playing
                audio.play();
            }
            vis.year = currYear;
            
            //button.text("Mute (Annual Top Song)");
        }

        //console.log("update");
        vis.date = h;
        dateSlide(h);
      }

      

}

function dateSlide(h) {
    graphList.forEach((graph) => {
        graph.dateChange(h);
    })
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
let graphList = []


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
    console.log(data);

    // create a dict of songs, with keys being songIds and values being all the relevant attrs
    let songDict = {}
    audio.forEach((song) => {
        if (!songDict.hasOwnProperty(song.song_id)) {
            songDict[song.song_id] = song;
        }
    })

    let attrsList = ["acousticness", "danceability", "energy", "instrumentalness", "tempo"];
    let weeklyDict = preProcess(billboard, attrsList, songDict);
    let weeklyList = dictToList(weeklyDict, attrsList);
    let topSongsByYear = topSongsAnnual(hotStuff, weeklyDict);
    console.log("weekly list");
    console.log(weeklyList);
    console.log("weekly Dict");
    console.log(weeklyDict)

    attrsList.forEach((attr) => {
        graphList.push(new SahanaVis(attr + "-over-time", weeklyDict, weeklyList, attr));
    })

    let sliderVis = new SliderVis("slider-viz", weeklyDict, weeklyList, topSongsByYear, songDict);

    //let sahanaVis = new SahanaVis("attr-over-time", hotStuff, billboard, audio);
}

function dictToList(weeklyDict, attrsList) {
    let weeklyList = []
    Object.keys(weeklyDict).forEach((entry) => {
        let listEntry = weeklyDict[entry];
        listEntry["date"] = entry;
        //listEntry["spotify_track_preview_url"] = listEtnry
        attrsList.forEach((attr) => {
            listEntry[attr] = listEntry[attr] / listEntry[attr + "Count"];
        })
        weeklyList.push(listEntry);
    })

    return weeklyList;
}

function preProcess(billboard, attrsList, songDict) {

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
                //weeklyDict[entry.week_id]["spotify_track_preview_url"] = songDict[entry.song_id]["spotify_track_preview_url"]
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

function topSongsAnnual(hotStuff, weeklyDict) {
    let formatDate = d3.timeFormat("%Y");
    let parseDate= d3.timeParse("%m/%d/%Y")

    let startDate = d3.min(Object.keys(weeklyDict), d => parseDate(d));
    let endDate = d3.max(Object.keys(weeklyDict), d => parseDate(d));

    let year = formatDate(startDate);
    let endYear = formatDate(endDate);
    console.log(year, endYear)

    let annualDict = {}

    console.log(hotStuff);
    console.log(weeklyDict);

    hotStuff.forEach((entry) => {
        if (annualDict.hasOwnProperty(entry.Year)) {
            if (annualDict[entry.Year].hasOwnProperty(entry.SongID)) {
                annualDict[entry.Year][entry.SongID]["position"] += (100 - entry["Week Position"])
            }
            else {
                annualDict[entry.Year][entry.SongID] = {}
                annualDict[entry.Year][entry.SongID]["position"] = (100 - entry["Week Position"])
                annualDict[entry.Year][entry.SongID]["title"] = entry.Song;
                annualDict[entry.Year][entry.SongID]["artist"] = entry.Performer;
            }
        }
        else {
            annualDict[entry.Year] = {}
            annualDict[entry.Year][entry.SongID] = {}
            annualDict[entry.Year][entry.SongID]["position"] = (100 - entry["Week Position"])
            annualDict[entry.Year][entry.SongID]["title"] = entry.Song;
            annualDict[entry.Year][entry.SongID]["artist"] = entry.Performer;
        }
    })


    let dictOfLists = {}

    Object.keys(annualDict).forEach((year) => {
        let annualList = []
        Object.keys(annualDict[year]).forEach((song) => {
            annualDict[year][song]["song_id"] = song;
            annualList.push(annualDict[year][song])
        })
        annualList.sort(function(x, y){
            return d3.descending(x["position"], y["position"]);
        })
        dictOfLists[year] = annualList;
    })

    console.log(dictOfLists);

    return dictOfLists;
}




