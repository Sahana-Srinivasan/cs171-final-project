
class YijiangGenreVis {

    constructor(_parentElement, _topHits) {
        this.parentElement = _parentElement;
        this.topHits = _topHits;
        this.data = [];
        this.displayData = [];

        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 50, right: 0, bottom: 50, left: 50};
        vis.padding = {top: 0, right: 0, bottom: 0, left: 0};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        // vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height  - vis.margin.top - vis.margin.bottom;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;
        console.log(vis.width, vis.height)
        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // add title
        vis.svg.append('g')
            .attr('class', `title bar-title`)
            .append('text')
            .attr('class', `bar-title-genre`)
            .text("TOP GENRES")
            .attr('transform', `translate(${vis.width / 2}, -10)`)
            .attr('text-anchor', 'middle');

        // Scales and axes
        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.3);

        vis.y = d3.scaleLinear()
            .range([vis.height,0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis");


        vis.wrangleData();

    }

    wrangleData(){
        let vis = this;
        vis.data = [];

        vis.genreData = new Map();
        vis.topHits.forEach((d,i) => {
            let genreString = d.spotify_genre.replace(/'/g, '"');
            if ((genreString != "NA") && (genreString != "[]")) {
                let genres = JSON.parse(genreString);
                genres.forEach((d,i) => {
                    if (vis.genreData.has(d)) {
                        vis.genreData.set(d, vis.genreData.get(d) + 1);
                    } else {
                        vis.genreData.set(d, 1);
                    }
                })
            }
        })
        console.log("genreData", vis.genreData)
        vis.genreData.forEach((v,k) => {
            vis.data.push(
                {
                    genre: k,
                    count: v
                }
            )
        })


        vis.data.sort((a,b) => d3.descending(a.count, b.count));
        console.log(vis.data)
        vis.displayData = vis.data.slice(0,10);
        console.log("displayData", vis.displayData)

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        vis.y.domain([0, vis.displayData[0].count]);
        vis.x.domain(vis.displayData.map(function(d) { return d.genre; }))

        vis.y.domain([0, d3.max(vis.displayData, d => d.count)]);
        vis.x.domain(vis.displayData.map(d => d.genre))


        // draw the bars and labels
        let bars = vis.svg.selectAll(".bars")
            .data(vis.displayData);


        // draw the bars
        vis.bars = vis.svg.selectAll(".bars")
            .data(vis.displayData);


        vis.bars.enter()
            .append("rect")
            .attr("class", "bars")
            .merge(vis.bars)
            .transition()
            .duration(500)
            .attr("fill", "green")
            .attr("x", d => vis.x(d.genre))
            .attr("y", d => vis.y(d.count))
            .attr("width", vis.x.bandwidth())
            .attr("height",  d => vis.height - vis.y(d.count))

        console.log("done");


        // Update the axis and title
        vis.svg.select(".y-axis").transition()
            .duration(500)
            .call(vis.yAxis);
        vis.svg.select(".x-axis").transition()
            .duration(500)
            .call(vis.xAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");

    }

}

