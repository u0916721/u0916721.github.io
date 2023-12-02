//Class for the line chart and all its drawing logic
// See
//https://www.geeksforgeeks.org/d3-js-selection-classed-function/
// Hover functions
function hoverLine()
{
  this.setAttribute('class','hovered');
  d3.select('#' + "circle-" + this.id.split('-')[1]).attr('font-size', '32px');
}

function hoverOutLine()
{
  d3.select(this).classed('hovered', false);
  d3.select(this).classed('lineStyle', true);
  d3.select('#' + "circle-" + this.id.split('-')[1]).attr('font-size', '16px');
}

function hoverText()
{
  d3.select(this).attr('font-size', '32px');
  d3.select('#' + "line" + "-" + this.id.split('-')[1]).attr('class','hovered');
}

function hoverOutText()
{
  d3.select(this).attr('font-size', '16px');
  d3.select('#' + "line" + "-" + this.id.split('-')[1]).classed('hovered', false);
  d3.select('#' + "line" + "-" + this.id.split('-')[1]).classed('lineStyle', true);
}
/**
 * This class reperesents a line chart
 */
class Line
{
    

    // color number 0 -> 9 determines the color of the lines
    // Currently this is also tied to the word array, so we need to limit the amound of lines to 9!
    colorNumber; 
    constructor()
    {
        this.colorNumber = 0;
        this.colors = d3.scaleQuantize()
        .domain([0,9])
        .range(["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]);
        this.barChart = new Barchart();
    }
countNotNull = (numV) => (isNaN(numV) || (typeof numV === 'undefined')) ? 0 : numV;
incrementcolorNumber()
{
    if(this.colorNumber === 9)
    {
        this.colorNumber = 0;
    }
    else
    {
        this.colorNumber = this.colorNumber + 1;
    }
}

/**
 * 
 * @param {*} words words the user wants lines of
 * @param {*} dateStart the starting date the user chose
 * @param {*} sets granualirity, how many data points does the user want
 * @param {*} increment day increments 
 * @param {*} newDataSet this determines if we are going to generate new data(call the api again)
 */
async generateLine(words = ["wretched","soul"],dateStart ="1900-01-01",sets=3,increment=365, newDataSet=true, paperName = "All Papers")
{


  let stopWords;
  let dict;
  // Load in analyisis tools
  await fetch('./utils/stopWords.json')
  .then((response) => response.json())
  .then((json) => {
    stopWords = json;
  })
  .catch((error) => {
    console.error('Error fetching JSON:', error);
  });

  await fetch('./utils/dictionary.json')
  .then((response) => response.json())
  .then((json) => {
    let temp = Object.keys(json);
    temp = temp.map((element) => element.toLowerCase());
    dict = new Set(temp);

  })
  .catch((error) => {
    console.error('Error fetching JSON:', error);
  });


  //This is our sample of data, this will be removed from the method soon and be put into its own method
  if(newDataSet) // This is the most expensive part of the application
  {
  let date = new Date(dateStart);
  this.currentPublications = new PublicationAnalysisTest(date,stopWords,dict);
   await this.currentPublications.generatePublicationDateRange(date,sets,increment);
  }

   // We can always create a date domain because it doesnt requre calculating the max
  let dateDomain = Array.from(this.currentPublications.publications.keys());
 
   dateDomain = dateDomain.map(e => d3.utcParse("%Y-%m-%d")(e));
   d3.select('#line-chart')
   .selectAll('text')
   .remove();
   this.addXAxis(dateDomain);

   // Our next step is to find the highest y value and graph all respective lines
   let lineArray = []; // Line array contains lines
   let maxYArray = []; // This is our max Y array.
   words.forEach(element => 
    {
      let temp = this.generateLinesToGraph(element,paperName);
      // Add the highest value to our max y array.
      maxYArray.push(d3.max(temp.map(e => this.countNotNull(e.count))));
      // Add the line to our line array
      lineArray.push(temp);
   })
 this.addYAxis(d3.max(maxYArray));
 // Draw lines for each line
 lineArray.forEach(e => this.drawLine(e,words));
// drawLine(sampleArray);
this.addQueeryInfo(paperName);
this.appendInfoBarChart();
}

//Given the publication generate information about what publications are seen and add what frequency.
appendInfoBarChart()
{
  let entries = globalApplicationState.publications.publications.keys();
  let wordsRecorded = 0;
  let paperWordsRecorded = 0;
  let publicationMap = new Map();

  for (let key of entries)
  {
    let publications = globalApplicationState.publications.publications.get(key).keys();
    for (let secondKey of publications) {
      if (!publicationMap.has(secondKey)) {
        publicationMap.set(secondKey, 1);
      }
      else 
      {
        publicationMap.set(secondKey, publicationMap.get(secondKey) + 1);
      }
    }
  }
  //Filter out all papers
  if(publicationMap.has("All Papers"))
  {
    publicationMap.delete("All Papers");
  }
  let paperCount = Array.from(publicationMap.entries(), ([k, v]) => ({ ['x1']: k, ['y1']: v }));
  paperCount.sort((a, b) => b.y1 - a.y1);
  d3.select("#Barchart-For-Line")
  .selectAll("*")
  .remove();
  this.barChart.drawBarChartGeneric(paperCount,"Barchart-For-Line","barID","xAxis","yAxis","Newspaper Name","Total Publications");
}

//Adds info about the queery such as word count and newspapers reperesented.
  addQueeryInfo(paperName = 'All Papers')
  {
    // This is a pointer to our publications object, unfortunate name, might change idk
    let entries = globalApplicationState.publications.publications.keys();
    let wordsRecorded = 0;
    let paperWordsRecorded = 0;
    for (let key of entries)
    {
      try{
      paperWordsRecorded = paperWordsRecorded + globalApplicationState.publications.publications.get(key).get(paperName).wordFrequencyArray.length;
      }
      catch(error)
      {

      }
      wordsRecorded = wordsRecorded + globalApplicationState.publications.publications.get(key).get('All Papers').wordFrequencyArray.length;
    }
    d3.select('#line-chart-info').append("text").attr("x", 30)
    .attr("y", 35)
    .attr('font-size', '16px')
    .text(d3.format(',')(wordsRecorded) + " words found for all papers.");
    if(paperName != "All Papers" && wordsRecorded !=0)
    {
    d3.select('#line-chart-info').append("text").attr("x", 30)
    .attr("y", 55)
    .attr('font-size', '16px')
    .text( d3.format(',')(paperWordsRecorded) + " words found for " + paperName);
    // See
    //https://stackoverflow.com/questions/17511614/half-filled-circle-with-d3-js
    let percent = (paperWordsRecorded/wordsRecorded) * 100;
    var r = 30;
    }
  }

  /**
   * Generates a line to graph
   * @param {*} wordToBeFound the word to be graph
   * @param {*} paperName the paperName
   * @returns 
   */
 generateLinesToGraph(wordToBeFound = "Olympic", paperName = "All Papers")
{
  let sampleArray = [];
  this.currentPublications.publications.forEach((_value, key) => {

    //Get the paper we want
    let count = 0;
    // Messy call, simplest apporach is just to wrap it in a try catch
    try {
      count = this.countNotNull(this.currentPublications.publications.get(key).get(paperName).wordFrequencyMap.get(wordToBeFound))
    } 
    catch (error) {
 
    }

    // Object schema {date: Date, count: int}
    // We can add some logic here that gets a specific paper
    let tempObject = { date: new Date(key + 'T00:00:00.000Z'), count: count };
    sampleArray.push(tempObject);
 });
 return sampleArray;

}

/**
 * Draws a line given a line group and words
 * @param {*} lineGroup the line group to draw
 * @param {*} words the words to draw
 */
 drawLine(lineGroup,words)
{
  //https://observablehq.com/@d3/sequential-scales
  //Just using the max to determine the color will perserve if we want to add multiple lines
  const lineGenerator = d3.line()
  .x((d, i) => this.xScale(d.date) + LINE_CHART_PADDING)
  .y((d, i) => this.yScale(this.countNotNull(d.count)) - LINE_CHART_PADDING);
  d3.select('#lines')
  .append('path') 
  .datum(lineGroup)
  .attr('d', lineGenerator).attr('stroke', this.colors(this.colorNumber))
  .attr('class', "lineStyle")
  .attr('id',   'line-' + this.colorNumber)
  .on("mouseover", hoverLine)
  .on("mouseout", hoverOutLine);
  ; 
 let circleGroup = d3.select('#line-chart-info').append("g").attr('class', "lineInfo");
 circleGroup.append('circle')
 .attr('cx', 15)
 .attr('cy', 25 * (this.colorNumber + 1) + 50)
 .attr('r', 6)
 .attr('stroke', 'black')
 .attr('fill', this.colors(this.colorNumber)).attr('class', "lineInfo");

 circleGroup.append("text")
	.text(words[this.colorNumber])
	.attr("x", 30)
	.attr("y", 25 * (this.colorNumber + 1) + 55)
  .attr('font-size', '16px')
  .attr('id',  'circle-' +  this.colorNumber)
  .on("mouseover", hoverText)
  .on("mouseout", hoverOutText);
 this.incrementcolorNumber();
}

 addXAxis(dateDomain = [
  "1990-01-01T00:00:00.000Z",
  "1991-01-02T00:00:00.000Z",
  "1999-01-03T00:00:00.000Z"
])
{
  // The default parameters are just for testing purposes. s
 // const parsedDates = dateDomain.map(dateString => new Date(dateString));
   // add padding on all sides
   let padding = COUNT_CHART_PADDING;
  //https://www.geeksforgeeks.org/d3-js-scaletime-function/
  //https://www.dataviscourse.net/tutorials/lectures/lecture-advanced-d3/
  // https://www.geeksforgeeks.org/d3-js-axis-tickformat-function/
  // https://d3js.org/d3-time-format
  // https://www.geeksforgeeks.org/d3-js-axis-ticksizeouter-function/
  // https://www.geeksforgeeks.org/d3-js-axis-tickpadding-function/
  var min = d3.min(dateDomain);
  var max = d3.max(dateDomain);
  //Testing
  // var min = d3.min(parsedDates);
  // var max = d3.max(parsedDates);
  this.xScale = d3.scaleTime().domain([min,max]).range([0, LINE_CHART_WIDTH - LINE_CHART_PADDING]).nice();
 // d3.select("#lines")
 let xAxis = d3.axisBottom().tickFormat(d3.timeFormat("%m/%d/%y")).tickPadding(10).tickSizeOuter(0);

 xAxis.tickValues(dateDomain);
//  xAxis.tickValues(parsedDates);
      // assign the scale to the axis
  xAxis.scale(this.xScale);
  d3.select('#x-axis').selectAll('*').remove();
  d3.select('#x-axis')
  .attr("transform", "translate(" + `${LINE_CHART_PADDING},${LINE_CHART_HEIGHT - LINE_CHART_PADDING })`)
  .call(xAxis)
  .selectAll('text')
  .attr('class', "axStyle")
  .style("text-anchor", "end")
  .attr("transform", "rotate(-60)")  // Rotate the text by -60 degrees
  .style("font-size", "9px");
  
  d3.select('#line-chart')
  .append('text')
  .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", 350)
    .attr("y", 545 - 6)
  .style('font-size', '18px')  // Adjust font size as needed
  .text('Dates');
}
/**
 * Adds a Y Axis
 * @param {*} countRange 
 */
 addYAxis(countRange) {
  let padding = this.padding;
  var min = 0;
  var max = countRange;
   this.yScale = d3.scaleLinear().domain([min, max]).range([LINE_CHART_HEIGHT , LINE_CHART_PADDING + 25]).nice();
  let yAxis = d3.axisLeft().tickPadding(10).tickSizeOuter(10);
  yAxis.scale(this.yScale);
  d3.select('#y-axis').selectAll('*').remove();
  d3.select('#y-axis').
  attr("transform", "translate(" + LINE_CHART_PADDING + "," + -LINE_CHART_PADDING + ")")
  .call(yAxis)
  .selectAll('text')
  .attr('class', "axStyle")
  .style("font-size", "9px");
//https://stackoverflow.com/questions/11189284/d3-axis-labeling
  d3.select('#line-chart').append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 0)
    .attr("x", -450)
    .attr("dy", ".95em")
    .attr("transform", "rotate(-90)")
    .text("Word count");
}
/**
 * Clears all the data from the line chart
 */
clearData ()
{
    d3.select('#y-axis').selectAll('*').remove();
    d3.select('#x-axis').selectAll('*').remove();
    d3.select('#lines').selectAll('*').remove();
    d3.select('#line-chart-info').selectAll('*').remove();
    this.colorNumber = 0;
}
}