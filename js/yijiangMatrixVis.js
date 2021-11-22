class YijiangMatrixVis {

    // constructor method to initialize Timeline object
    constructor(parentElement, _topHits) {
        this.parentElement = parentElement;
        this.displayData = [];
        this.data = [];
        this.topHitsTrue = _topHits;
        this.topHits = _topHits;
        this.selectedCategory = 1;
        this.selectedCategory1 = "energy"
        this.selectedCategory2 = "danceability"


        // call initVis method
        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 50, right: 50, bottom: 100, left: 50};
        vis.padding = {top: 50, right: 0, bottom: 50, left: 50};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height  - vis.margin.top - vis.margin.bottom;
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
            .attr('class', `title matrix-title`)
            .append('text')
            .attr('class', `matrix-title-categories`)
            .text("DANCEABILITY vs ENERGY")
            .attr('transform', `translate(${vis.width / 2}, -20)`)
            .attr('text-anchor', 'middle');

        // Scales and axes
        vis.x = d3.scaleLinear()
            .nice()
            .domain([0,1])
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .nice()
            .domain([0,1])
            .range([vis.height,0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.cellHeight = vis.y(0.9);
        vis.cellWidth = vis.x(0.1);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "x-axis-label")
            .append("text")
            .text("danceability")
            .style("text-anchor", "middle")
            .attr("transform", `translate(-40,${vis.height/2})rotate(-90)`);


        vis.svg.append("g")
            .attr("class", "y-axis-label")
            .append("text")
            .text("energy")
            .style("text-anchor", "middle")
            .attr("transform", `translate(${vis.width/2},${vis.height + 40})`);

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis");


        vis.colors = d3.scaleLinear()
            .range(["#ffffff", colors[7]]);

        vis.wrangleData();

    }

    // wrangleData method
    wrangleData() {
        let vis = this



        vis.topHits = vis.topHitsTrue.filter((d,i) => {return d.week_position <= vis.selectedCategory});
        vis.data = [];

        // Reformat the data: d3.rectbin() needs a specific format
        vis.topHits.forEach(function(d) {
            if ((d[vis.selectedCategory1] > -1) && (d[vis.selectedCategory2] > -1)) {
                vis.data.push([+d[vis.selectedCategory1], +d[vis.selectedCategory2]])
            }
        })
        console.log("data", vis.data)
        vis.displayData = [];
        d3.range(0,10).forEach((d) => {
            vis.displayData.push(
                {
                    i: d/10,
                    counts: Array(10).fill(0)
                }
            )
        })
        vis.data.forEach((d,i) => {
            let row = Math.floor(d[0] * 10);
            let col = Math.floor(d[1] * 10);
            vis.displayData[row].counts[col] += 1;
        })
        console.log("displayData", vis.displayData);

        vis.updateVis();

    }

    // updateVis method
    updateVis() {
        let vis = this;

        let maxCount = d3.max(vis.displayData.map(d => d3.max(d.counts)));
        console.log("maxCount", maxCount);

        vis.colors
            .domain([0, maxCount])


        // make the rows
        vis.rows = vis.svg.selectAll(".matrix-row")
            .data(vis.displayData, d => d.i);

        vis.rows = vis.rows
            .enter()
            .append("g")
            .attr("class", "matrix-row")
            .merge(vis.rows);


        console.log("Made rows")

        // draw a rectangle for each row business (theres a weird gap if i draw two triangles)
        vis.cellsBusiness = vis.rows.selectAll(".matrix-cell-business")
            .data(d=>d.counts);

        vis.cellsBusiness.enter()
            .append("rect")
            .attr("class", "matrix-cell-business")
            .merge(vis.cellsBusiness)
            .attr("width", vis.cellWidth)
            .attr("height", vis.cellHeight)
            .attr('x', (d,i) => i * (vis.cellWidth))
            .attr("y", 0)
            .attr("fill", d => {
                return vis.colors(d);
            });


        vis.rows
            .style("fill-opacity", 0.25)
            .transition()
            .duration(700)
            .style("fill-opacity", 1)
            .attr('transform', (d,i) => `translate(0, ${i * ( vis.cellHeight)})`);

        // Update the axis and title
        vis.svg.select(".y-axis").transition()
            .duration(500)
            .call(vis.yAxis);
        vis.svg.select(".x-axis").transition()
            .duration(500)
            .call(vis.xAxis);


    }
}