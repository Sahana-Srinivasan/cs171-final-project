class MatrixVis {

    // constructor method to initialize Timeline object
    constructor(parentElement, familyData, businessData, marriageData) {
        this.parentElement = parentElement;
        this.displayData = [];
        this.familyData = familyData;
        this.businessData = businessData;
        this.marriageData = marriageData;
        this.selectedCategory = "name"

        this.businessColor = "#FFBF77"
        this.marriageColor = "#819CD8"
        this.noColor = "#CCCCCC";

        // call initVis method
        this.initVis()
    }

    initVis() {
        let vis = this;

        // margin conventions
        vis.margin = {top: 100, right: 100, bottom: 100, left: 100};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        vis.cellPadding = d3.min([vis.height / 55, vis.width / 55]);
        vis.cellHeight = vis.cellPadding * 2;
        vis.cellWidth = vis.cellHeight;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        // make marriage legend
        vis.marriageLegend = vis.svg
            .append("g")
            .attr("class", "marriage-legend");
        vis.marriageLegend
            .append("rect")
            .attr("width", vis.cellWidth / 2)
            .attr("height", vis.cellHeight / 2)
            .attr("fill", vis.marriageColor);
        vis.marriageLegend
            .append("text")
            .text("Marriage")
            .attr("x", vis.cellWidth )
            .attr("y", vis.cellHeight / 2);

        vis.marriageLegend
            .attr("transform", `translate(${17 * vis.cellWidth + 16 * vis.cellPadding}, 0)`)

        // make business legend
        vis.businessLegend = vis.svg
            .append("g")
            .attr("class", "marriage-legend");
        vis.businessLegend
            .append("rect")
            .attr("width", vis.cellWidth / 2)
            .attr("height", vis.cellHeight / 2)
            .attr("fill", vis.businessColor);
        vis.businessLegend
            .append("text")
            .text("Business Tie")
            .attr("x", vis.cellWidth )
            .attr("y", vis.cellHeight / 2);

        vis.businessLegend
            .attr("transform", `translate(${17 * vis.cellWidth + 16 * vis.cellPadding}, ${vis.cellHeight + vis.cellPadding})`)

        // call next method in pipeline
        this.wrangleData();
    }

    // wrangleData method
    wrangleData() {
        let vis = this

        vis.displayData = []

        vis.familyData.forEach((d,i) => {
            let businessValues = vis.businessData[i];
            let marriageValues = vis.marriageData[i];

            // populate the final data structure
            vis.displayData.push(
                {
                    index: i,
                    name: d.Family,
                    allRelations: d3.sum(businessValues) + d3.sum(marriageValues),
                    businessTies: d3.sum(businessValues),
                    businessValues: businessValues,
                    marriages: d3.sum(marriageValues),
                    marriageValues: marriageValues,
                    numberPriorates: d.Priorates,
                    wealth: d.Wealth
                }
            )
        })

        console.log("Final unsorted data", vis.displayData)


        vis.displayData.sort( (a,b) => d3.ascending(a[vis.selectedCategory], b[vis.selectedCategory]));

        console.log("Final sorted data", vis.displayData)

        vis.updateVis();

    }

    // updateVis method
    updateVis() {
        let vis = this;

        // make column labels - these don't change
        vis.svg.selectAll(".y-label")
            .data(vis.displayData)
            .enter()
            .append("g")
            .attr("class", "y-label")
            .append("text")
            .text(d => d.name)
            .attr("x", vis.cellPadding)
            .attr("y", (d,i) => vis.cellWidth + i * (vis.cellPadding + vis.cellWidth))
            .attr("transform", "rotate(-90)")


        // make the rows
        vis.rows = vis.svg.selectAll(".matrix-row")
            .data(vis.displayData, d => d.name);

        vis.rows = vis.rows
            .enter()
            .append("g")
            .attr("class", "matrix-row")
            .merge(vis.rows);

        // remove old labels
        vis.rows.selectAll(".x-labels").remove()
        vis.rows
            .append("text")
            .attr("class", "x-labels")
            .style("text-anchor", "end")
            .text(d => d.name)
            .attr("x", -vis.cellPadding)
            .attr("y", vis.cellHeight)


        console.log("Made rows")

        // draw a rectangle for each row business (theres a weird gap if i draw two triangles)
        vis.cellsBusiness = vis.rows.selectAll(".matrix-cell-business")
            .data(d=>d.businessValues);

        vis.cellsBusiness.enter()
            .append("rect")
            .attr("class", "matrix-cell-business")
            .merge(vis.cellsBusiness)
            .attr("width", vis.cellWidth)
            .attr("height", vis.cellHeight)
            .attr('x', (d,i) => i * (vis.cellPadding + vis.cellWidth))
            .attr("y", 0)
            .attr("fill", d => {
                if (d == 1) {
                    return vis.businessColor;
                } else {
                    return vis.noColor;
                }
            });

        // draw a triangle for each row marriage
        vis.cellsMarriage = vis.rows.selectAll(".matrix-cell-marriages")
            .data(d=>d.marriageValues);
        vis.cellsMarriage
            .enter()
            .append("path")
            .attr("class", "matrix-cell-marriages")
            .merge(vis.cellsMarriage)
            .attr("d", function(d, index) {
                // Shift the triangles on the x-axis (columns)
                let x = (vis.cellWidth + vis.cellPadding) * index;
                let y = 0;
                return 'M ' + x +' '+ y + ' l ' + vis.cellWidth + ' 0 l 0 ' + vis.cellHeight + ' z';
            })
            .attr("fill", d => {
                if (d == 1) {
                    return vis.marriageColor;
                } else {
                    return vis.noColor;
                }
            });


        vis.rows
            .style("fill-opacity", 0.25)
            .transition()
            .duration(700)
            .style("fill-opacity", 1)
            .attr('transform', (d,i) => `translate(0, ${i * (vis.cellPadding + vis.cellWidth)})`);


        console.log("Made cells")
    }
}