// Function to convert date objects to strings or reverse
dateFormatter = d3.timeFormat("%Y-%m-%d");
dateParser = d3.timeParse("%m/%d/%Y");


// (1) Load data with promises

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
        if (d.week_position == "1") {

            topHits.push(
                {
                    index: i,
                    song_id: d.song_id,
                    acousticness: songData[d.song_id].acousticness,
                    energy: songData[d.song_id].energy,
                    speechiness: songData[d.song_id].speechiness,
                    instrumentalness: songData[d.song_id].instrumentalness,
                    liveness: songData[d.song_id].liveness,
                    valence: songData[d.song_id].valence,
                    spotify_genre: songData[d.song_id].spotify_genre
                }
            )
        }
    })
    console.log("topHits", topHits);

    let yijiangGenreViz = new YijiangGenreVis("genreVis", topHits);

}
