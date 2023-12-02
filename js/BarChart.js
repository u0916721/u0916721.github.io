class Barchart
{

    constructor()
    {

    }
/**
 * 
  * @param {*} data data {x1,y1}
 * @param {*} divID id of div
 * @param {*} barID id of bar
 * @param {*} xAxisID id of x axis
 * @param {*} yAxisID id of y axis
 * @param {*} xLable 
 * @param {*} yLable 
 * @param {*} title 
 */
  drawBarChartGeneric(data,divID,barID,xAxisID,yAxisID,xLable = "papers",yLable = "publications",title="Newspapers found in your request") {


  
    d3.select("#" + divID)
    .append("text")
    .attr("y", 10)
    .attr("x", 450)
    .style('font-size', '18px')  // Adjust font size as needed
    .text(title);


    let chart = d3.select("#" + divID)
                            .append("svg")
                            .attr("id",divID + "chart")
                            .attr("padding", "20px")
                            .attr("width", COUNT_CHART_WIDTH + COUNT_CHART_PADDING.left + COUNT_CHART_PADDING.right)
                            .attr("height", COUNT_CHART_HEIGHT + COUNT_CHART_PADDING.top + COUNT_CHART_PADDING.bottom + 100);
     chart.append("g").classed("newspaper-count-chart", true).attr("id", barID);
     chart.append("g").classed("newspaper-count-chart", true).attr("id", xAxisID);
     chart.append("g").classed("newspaper-count-chart", true).attr("id", yAxisID);
     chart.append("g").classed("newspaper-count-chart", true).attr("id", "labels");
  
    // Define the x and y scales
    let xScale = d3.scaleBand()
                    .domain(data.map(d => d.x1))
                    .range([0, COUNT_CHART_WIDTH - COUNT_CHART_PADDING.right - COUNT_CHART_PADDING.left])
                    .padding(.2);
    let yScale = d3.scaleLinear()
                    .domain([d3.max(data, d => d.y1), 0])
                    .range([0, COUNT_CHART_HEIGHT - COUNT_CHART_PADDING.bottom - COUNT_CHART_PADDING.top])
                    .nice(); 
  
    // Draw the x- and y-axes
    this.drawAxisGenericAlt(chart,xScale, yScale,xAxisID,yAxisID,xLable,yLable,divID +"chart");
  
    // Draw the bars
    this.drawBarsGeneric(chart, data, xScale, yScale,barID);
  }

  /**
 * A function that draws the x- and y-axes of the newspaper count chart
 * @param {*} xScale 
 * @param {*} yScale 
  */
  drawAxisGenericAlt(chart,xScale, yScale,xAxisID,yAxisID,xLable = "papers",yLable = "publications",divID)
{
  let xAxis = d3.axisBottom();
  xAxis.scale(xScale);
  let yAxis = d3.axisLeft();
  yAxis.scale(yScale);

  chart.select("#" + xAxisID)
    .attr("transform", "translate(" + COUNT_CHART_PADDING.left + ", " + (COUNT_CHART_HEIGHT - COUNT_CHART_PADDING.bottom) + ")")
    .transition()
    .duration(1000)
    .call(xAxis)
    .selectAll("text")
      .attr("id", "xAxis-label-" + xAxisID)
      .attr("transform", `translate(${-COUNT_CHART_PADDING.right + (xScale.bandwidth() / 2)},5)rotate(-60)`)
      .style("text-anchor", "end");
      // Rotating and anchoring labels
      // https://d3-graph-gallery.com/graph/barplot_basic.html


  chart.select("#" + yAxisID)
    .attr("transform", "translate(" + COUNT_CHART_PADDING.left + ", " + COUNT_CHART_PADDING.top + ")")
    .transition()
    .duration(1000)
    .call(yAxis)
    .selectAll("text")
      .attr("id", "YAxis-label-" + yAxisID);

      d3.select("#" + divID).append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 10)
    .attr("x", -200)
    .attr("dy", ".95em")
    .attr("transform", "rotate(-90)")
    .text(yLable);

    d3.select("#" + divID)
  .append('text')
  .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", 520)
    .attr("y", 550)
  .style('font-size', '18px')  // Adjust font size as needed
  .text(xLable);
     
}

/**
 * A function that draws the bars of the newspaper count bar chart
 * @param {*} newspaperCountChartBarGroup 
 * @param {*} data 
 * @param {*} xScale 
 * @param {*} yScale 
  */
 drawBarsGeneric(chart, data, xScale, yScale,barID)
{
  let bars = chart.selectAll("#" + barID)
    .data(data,d => d);

  bars.join("rect")
    .classed("newspaper-count-bar", true)
    .transition()
    .duration(1000)
    .attr("x", function(d) { return xScale(d.x1) })
    .attr("y", function(d) { return yScale(d.y1) })
    .attr("width", xScale.bandwidth())
    .attr("height", function(d) {
      return (COUNT_CHART_HEIGHT - COUNT_CHART_PADDING.top - COUNT_CHART_PADDING.bottom) - yScale(d.y1);
    })
    .attr("transform", d => `translate(${COUNT_CHART_PADDING.left}, ${COUNT_CHART_PADDING.top})`);
}


}
