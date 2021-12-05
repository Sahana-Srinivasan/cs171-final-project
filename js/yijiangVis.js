// Function to convert date objects to strings or reverse
dateFormatter = d3.timeFormat("%Y-%m-%d");
dateParser = d3.timeParse("%m/%d/%Y");

// // color palette
// let yijiang_colors = ["#7A533E", "#AD785C", "#CB997E", "#DDBEA9",
//               "#D9C3AD", "#BFB49D", "#A5A58D", "#6B705C",
//               "#3F4238", "#20211C"];

let yijiangGenreViz, yijiangMatrixViz, yijiangAttrViz, yijiangYearSlider;

// (1) Load data with promises

let yijiang_promises = [
    d3.csv("data/billboard.csv", row => {
        row["instance"] = +row["instance"];
        row["peak_position"] = +row["peak_position"];
        row["previous_week_position"] = +row["previous_week_position"];
        row["week_position"] = +row["week_position"];
        row["week_id"] = dateParser(row["week_id"]);
        row["year"] = +d3.timeFormat("%Y")(row["week_id"]);
        row["weeks_on_chart"] = +row["weeks_on_chart"];
        return row;
    }),
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

Promise.all(yijiang_promises)
    .then(function (data) {
        yijiang_createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function yijiang_createVis(data) {
    let billboard = data[0]
    let audio = data[1]

    console.log("billboard", billboard);
    console.log("audio", audio);

    // some data cleaning
    let songData = {};
    audio.forEach((d,i) => {
        songData[d.song_id] = d;
    });

    // first get list of number one hits
    let topHits = [];
    billboard.forEach((d,i) => {
        topHits.push(
            {
                index: i,
                song_id: d.song_id,
                week_position: d.week_position,
                year: d.year,
                acousticness: (songData[d.song_id] == undefined) || isNaN(songData[d.song_id].acousticness) ? -1 : songData[d.song_id].acousticness,
                energy: (songData[d.song_id] == undefined) || isNaN(songData[d.song_id].energy) ? -1 : songData[d.song_id].energy,
                speechiness: (songData[d.song_id] == undefined) || isNaN(songData[d.song_id].speechiness) ? -1 : songData[d.song_id].speechiness,
                instrumentalness: (songData[d.song_id] == undefined) || isNaN(songData[d.song_id].instrumentalness) ? -1 : songData[d.song_id].instrumentalness,
                liveness: (songData[d.song_id] == undefined) || isNaN(songData[d.song_id].liveness) ? -1 : songData[d.song_id].liveness,
                valence: (songData[d.song_id] == undefined) || isNaN(songData[d.song_id].valence) ? -1 : songData[d.song_id].valence,
                danceability: (songData[d.song_id] == undefined) || isNaN(songData[d.song_id].danceability) ? -1 : songData[d.song_id].danceability,
                spotify_genre: (songData[d.song_id] == undefined) ? "[]" : songData[d.song_id].spotify_genre
            }
        )
    })
    console.log("topHits", topHits);

    let years = topHits.map(d => d.year);
    console.log("here", topHits.filter(function (d) {
        return (d.year == 2021)
    }))
    console.log(d3.min(years))
    console.log(d3.max(years))

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

    yijiangGenreViz = new YijiangGenreVis("genreVis", topHits);
    yijiangMatrixViz = new YijiangMatrixVis("matrixVis", topHits);
    yijiangAttrViz = new YijiangAttrVis("attrVis", topHits);
    console.log("hello")
    yijiangYearSlider = new YearSlider("yijiang-yearSlider", 1965, 2021, eventHandler);




    // *** TO-DO ***
    eventHandler.bind("yearChanged", function(event){
        console.log("yearChanged", event.detail);
        yijiangGenreViz.yearRange = event.detail;
        yijiangMatrixViz.yearRange = event.detail;
        yijiangAttrViz.yearRange = event.detail;
        yijiangGenreViz.wrangleData();
        yijiangMatrixViz.wrangleData();
        yijiangAttrViz.wrangleData();
    });

}

function genreCategoryChange() {
    console.log("yijiang was here");
    selectedCategory =  document.getElementById('genreCategorySelector').value;
    console.log(+selectedCategory);

    yijiangMatrixViz.selectedCategory = +selectedCategory;
    yijiangGenreViz.wrangleData();
    yijiangMatrixViz.wrangleData();
    yijiangAttrViz.wrangleData();
}

function lMatrixChange() {

    selectedCategory =  document.getElementById('lMatrixSelector').value;
    console.log(selectedCategory);

    yijiangMatrixViz.selectedCategory1 = selectedCategory;
    yijiangMatrixViz.wrangleData();
}
function rMatrixChange() {

    selectedCategory =  document.getElementById('rMatrixSelector').value;
    console.log(selectedCategory);

    yijiangMatrixViz.selectedCategory2 = selectedCategory;
    yijiangMatrixViz.wrangleData();
}