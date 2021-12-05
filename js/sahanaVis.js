
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



    // Create event handler
    let eventHandler = {
        bind: (eventName, handler) => {
            document.body.addEventListener(eventName, handler);
        },
        trigger: (eventName, extraParameters) => {
            document.body.dispatchEvent(new CustomEvent(eventName, {
                detail: extraParameters
            }));
        }
    }

    attrsList.forEach((attr) => {
        graphList.push(new SahanaTimelineVis(attr + "-over-time", weeklyDict, weeklyList, attr));
    })

    let sliderVis = new SahanaSliderVis("slider-viz", weeklyDict, weeklyList, topSongsByYear, songDict, eventHandler);

    eventHandler.bind("timelineYearChanged", function(event){
        graphList.forEach((graph) => {
            graph.dateChange(event.detail);
        })
    });
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
