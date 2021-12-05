// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%m/%d/%Y");
let artistProfileName = document.getElementById("artist-profile-name");
let topTenArtists = [];
let topTenArtistsAudio;
// color palette
let colors = ["#FFFFFF", "#FECBEC", "#FC96D9", "#FA57C1",
    "#D65FC7", "#B166CC", "#936CE6", "#7572FF",
    "#6F8CFC", "#69A6F9"];
let artistProfile, attributeVis, saraBarChart, yearSlider;


// (1) Load data with promises

let sara_promises = [
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

Promise.all(sara_promises)
    .then(function (data) {
        sara_createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function sara_createVis(data) {
    let hotStuff = data[0]
    let billboard = data[1]
    let audio = data[2]
    console.log(data);
    let audioMap = new Map();

    // changing audio to be a map from song id to the audio info
    audio.forEach((song) => {
        if (!audioMap.has(song.song_id)) {
            audioMap.set(song.song_id, song);
        }

    })
    console.log(audioMap);

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

    saraBarChart = new SaraBarChartVis("bar-chart", hotStuff);
    artistProfile = new ArtistProfileVis("artist-top-songs", hotStuff, audioMap);
    attributeVis = new SongAttributeVis("song-attributes", hotStuff, audioMap);
    yearSlider = new YearSlider("yearSlider", 1965, 2021, eventHandler);

    eventHandler.bind("yearChanged", function(event){
        console.log("yearChanged", event.detail);
        saraBarChart.yearRange = event.detail;
        changeTopTen();
    });

}

function displayArtistProfile(){
    // update artist profile visualization
    artistProfile.wrangleData();
    attributeVis.wrangleData()

}

function updateSongAttributes(){
    attributeVis.wrangleData();
}

function changeTopTen(){
    console.log("changing");
    saraBarChart.wrangleData();
}
