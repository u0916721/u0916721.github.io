/** 
 * A class representing a map view for the state of Utah.
 * Based on code provided to us in Homework 4.
*/

class MapView {
    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState;
        this.highlightedCityData = [];

        const MAP_WIDTH = 500;
        const MAP_HEIGHT = 600;
        const PADDING = 30;

        // We could use Lambert's conformal conic projection for the state of Utah as suggested here:
        // https://www.e-education.psu.edu/geog486/node/678#:~:text=As%20shown%2C%20the%20transverse%20Mercator,used%20for%20East%2DWest%20extents.
        // Rotation: https://stackoverflow.com/questions/41282911/lambert-conic-conformal-projection-in-d3

        const projection = d3.geoConicConformal()
            .parallels([37,42])
            .rotate([111.0937,0])
            .fitSize([MAP_WIDTH - PADDING, MAP_HEIGHT - PADDING], globalApplicationState.countyMapData);
            
        // If we prefer Mercator, uncomment the code below
        // const projection = d3.geoMercator()
        //     .center([-111, 38.65])
        //     .scale(5000)
        //     .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);

        let mapSvg = d3.select('#utah-map-svg');

        mapSvg.attr('height', MAP_HEIGHT)
            .attr('width', MAP_WIDTH);
        
        let countyGeoJSON = globalApplicationState.countyMapData;
        let stateBoundaryGeoJSON = globalApplicationState.stateBoundaryData;
        let cityAndTownGeoJSON = globalApplicationState.cityAndTownData;

        this.drawMap(mapSvg, projection, countyGeoJSON, stateBoundaryGeoJSON, cityAndTownGeoJSON);

        initTable();
    }

    drawMap(mapSvg, projection, countyGeoJSON, stateBoundaryGeoJSON, cityAndTownGeoJSON) {
        // Initialize the path with the projection
        let path = d3.geoPath()
        .projection(projection);
        
        // console.log('county geoJSON data:', countyGeoJSON);
        // console.log('state boundary geoJSON data:', stateBoundaryGeoJSON);
        // console.log('city and town geoJSON data:', cityAndTownGeoJSON);

        // Draw state boundaries
        // The stateBoundaryGeoJSON has two elements, we want index[1]
        // https://stackoverflow.com/questions/46146653/d3-draw-single-element-from-geojson
        mapSvg.select('#utah-boundary')
            .selectAll('path')
            .data([stateBoundaryGeoJSON.features[1]])
            .join("path")
            .classed('state-boundary', true)
            .attr('id', (d) => d.properties.STATE.toLowerCase())
            .attr('name', (d) => capitalizeFirstLetters(d.properties.STATE))
            .attr('d', path);

        // Draw county boundaries within the state
        let utahBoundary = mapSvg.select('#utah-boundary');
        let countyGroups = utahBoundary.selectAll('g')
            .data(countyGeoJSON.features)
            .join('g')
            .classed('county_group', true)
            // Remove whitespace: https://levelup.gitconnected.com/13-ways-to-remove-spaces-from-string-in-javascript-73e3bad9af6e
            .attr('id', (d) => `${d.properties.NAME.toLowerCase().replace(/\s+/g, "")}-county-group`)
            .attr('name', (d) => `${capitalizeFirstLetters(d.properties.NAME)} County`)
            // Adding county boundaries
            .append('path')
            .attr('id', (d) => `${d.properties.NAME.toLowerCase().replace(/\s+/g, "")}-county-boundary`)
            .attr('d', path)
            .attr('style', 'fill:none;stroke:lightgray;stroke-width:1px');
            // An attempt at highlighting counties when hovered over. Doesn't work correctly.
            // .on('mouseover', function(d) { d3.select(this).attr('style', 'fill:lightgray;stroke:gray;stroke-width:2px') })
            // .on('mouseout', function(d) { d3.select(this).attr('style', 'fill:none;stroke:lightgray;stroke-width:1px') });

        // Draw cities
        for (let i = 0; i < countyGroups._groups[0].length; i++) {
            // Get the county name
            let countyName = countyGroups._groups[0][i].__data__.properties.NAME;
            // Format the county name as all lowercase and remove spaces for id tags
            let countyNameNoFormatting = countyName.toLowerCase().replace(/\s+/g, "");
            // Format the county name with spaces and capitalization for human readability
            let niceFormatCountyName = capitalizeFirstLetters(countyName);

            // Filter the cities for each county
            let filteredCitiesGeoJSON = cityAndTownGeoJSON.features.filter(function(feature) {
                return feature.properties.COUNTY.toLowerCase().replace(/\s+/g, "") === countyNameNoFormatting.toLowerCase();
            });

            // Add the filtered cities to the correct county group
            utahBoundary.select(`#${countyNameNoFormatting}-county-group`)
                .selectAll('circle')
                .data(filteredCitiesGeoJSON)
                .join('circle')
                .classed('city', true)
                .attr('id', function(d) {
                    return d.properties.NAME.toLowerCase().replace(/\s+/g, "");
                })
                .attr('name', (d) => capitalizeFirstLetters(d.properties.NAME))
                // Add a custom html data-* tag for easy data access: https://www.w3schools.com/tags/att_global_data.asp
                .attr('data-county-name', `${niceFormatCountyName} County`)
                .attr('cx', function (d) {
                    return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
                })
                .attr('cy', function (d) {
                    return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
                })
                .attr('r', 2)
                .on("mouseover", function (d, i) {
                    d3.select(this)
                        .attr('r', 3)
                        .attr('style', 'fill:#ff0000;stroke:#000000');

                    d3.select("#map-highlighted-city-text").text(`Highlighted City/Town: ${d3.select(this).attr('name')}`);
                    d3.select("#map-highlighted-county-text").text(`Highlighted County: ${d3.select(this).attr('data-county-name')}`);
                })
                .on("mouseout", function (d, i) {
                    if(!d3.select(this).classed('selected-city')) {
                        d3.select(this)
                            .attr('r', 2)
                            .attr('style', 'fill:#f08080;stroke:none');
                    }

                    d3.select("#map-highlighted-city-text").text('Highlighted City/Town:');
                    d3.select("#map-highlighted-county-text").text('Highlighted County:');
                })
                .on('click', function (d, i) {
                    d3.select('.selected-city')
                        .classed('selected-city', false)
                        .attr('r', 2)
                        .attr('style', 'fill:#f08080;stroke:none');
                    d3.select(this)
                        .classed('selected-city', true)
                        .attr('r', 3)
                        .attr('style', 'fill:#ff0000;stroke:#000000');
                    let cityName = d3.select(this).attr('name');
                    this.highlightedCityData = globalApplicationState.allPapersCountCityDates.filter((paper) => paper.city === cityName);
                    
                    d3.select("#map-selected-city-text").text(`Selected City/Town: ${d3.select(this).attr('name')}`);
                    d3.select("#map-selected-county-text").text(`Selected County: ${d3.select(this).attr('data-county-name')}`);
                    
                    tabulate(this.highlightedCityData);
                });
        }
    }
}

