// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%m/%d/%Y");
let artistProfileName = document.getElementById("artist-profile-name");
let topTenArtists = [];
let artistProfile;


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

    console.log(data);


    // (4) Create visualization instances
    let saraBarChart = new SaraBarChartVis("bar-chart", hotStuff, billboard, audio);
    artistProfile = new ArtistProfileVis("artist-top-songs", hotStuff, billboard, audio);
    // let sahanaVis = new SahanaVis("sahana-id-name", hotStuff, billboard, audio);
    // let yijiangViz = new YijiangVis("yijiang-id-name", hotStuff, billboard, audio);
}

function displayArtistProfile(){
    // update artist profile visualization
    // artistProfile.wrangleData();

}