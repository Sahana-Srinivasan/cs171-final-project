// Inspiration for play / pause animation code: https://bl.ocks.org/officeofjane/47d2b0bfeecfcb41d2212d06d095c763

class SahanaTimelineVis {

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

        this.updateVis(startDate);
    }

    updateVis(startDate) {
        let vis = this;

        // Set domain
        let endDate = d3.max(Object.keys(vis.weeklyDict), d => vis.parseDate(d));
        
        let fiveYearDate = d3. timeDay.offset(startDate, 1825);
        if (fiveYearDate < endDate) {
            endDate = fiveYearDate;
        }
        else {
            startDate = d3.timeDay.offset(endDate, -1825);
            console.log(startDate);
            console.log(endDate);
        }
        vis.x.domain([startDate, endDate]);

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


    }

    dateChange(h) {
        let startDate = h;

        let vis = this;

        // set the range of data we'll display
        let endDate = d3.max(Object.keys(vis.weeklyDict), d => vis.parseDate(d));
        
        let fiveYearDate = d3.timeDay.offset(startDate, 1825);
        if (fiveYearDate < endDate) {
            endDate = fiveYearDate;
        }
        else {
            startDate = d3.timeDay.offset(endDate, -1825);
        }

		// Filter data accordingly without changing the original data
		vis.filtered_data = vis.weeklyList.filter( value => {
			return (vis.parseDate(value.date) >= startDate &&
            vis.parseDate(value.date) <= endDate);
        });

		// Update the visualization
		vis.wrangleData(h);
    }
}
