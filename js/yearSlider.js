class YearSlider {

    // constructor method to initialize Timeline object
    constructor(parentElement, _min, _max, _eventHandler) {
        this.parentElement = parentElement;
        this.range = [_min, _max + 1];
        this.eventHandler = _eventHandler;


        // call initVis method
        this.initVis()
    }


    initVis() {
        let vis = this;

        vis.margin = {top: 0, right: 30, bottom: 15, left: 30};
        vis.padding = {top: 0, right: 0, bottom: 0, left: 0};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        console.log(vis.width, vis.height)
        // SVG drawing area
        vis.svgOrig = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
        vis.svg = vis.svgOrig
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales and axes
        vis.x = d3.scaleLinear()
            .domain(vis.range)
            .range([0, vis.width]);

        // draw background lines
        vis.svg.append('g').selectAll('line')
            .data(d3.range(vis.range[0], vis.range[1] + 1))
            .enter()
            .append('line')
            .attr('x1', d => vis.x(d)).attr('x2', d => vis.x(d))
            .attr('y1', 0).attr('y2', vis.height)
            .style('stroke', 'white')


        // labels
        vis.labelL = vis.svg.append("text")
            .attr("id", "labelleft")
            .attr("x", 0)
            .attr("y", vis.height + 5)
            .text(vis.range[0])
            .attr("fill", "white")

        vis.labelR = vis.svg.append("text")
            .attr("id", "labelright")
            .attr("x", 0)
            .attr("y", vis.height + 5)
            .text(vis.range[1])
            .attr("fill", "white")

        vis.wrangleData();

    }

    // wrangleData method
    wrangleData() {
        let vis = this;

        vis.updateVis();

    }

    // updateVis method
    updateVis() {
        let vis = this;

        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on('brush', function (event) {
                let s = event.selection;
                // update and move labels
                vis.labelL.attr('x', s[0])
                    .text(Math.round(vis.x.invert(s[0])))
                vis.labelR.attr('x', s[1])
                    .text(Math.round(vis.x.invert(s[1])) - 1)
                // move brush handles
                vis.handle.attr("display", null).attr("transform", function (d, i) {
                    return "translate(" + [s[i], -vis.height / 4] + ")";
                });
                // update view
                // if the view should only be updated after brushing is over,
                // move these two lines into the on('end') part below
                // vis.svgOrig.node().value = s.map(d => Math.round(x.invert(d)));
                vis.eventHandler.trigger("yearChanged", vis.getRange());
            })
            .on('end', function (event) {
                if (!event.sourceEvent) return;
                var d0 = event.selection.map(vis.x.invert);
                var d1 = d0.map(Math.round)
                d3.select(this).transition().call(event.target.move, d1.map(vis.x))
            })

        // append brush to g
        vis.brushGroup = vis.svg.append("g")
            .attr("class", "brush")
            .call(vis.brush)

        // add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
        var brushResizePath = function (d) {
            var e = +(d.type == "e"),
                x = e ? 1 : -1,
                y = vis.height / 2;
            return "M" + (.5 * x) + "," + 6 + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y) + "V" + (2 * y) +
                "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z";
        }

        vis.handle = vis.brushGroup.selectAll(".handle--custom")
            .data([{type: "w"}, {type: "e"}])
            .enter()
            .append("circle")
            .attr("class", "handle--custom")
            .attr("r", vis.height/4)
            .attr("cy", vis.height *3/4)
            .attr("fill", colors[9])
            .attr("cursor", "ew-resize")
            // .attr("d", brushResizePath);

        // override default behaviour - clicking outside of the selected area
        // will select a small piece there rather than deselecting everything
        // https://bl.ocks.org/mbostock/6498000
        vis.brushGroup.selectAll(".overlay")
            .each(function (d) {
                d.type = "selection";
            })
            .on("mousedown touchstart", brushcentered)

        function brushcentered() {
            var dx = x(1) - x(0), // Use a fixed width when recentering.
                cx = d3.mouse(this)[0],
                x0 = cx - dx / 2,
                x1 = cx + dx / 2;
            d3.select(this.parentNode).call(vis.brush.move, x1 > vis.width ? [vis.width - dx, vis.width] : x0 < 0 ? [0, dx] : [x0, x1]);
        }

        // select entire range
        vis.brushGroup.call(vis.brush.move, vis.range.map(vis.x))

        return vis.svgOrig.node();


    }

    getRange() {
        let vis = this;
        return d3.brushSelection(vis.brushGroup.node()).map(d => Math.round(vis.x.invert(d)));
    }

}