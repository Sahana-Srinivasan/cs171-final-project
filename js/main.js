// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");


// (1) Load data with promises

let promises = [
    d3.csv("data/hot_stuff.csv"),
    d3.csv("data/billboard.csv"),
    d3.csv("data/audio_features.csv")
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

    console.log("hi");


    // (4) Create visualization instances
    // let saraVis = new SaraVis("sara-id-name", hotStuff, billboard, audio);
    // let sahanaVis = new SahanaVis("sahana-id-name", hotStuff, billboard, audio);
    // let yijiangViz = new YijiangVis("yijiang-id-name", hotStuff, billboard, audio);
}
