const CHART_PADDING = 10;
const CHART_WIDTH = 500;
const CHART_HEIGHT = 250;
const LINE_CHART_HEIGHT = 500;
const LINE_CHART_WIDTH = 700;
const LINE_CHART_PADDING = 50;
const COUNT_CHART_PADDING = { left: 75, bottom: 80, top: 20, right: 20 };
const COUNT_CHART_HEIGHT = 400;
const COUNT_CHART_WIDTH = 1000;

// State management
const globalApplicationState = {
  selectedLocations: [],
  countyMapData: null,
  stateBoundaryData: null,
  cityAndTownData: null,
  allNewspaperCountsWithLocationData: null,
  allPapersDateRanges: null,
  noDateRangeNewspapers: null,
  allPapersCountCityDates: null,
  utahMap: null,
  countyPaperCount: null,
  newspaperTimeline: null,
  lineChart: null,
  dateStart: null,
  sets: null,
  increment: null,
  publications: null,
  useStopWords: false,
  useStopWordsUIValue: null,
  selectedPaper : "All Papers",
  barChartDrawFunction : null
};

button = document.getElementById('lineButton');

button.addEventListener('click', async function() {
 // Hiding the button
 this.style.display = 'none';

  let sets = parseInt(document.getElementById('setTotal').value);
  let words = document.getElementById('wordInput').value.toLowerCase().split(',');
  let dateStart = document.getElementById('dateInput').value;
  let increment = parseInt(document.getElementById('dateIncrement').value);
  let selectedPaper = document.getElementById('paperSelector').value;
  let loadingBar = document.getElementById('loadingWheel');
  let loadingText = document.getElementById('loadingText');
  globalApplicationState.useStopWords = document.getElementById("stopWords").checked;
  if(words.length > 10)
  {
    alert("To many words, please reduce");
    loadingBar.style.display = "none";
    loadingText.style.display = "none";
    this.style.display = 'block';
    return;
  }
  //Stupid work around for javascript dates and timezones
  const originalDate = new Date(dateStart);
  originalDate.setDate(originalDate.getDate() + 1);
  dateStart = d3.utcFormat('%Y-%m-%d')(originalDate);


  // We need to do some error checking here
  if(sets === '' || words === '' || dateStart === '' || increment === '')
  {
    this.style.display = "block";
    loadingBar.style.display = "none";
    loadingText.style.display = "none";
    return;
  }

  loadingBar.style.display = "block";
  loadingText.style.display = "block";
  loadingText.textContent = 'loading in ' + sets*15 + ' mb' + ' of newspaper data';


  let newDataGeneration = false;
  // Check to see if we need to make calls again
  if(increment != globalApplicationState.increment || dateStart != globalApplicationState.dateStart || sets != globalApplicationState.sets || globalApplicationState.useStopWordsUIValue != globalApplicationState.useStopWords)
  {
    globalApplicationState.increment = increment;
    globalApplicationState.dateStart = dateStart;
    globalApplicationState.sets = sets;
    globalApplicationState.useStopWordsUIValue = globalApplicationState.useStopWords;
    newDataGeneration = true;
  }
  // Clear our data before loading in again.
  globalApplicationState.lineChart.clearData();
  //words = ["wretched","soul"],dateStart ="1900-01-01",sets=3,increment=365, newDataSet=true
  await globalApplicationState.lineChart.generateLine(words,dateStart,sets,increment,newDataGeneration,selectedPaper);
  //Add barcharts for all the days the user requested
  //First we clear all of them
 
  //Next we starts adding to the div
 
  drawBarCharts(selectedPaper);
  
  // Show the button when loaded
  loadingBar.style.display = "none";
  loadingText.style.display = "none";
  this.style.display = 'block';
  console.log(globalApplicationState.publications);
});

