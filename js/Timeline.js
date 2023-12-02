/***
 * A class representing a timeline view for all of the papers in the database
 * Based on this D3 example: https://observablehq.com/@tezzutezzu/world-history-timeline
 * https://d3-graph-gallery.com/graph/lollipop_cleveland.html
 * 
 * For some reason a lot of styling has to happen in CSS or it won't take effect for
 * divs and scrolling.
 */
class Timeline {
    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState;

        this.WIDTH = 1000;
        this.HEIGHT = 400;
        this.TOTAL_HEIGHT = 7000;
        this.MARGINS = {top: 10, bottom: 30, left: 320, right: 30};

        // Uncomment if we want to grab new data instead of using current data set
        // this.getAllPaperDateRanges();

        // this.init();

        this.drawTimeline();
    }

    async init()
    {
        await fetch('./Data/noDateRangeNewspapers.json')
            .then((response) => response.json())
            .then((json) => {
                this.noDateRangeNewspapersJson = json;
            })
            .catch((error) => {
                console.error('Error fetching JSON:', error);
            });
        
        await fetch('./Data/allPapersDateRanges.json')
            .then((response) => response.json())
            .then((json) => {
                this.allPapersDateRangesJson = json;
             //   console.log('this.allPapersDateRangesJson',this.allPapersDateRangesJson);
            })
            .catch((error) => {
                console.error('Error fetching JSON:', error);
            });
    }


    drawTimeline() {
        data = this.globalApplicationState.allPapersCountCityDates;
    
        // Get the minimum date and the maximum date
        let xMin = d3.min(this.globalApplicationState.allPapersCountCityDates, (d) => d.startDate);
        let xMax = d3.max(this.globalApplicationState.allPapersCountCityDates, (d) => d.endDate);

        // Create scales
        // xScale is a chronological scale
        let xScale = d3.scaleTime([new Date(xMin), new Date(xMax)], [0, this.WIDTH - this.MARGINS.right - this.MARGINS.left]);//.nice();
        // yScale is a categorical scale for the newspapers
        let yScale = d3.scaleBand().range([ 0, this.TOTAL_HEIGHT ]).domain(data.map(function(d) { return d.paper; }));
        
        let stationaryTimelineDiv = d3.select('#newspaper-timeline-div');

        // Create the svg containing the horizontal axis
        let stationaryTimelineSvg = stationaryTimelineDiv.append('svg')
            .attr('id', 'stationary-timeline-svg')
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("z-index", 1)
            .append('g')
            .attr('id', 'stationary-timeline-group')
            .attr('transform', `translate(${this.MARGINS.left}, ${this.MARGINS.top})`);

        // Make the vertically scrollable svg which has the vertical axis
        // https://observablehq.com/@d3/pannable-chart
        let verticalScrollDiv = d3.select('#newspaper-timeline-div')
            .append('div')
            .attr('id', 'vertical-scroll-timeline-div')
            .attr('transform', `translate(0, ${this.MARGINS.top})`);
        let verticalScrollSvg = verticalScrollDiv.append('svg')
            .attr('id', 'vertical-scroll-timeline-svg')
            .attr('width', this.WIDTH)
            .attr('height', this.TOTAL_HEIGHT)
            .style("display", "block");

        // Create axes
        // The yAxis
        verticalScrollSvg.append('g')
            .call(d3.axisLeft(yScale).tickSizeOuter(0))
            .attr('id', 'timeline-yAxis')
            .attr('transform', `translate(${this.MARGINS.left}, 0)`);
        // An xAxis for the bottom
        stationaryTimelineSvg.append('g')
            .call(d3.axisBottom(xScale))
            .attr('transform', `translate(0, ${this.HEIGHT})`)
            .attr('id', 'timeline-xAxis-bottom');
        // An xAxis for the top
        stationaryTimelineSvg.append('g')
            .call(d3.axisTop(xScale))
            .attr('transform', `translate(0, ${this.MARGINS.top})`)
            .attr('id', 'timeline-xAxis-top');

        // Add a hover effect tooltip 
        let tooltip = d3.select(verticalScrollSvg.name)
            .append('div')
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .text('test');

        // Add lines for data
        let lineGroup = verticalScrollSvg.append('g').attr('id', 'line-group');
        lineGroup.selectAll("myline")
            .data(data)
            .enter()
            .append('line')
            .attr("x1", function(d) { return xScale(new Date(d.startDate)); })
            .attr("x2", function(d) { return xScale(new Date(d.endDate)); })
            .attr("y1", function(d) { return yScale(d.paper); })
            .attr("y2", function(d) { return yScale(d.paper); })
            .attr('id', function(d) { return `${d.paper}-line` })
            .attr('transform', `translate(${this.MARGINS.left}, ${yScale.bandwidth()})`)
            // .attr('fill', 'black')
            .attr("stroke", "red")
            .attr("stroke-width", "3px")
            // https://d3-graph-gallery.com/graph/interactivity_tooltip.html
            .on('mouseover', function(d) {
                console.log('hovered over line for:', d.srcElement.__data__.paper);
                d3.select('#timeline-highlighted-paper-name')
                    .text(`Highlighted Newspaper: ${d.srcElement.__data__.paper}`);
                d3.select('#timeline-highlighted-paper-city')
                    .text(`Location: ${d.srcElement.__data__.city}`);
                d3.select('#timeline-highlighted-paper-startDate')
                    .text(`First date in UDN Archive: ${new Date(d.srcElement.__data__.startDate).toISOString().split('T')[0]}`);
                d3.select('#timeline-highlighted-paper-endDate')
                    .text(`Last date in UDN Archive: ${new Date(d.srcElement.__data__.endDate).toISOString().split('T')[0]}`);
                d3.select('#timeline-highlighted-paper-count')
                    .text(`Number of papers in UDN Archive: ${d.srcElement.__data__.count}`);
            })
            .on("mousemove", function(){return tooltip.style("top", (event.pageY-800)+"px").style("left",(event.pageX-800)+"px");})
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
            // .attr('overflow-y-', 'scroll');

        d3.select('#timeline-yAxis')
            .selectAll('.tick')
                .on('mouseover', console.log('hovered over:', this.text));
                // (event) => {
                //     const mousePosition = d3.pointer(event);



            
    }


    // Gets all the date ranges for all papers. Uses an API call, but the data is stored, so don't use this.
    getAllPaperDateRanges() {
        let allPaperDateRanges = new Object();
        let undefinedPapers = [];
        
        for (let i = 0; i < this.globalApplicationState.allNewspaperCountsWithLocationData.length; i++) {
            let currentPaper = this.globalApplicationState.allNewspaperCountsWithLocationData[i].paper;
            NewspaperUtils.getPublishDateRangeForPaper(currentPaper)
            .then((Object) => {
                if (Object !== undefined) {
                    allPaperDateRanges[currentPaper] = Object;
                }
                else {
                    // add undefined papers to array for sorting
                    undefinedPapers.push(currentPaper);
                }
            });
        }
    }

    // Converts string formatted dates to Date formatted dates
    convertDateStringToDate() {
        let convertedObject = new Object();
        // console.log('allPapersDateRangesJson:',this.allPapersDateRangesJson);
        for (let element in this.allPapersDateRangesJson) {
            let startDate = new Date(this.allPapersDateRangesJson[element].startDate);
            let endDate = new Date(this.allPapersDateRangesJson[element].endDate);
            convertedObject[element] = { startDate, endDate };
        }
        // console.log('convertedObject:', convertedObject);
        // console.log('test get year...', convertedObject['Ahora Utah'].startDate.getFullYear());
    }
}