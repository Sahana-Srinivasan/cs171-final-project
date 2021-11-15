
class SaraBarChartVis {

    constructor(_parentElement, _hotStuff, _billboard, _audio) {
        this.parentElement = _parentElement;
        this.hotStuff = _hotStuff;
        this.billboard = _billboard;
        this.audio = _audio;
        this.displayData = [];

        this.initVis();
    }

    initVis(){
        let vis = this;

		vis.margin = {top: 0, right: 40, bottom: 30, left: 100};
		vis.padding = {top: 30, right: 0, bottom: 0, left: 0};

		vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
		vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height  - vis.margin.top - vis.margin.bottom;

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.y = d3.scaleBand()
            .range([vis.height, 0]);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "y-axis axis")

        vis.wrangleData();

    }

    wrangleData(){
        let vis = this;

        vis.hotStuff.forEach(d => {
            if(d.Year === 2000){ // change when you can adjust year
            }
        })


    }

}