function drawBarCharts(selectedPaper)
{
  console.log("called draw bar charts");
  let entries = globalApplicationState.publications.publications.keys();
  let wordsRecorded = 0;
  let paperWordsRecorded = 0;
  let publicationMap = new Map();
  d3.select("#additionalWordCharts")
  .selectAll("*")
  .remove();
  let barDiv = d3.select("#additionalWordCharts");
  for (let key of entries)
  {
    let publications = globalApplicationState.publications.publications.get(key).keys();
    for (let secondKey of publications) {
      // It O(N) either way even if I do publications.has(secondKey)
      if (selectedPaper === secondKey) 
      {
        let id = (secondKey + key).trim().replaceAll(" ", "");
        // Draw bar chart
        barDiv.append("div").attr("id","spacer").attr("class","px-4").attr("class","py-10");
        barDiv.append("div").attr("id",id).attr("class","px-4").attr("class","py-4").attr("class","py-4 px-4 bg-white rounded-lg");
        let publication = globalApplicationState.publications.publications.get(key).get(secondKey).wordFrequencyArray.slice(0,20);
        let barChart = new Barchart();
       // drawBarChartGeneric(paperCount,"Barchart-For-Line","barID","xAxis","yAxis","Newspaper Name","Total Publications");
        barChart.drawBarChartGeneric(publication,id,id + "barID", id +"xAxis",id +"yAxis","Words","Word Count", "Top ten most frequents words for " + id);
      }
    }
  }
}

 initData()

/**
 * Update the data according to document settings
 */
async function initData() {

  globalApplicationState.lineChart = new Line();

  let barChart = new Barchart();
}