function countyMouseEnter(d, i) {
    console.log('d =', d);
    console.log('i =',i);
    d3.select(`#${i.NAME}`)
        .attr('style', 'fill:lightgray;opacity:.3;stroke:black;stroke-width:2px');
}

function countyMouseLeave(d, i) {
    d3.select(`#${i.NAME}`)
        .attr('style', 'fill:none;opacity:1;stroke:#999999;stroke-width:1px')
}

/**
 * A function that capitalizes the first letter of each word in a string
 * Based on code here, though this site's example is broken: https://flexiple.com/javascript/javascript-capitalize-first-letter
 * @param {*} d A string to be capitalized
 * @returns The formatted string
 */
function capitalizeFirstLetters(d) {
    // Split the string into individual words
    let arr = d.split(" ");

    // Capitialize the first letter of each word
    for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].substring(1,arr[i].length).toLowerCase();
    }

    // Return the formatted string
    return arr.join(" ");
}


/** A function that initializes the table */
function initTable() {
    // Add the table element for interactivity
    let table = d3.select('#utah-map-table-div')
        .append("table")
        .attr('id', 'utah-map-table')
        .attr("style", "margin-left: 50px; border: 2px");
    let tableHead = table.append('thead')
        .attr('id', 'utah-map-table-head')
        .style("border", "1px black solid")
        .style("padding", "5px")
        .style("background-color", "lightgray")
        .style("font-weight", "bold");
        // .style("text-transform", "uppercase");
    
    // Add the table header with column names
    let readableColumns = ["Newspaper", "Number of publications in UDN", "First date in UDN", "Last date in UDN"];
    let columns = ["paper", "count", "startDate", "endDate"];

    tableHead.append('tr')
        .selectAll('th')
        .data(readableColumns).enter()
        .append('th')
        .text(function (column) { return column; })
        .style("border", "1px black solid")
        .style("padding", "5px");

    // Initialize the table with instructions for the user
    data = [ { "paper": "Click on a city/town to view statistics" } ];

    let tableBody = table.append('tbody').attr('id', '#utah-map-table-body');
    // Append the data rows
    let rows = tableBody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr')
        .attr('id', 'utah-map-table-row')
        .style("border", "1px black solid")
        .style("padding", "5px");
    
    // Create a cell in each row for each column
    rows.selectAll('td')
        .data(function (row) {
            return columns.map(function (column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append('td')
        .text(function (d) { return d.value; })
        .style("border", "1px black solid")
        .style("padding", "5px");

    // Change the table header names to the readableColumns
    // Remove the json column names
    tableHead.selectAll('th').remove();
    tableHead.selectAll('tr').remove();
    // Add in readable column names
    tableHead.append('tr')
        .selectAll('th')
        .data(readableColumns).enter()
        .append('th')
		.text(function (column) { return column; })
        .style("border", "1px black solid")
        .style("padding", "5px");
}


/**
 * Add a table to the right of the map that displays information for the highlighted city.
 * Displayed info should include a list of Newspapers for that city, the first date in the 
 * UDN, the last date in the UDN, and the number of publications in the UDN.
 * 
 * Citations:
 * https://stackoverflow.com/questions/49435906/convert-a-nested-json-file-to-a-table-using-d3
 * https://www.htmlgoodies.com/javascript/bring-your-data-to-life-with-d3-js/
 * https://gist.github.com/jfreels/6734025
 */
function tabulate(data) {
    let readableColumns = ["Newspaper", "Number of publications in UDN", "First date in UDN", "Last date in UDN"];
    let columns = ["paper", "count", "startDate", "endDate"];

    console.log('data:', data);
    console.log('data[0]:', data[0]);

    let table = d3.select('#utah-map-table');

    table.select('thead').remove();

    let tableHead = table.append('thead')
        .attr('id', '#utah-map-table-head')
        .style("border", "1px black solid")
        .style("padding", "5px")
        .style("background-color", "lightgray")
        .style("font-weight", "bold");

    tableHead.append('tr')
		.selectAll('th')
		.data(columns).enter()
		.append('th')
		.text(function (column) { return column; })
        .style("border", "1px black solid")
        .style("padding", "5px");

    table.select('tbody').remove();
    let tableBody = table.append('tbody').attr('id', '#utah-map-table-body');

    if (data[0] !== undefined) {
        // Append the data rows
        let rows = tableBody.selectAll('tr')
            .data(data)
            .enter()
            .append('tr')
            .attr('id', 'utah-map-table-row')
            .style("border", "1px black solid")
            .style("padding", "5px");
        
        // Create a cell in each row for each column
        rows.selectAll('td')
            .data(function (row) {
                return columns.map(function (column) {
                    return {column: column, value: row[column]};
                });
            })
            .enter()
            .append('td')
            .text(function (d) { return d.value; })
            .style("border", "1px black solid")
            .style("padding", "5px");
    }
    else {
        // If data[0] is undefined, then tell the user there is no data for that location
        data = [ { "paper": "Try another location"}, { "paper": "No newspapers found for location", "count": 0 } ];
        
        // Append the data rows
        let rows = tableBody.selectAll('tr')
            .data(data)
            .enter()
            .append('tr')
            .attr('id', 'utah-map-table-row')
            .style("border", "1px black solid")
            .style("padding", "5px");
        
        // Create a cell in each row for each column
        rows.selectAll('td')
            .data(function (row) {
                return columns.map(function (column) {
                    return {column: column, value: row[column]};
                });
            })
            .enter()
            .append('td')
            .text(function (d) { return d.value; })
            .style("border", "1px black solid")
            .style("padding", "5px");
    }

    // Change the table header names to the readableColumns
    // Remove the json column names
    tableHead.selectAll('th').remove();
    tableHead.selectAll('tr').remove();
    // Add in readable column names
    tableHead.append('tr')
        .selectAll('th')
        .data(readableColumns).enter()
        .append('th')
		.text(function (column) { return column; })
        .style("border", "1px black solid")
        .style("padding", "5px");
}