// Basic Templete taken from d3 example galleries
//https://observablehq.com/@d3/bubble-chart/2?intent=fork
// but adapted to our needs
// data needs to have the following object format
// domain = x1 and range = y1 such that some object array
// [{x1: 'swag', y1:6969},{x1;'yummy', y1:4206969}]
async function drawBubbleChart(data,divID)
{

    // Specify the dimensions of the chart.
    const width = 928;
    const height = width;
    const margin = 1; // to avoid clipping the root circle stroke
    // Specify the number format for values.
    const format = d3.format(",d");
  
    // Create a categorical color scale.
    const color = d3.scaleOrdinal(d3.schemeTableau10);
  
    // Create the pack layout.
    const pack = d3.pack()
        .size([width - margin * 2, height - margin * 2])
        .padding(3);
  
    // Compute the hierarchy from the (flat) data; expose the values
    // for each node; lastly apply the pack layout.
    const root = pack(d3.hierarchy({children: data})
        .sum(d => d.y1));
  
    // Create the SVG container.
    const svg = d3.select("#" + divID).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-margin, -margin, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
        .attr("text-anchor", "middle");
  
    // Place each (leaf) node according to the layout’s x and y values.
    const node = svg.append("g")
      .selectAll()
      .data(root.leaves())
      .join("g")
        .attr("transform", d => `translate(${d.x},${d.y})`);
  
    //This is for the tool tip
    node.append("title")
        .text(d => `${d.data.x1}\n${format(d.data.y1)}`);
  
    // Add a filled circle.
    node.append("circle")
        .attr("fill-opacity", 0.7)
        .attr("fill", d => color(d.data))
        .attr("r", d => d.r);
  
    // Add a label.
    const text = node.append("text")
        .attr("clip-path", d => `circle(${d.r})`);
  
    // Add a tspan for each CamelCase-separated word.
    text.selectAll()
      .data(d => d)
      .join("tspan")
        .attr("x", 0)
        .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.35}em`)
        .text(d => d.data.x1);
  
    // Add a tspan for the node’s value.
    text.append("tspan")
        .attr("x", 0)
        .attr("y", d => `${0.90}em`)
        .attr("fill-opacity", 0.7)
        .text(d => format(d.value));
    return Object.assign(svg.node(), {scales: {color}});
}

async function drawBarChartGeneric(data,divID,barID,xAxisID,yAxisID) {

  let chart = d3.select("#" + divID)
                          .append("svg")
                          .attr("padding", "20px")
                          .attr("width", COUNT_CHART_WIDTH + COUNT_CHART_PADDING.left + COUNT_CHART_PADDING.right)
                          .attr("height", COUNT_CHART_HEIGHT + COUNT_CHART_PADDING.top + COUNT_CHART_PADDING.bottom);
  await chart.append("g").classed("newspaper-count-chart", true).attr("id", barID);
  await chart.append("g").classed("newspaper-count-chart", true).attr("id", xAxisID);
  await chart.append("g").classed("newspaper-count-chart", true).attr("id", yAxisID);

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
  drawAxisGeneric(chart,xScale, yScale,xAxisID,yAxisID);

  // Draw the bars
  drawBarsGeneric(chart, data, xScale, yScale,barID);
}

/**
 * A function that draws the x- and y-axes of the newspaper count chart
 * @param {*} xScale 
 * @param {*} yScale 
  */
function drawAxisGeneric(chart,xScale, yScale,xAxisID,yAxisID)
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
}

/**
 * A function that draws the bars of the newspaper count bar chart
 * @param {*} newspaperCountChartBarGroup 
 * @param {*} data 
 * @param {*} xScale 
 * @param {*} yScale 
  */
function drawBarsGeneric(chart, data, xScale, yScale,barID)
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



/**
 * A function that draws the x- and y-axes of the newspaper count chart
 * @param {*} xScale 
 * @param {*} yScale 
  */
function drawNewspaperCountAxes(xScale, yScale)
{
  let xAxis = d3.axisBottom();
  xAxis.scale(xScale);
  let yAxis = d3.axisLeft();
  yAxis.scale(yScale);

  this.newspaperCountChart.select("#newspaper-count-xAxis")
    .attr("transform", "translate(" + COUNT_CHART_PADDING.left + ", " + (COUNT_CHART_HEIGHT - COUNT_CHART_PADDING.bottom) + ")")
    .call(xAxis)
    .selectAll("text")
      .attr("id", "newspaper-count-xAxis-label")
      // Rotating and anchoring labels
      // https://d3-graph-gallery.com/graph/barplot_basic.html
      .attr("transform", `translate(${-COUNT_CHART_PADDING.right + (xScale.bandwidth() / 2)},5)rotate(-60)`)
      .style("text-anchor", "end")
      .on("mouseover", function (d, i) {
        let publicationCity = NewspaperUtils.findPaperPublicationCity(i, globalApplicationState.allNewspaperCountsWithLocationData);
        d3.select('#newspaper-count-location-text')
          .text(`Publication City/Town: ${publicationCity}    County: ${NewspaperUtils.findCountyGivenCity(publicationCity, globalApplicationState.cityAndTownData.features)} County`);
      })
      .on("mouseout", function (d) {
        d3.select('#newspaper-count-location-text')
          .text('Publication City/Town:     County:');
      })

  this.newspaperCountChart.select("#newspaper-count-yAxis")
    .attr("transform", "translate(" + COUNT_CHART_PADDING.left + ", " + COUNT_CHART_PADDING.top + ")")
    .transition()
    .duration(1000)
    .call(yAxis)
    .selectAll("text")
      .attr("id", "newspaper-count-xAxis-label");
}

/**
 * A function that draws the bars of the newspaper count bar chart
 * @param {*} newspaperCountChartBarGroup 
 * @param {*} data 
 * @param {*} xScale 
 * @param {*} yScale 
  */
function drawNewspaperCountDataBars(newspaperCountChartBarGroup, data, xScale, yScale)
{
  let bars = newspaperCountChartBarGroup.selectAll("#newspaper-count-data")
    .data(data, d => d.paper);

  bars.join("rect")
    .classed("newspaper-count-bar", true)
    .transition()
    .duration(1000)
    .attr("x", function(d) { return xScale(d.paper) })
    .attr("y", function(d) { return yScale(d.count) })
    .attr("width", xScale.bandwidth())
    .attr("height", function(d) {
      return (COUNT_CHART_HEIGHT - COUNT_CHART_PADDING.top - COUNT_CHART_PADDING.bottom) - yScale(d.count);
    })
    .attr("transform", d => `translate(${COUNT_CHART_PADDING.left}, ${COUNT_CHART_PADDING.top})`);
    // .on("mouseover", function (d, i) {
    //   d3.select(this)
    //     .classed("hovered", true);
    // })
    // .on("mouseout", function (d, i) {
    //   d3.select(this)
    //     .classed("hovered", false);
    // });
}
