/**
 * A class containing utilities for analyzing data about the newspapers in the UDN database
 */
class NewspaperUtils
{
    // A function that fetches all newspapers with their counts from the UDN archive
    static async fetchPapers()
    {
        let allPapersCountResponse;

        await fetch("https://api.lib.utah.edu/udn/v1/papers/")
                .then((response) => response.json())
                .then((json) => {
                    allPapersCountResponse = json;
                })

        return allPapersCountResponse;
    }

    /**
     * This returns a json of the paper we want given the date
     * if no paper exists on the date we find the closest on the date(this will need error handeling, lest we go to infinty to the future)
     * @param {*} paperName the name of the paper
     * @param {*} date the date we want the paper
     */
    static async fetchPaperGivenNameAndDate(paperName,date)
    {
        let response ;
        //TODO: Date error catching logic here
        // 30 here but will change later
        for(let i = 0; i < 60; i ++)
        {

          
            await fetch(`https://api.lib.utah.edu/udn/v1/issue/${paperName}/date/${date.getFullYear()}/${date.getMonth() + 1}/${NewspaperUtils.getDayDate(date)}?start=0&limit=10&sort=id%7Casc`)
                .then((response) => response.json())
                .then((json) => {
                    response = json;
                })
            //Did we get a hit?
            if(response.numFound >=1)
            break;
            NewspaperUtils.incrementDate(date);
            // console.log(`https://api.lib.utah.edu/udn/v1/issue/${paperName}/date/${date.getFullYear()}/${date.getMonth() + 1}/${NewspaperUtils.getDayDate(date)}?start=0&limit=10&sort=id%7Casc`);
            // console.log(response);
        }
        //Once we have found our paper we need to get its ID and call the get method on it.
        let data;
        await fetch(`https://api.lib.utah.edu/udn/v1/issue/docs/${response.docs[0].id}?start=0&limit=100&sort=id%7Casc`)
        .then((response) => response.json())
        .then((json) => {
            data = json;
        })
        return data;
    }

    /**
     * Returns a two element array that contains the publish date for the paper [startDate,endDate]
     * @param {*} paperName The name of the paper
     */
    static async getPublishDateRangeForPaper(paperName)
    {
        try {
            // Get the first publication in the UDN as well as the number of issues found.
            // Note that the number of issues found is different from the "count" value returned
            // from the /papers/ request executed in fetchPapers()
            let startValue = 0;
            let limit = 1;
            let data;
            await fetch(`https://api.lib.utah.edu/udn/v1/issue/${paperName}?start=${startValue}&limit=${limit}&sort=date%7Casc`)
                .then(response => response.json())
                .then((json) => {
                    data = json;
                })
            
            // Get the first date in the data. It is formatted with Date time string format:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format
            let startDate = Date(data.docs[0].date);

            let numFound = data.numFound;

            // Get the end date contained in the UDN archive
            await fetch(`https://api.lib.utah.edu/udn/v1/issue/${paperName}?start=${numFound - 1}&limit=${limit}&sort=date%7Casc`)
                .then(response => response.json())
                .then((json) => {
                    data = json;
                })

            // Get the last date in the data
            let endDate = Date(data.docs[0].date);

            return { startDate, endDate };
        }
        catch (error) {
            // console.log("Couldn't get start/end date data for:", paperName, '\nError:', error);
        }
        
    }

    /**
     * Returns a list of issues belonging to a paper, 
     * 0 starts from the earliest date
     * Object that is returned cotains a docs array with the docs in the range
     * also returns a numFound (Might be usefull for binary search type approach)
     * @param {*} paperName Name of the paper
     * @param {*} startIndex index of results. api only return in 100 page chunks
     * @returns 
     */
     static async getPaperIssues(paperName,startIndex)
     {
        let data;
        await fetch(`https://api.lib.utah.edu/udn/v1/issue/${paperName}?start=${startIndex}&limit=100&sort=date%7Casc`)
        .then(response => response.json())
        .then((json) => {
            data = json;
        })
        return data;
     }

       /**
     * Returns a list of issues belonging to a paper, 
     * 0 starts from the earliest date
     * Object that is returned cotains a docs array with the docs in the range
     * also returns a numFound (Might be usefull for binary search type approach)
     * @param {*} paperName Name of the paper
     * @param {*} startIndex index of results. api only return in 100 page chunks
     * @returns 
     */
       static async getDocsPublishedOnDate(date,startIndex)
       {
        let data;        
        await fetch(`https://api.lib.utah.edu/udn/v1/docs/date/${date.getFullYear()}/${date.getMonth() + 1}/${NewspaperUtils.getDayDate(date)}?start=${startIndex}&limit=100&sort=id%7Casc`)
        .then(response => response.json())
        .then((json) => {
            data = json;
        })
        return data;
       }

       /**
        * 
        * @param {*} date The date of our paper
        * @returns The number of items
        */
       static async getNumberOfDocsPublishedOnDate(date)
       {
          let data;        
          await fetch(`https://api.lib.utah.edu/udn/v1/docs/date/${date.getFullYear()}/${date.getMonth() + 1}/${NewspaperUtils.getDayDate(date)}?start=0&limit=1&sort=id%7Casc`)
          .then(response => response.json())
          .then((json) => {
              data = json;
          })
          return data.numFound;
       }

    /**
     * This method is needed to increment a date by a day if we can not find a 
     * paper on the given date, so that we can try the next date
     * @param {*} date 
     * returns a date icremented by a day.
     */
    static incrementDate(date)
    {
    //https://stackoverflow.com/questions/3674539/incrementing-a-date-in-javascript
        date.setUTCDate(date.getUTCDate() + 1);
        return date; //Probably not needed but for readibility sake.
    }
    /**
     * There is an oddity in the api that excepts dates of 01 but not 1,
     * this conforms to it
     * @param {*} date 
     */
    static getDayDate(date)
    {
        // Checking for 1,2,3...9 case if so add 0
        if((date.getDate() + "").length === 1)
        {
            return 0 + "" + date.getDate();
        }
        else
        {
            return date.getDate() + "";
        }
    }

    /**
     * Returns a JSON list of papers for which the UDN archive contains at least minimumCount publications
     * and at most maximumCount publications
     * @param {*} minimumCount The minimum number of publications in the UDN archive
     * @param {*} minimumCount The maximum number of publications in the UDN archive
     * @returns A JSON list of papers the UDN has at least minimumCount publications of
     */
    static async findPublishedPapersInRange(minimumCount, maximumCount)
    {
        try 
        {
            if (maximumCount < minimumCount)
            {
                throw new Error('\'Newspaper Count in UDN Archive\' parameters must have a maximum larger than the minimum.');
            }
        }
        catch (err)
        {
            // https://developer.mozilla.org/en-US/docs/Web/API/Window/alert
            alert(err);
        }
        let papersAtLeastArray = [];
        let allPapersCountParsed = await NewspaperUtils.fetchPapers();

        // filter out papers above the desired value
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
        papersAtLeastArray = allPapersCountParsed.filter(function(element) {
            return element.count >= minimumCount;
        });

        let papersInRangeArray = papersAtLeastArray.filter(function(element) {
            return element.count <= maximumCount;
        });

        // console.log("papersInRangeArray");
        // console.log(papersInRangeArray);

        return papersInRangeArray;
    }

    /**
     * A function which finds the papers that have at least minimumCount and at most 
     * maximumCount papers in the UDN archive, then returns a JSON array sorted alphabetically.
     * 
     * This function might be useless since the newspapers appear to already be sorted alphabetically.
     * @param {*} minimumCount The minimum number of publications in the UDN archive
     * @param {*} maximumCount The maximum number of publications in the UDN archive
     * @returns the alphabetically sorted JSON array
     */
    static async findPublishedPapersInRangeAlphaSort(minimumCount, maximumCount)
    {
        // Fetch the papers
        let papersInRangeArray = await this.findPublishedPapersInRange(minimumCount, maximumCount);

        // Sort papers by their names and save them to a deep copy array
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
        // https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy
        let alphaSortedPapersInRangeArray = JSON.parse(JSON.stringify(papersInRangeArray)); // make a deep copy

        // console.log("Before papers sorted alphabetically:");
        // console.log(alphaSortedPapersInRangeArray);

        alphaSortedPapersInRangeArray.sort((a, b) => {
            // convert to uppercase to ignore case
            const nameA = a.paper.toUpperCase();
            const nameB = b.paper.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });

        // console.log("Papers sorted by paper name:");
        // console.log(alphaSortedPapersInRangeArray);

        return alphaSortedPapersInRangeArray;
    }


    /**
     * A function which finds the papers that have at least minimumCount and at most 
     * maximumCount papers in the UDN archive, then returns a JSON array sorted by the
     * count of papers in the archive.
     * @param {*} minimumCount The minimum number of publications in the UDN archive
     * @param {*} maximumCount The maximum number of publications in the UDN archive
     * @returns the count sorted JSON array
     */
    static async findPublishedPapersInRangeCountSort(minimumCount, maximumCount)
    {
        // Fetch the papers
        let papersInRangeArray = await this.findPublishedPapersInRange(minimumCount, maximumCount);

        // Sort papers by their counts and save them to a deep copy array
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
        // https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy
        let countSortedPapersInRangeArray = JSON.parse(JSON.stringify(papersInRangeArray)); // make a deep copy

        // console.log("Before papers sorted by descending count:");
        // console.log(countSortedPapersInRangeArray);

        countSortedPapersInRangeArray.sort((a, b) => b.count - a.count);

        // console.log("Papers sorted by descending count:");
        // console.log(countSortedPapersInRangeArray);

        return countSortedPapersInRangeArray;
    }

    /**
     * A function which given the name of a newspaper, returns the city of publication
     * @param {*} paperName The name of the paper
     * @param {*} allNewspapersCountsWithLocationJson A JSON array containing newspaper names and their locations
     * @returns The city where the paper is published
     */
    static findPaperPublicationCity(paperName, allNewspapersCountsWithLocationJson) {
        // Search the allNewspapersCountsWithLocation object for the paper's city
        for (let i = 0; i < allNewspapersCountsWithLocationJson.length; i++) {
            if (allNewspapersCountsWithLocationJson[i].paper === paperName) {
                return allNewspapersCountsWithLocationJson[i].city;
            }
        }
    }

    /**
     * A function that returns the county a city/town is located in.
     * @param {*} city The city/town to be searched for
     * @param {*} utahCityAndTownLocationsJson The JSON file containing location data
     * @returns The county the city/town is located in
     */
    static findCountyGivenCity(city, utahCityAndTownLocationsJson) {
        // Search the location json for a county given a city
        for (let i = 0; i < utahCityAndTownLocationsJson.length; i++) {
            if (utahCityAndTownLocationsJson[i].properties.NAME === city) {
                return utahCityAndTownLocationsJson[i].properties.COUNTY;
            }
        }
        // If there is no county found, return the string 'none found'
        // I'm choosing to do this instead of a throw temporarily so that no interruption 
        // happens when we know that not all locations are in the dataset anyway (which 
        // needs to be fixed)
        return 'none found';
    }

    /**
     * A method for merging allNewspaperCountsWithLocationData, allPapersDateRanges, and noDateRangeNewspapers data
     * @param {*} allNewspaperCountsWithLocationData 
     * @param {*} allPapersDateRanges 
     * @param {*} noDateRangeNewspapers 
     */
    static newspaperDatePlusCity(allNewspaperCountsWithLocationData, allPapersDateRanges, noDateRangeNewspapers) {
        let result = [];

        for (let i = 0; i < allNewspaperCountsWithLocationData.length; i++) {
            for (let j = 0; j < allPapersDateRanges.length; j++) {
                if (allNewspaperCountsWithLocationData[i].paper === allPapersDateRanges[j].paper) {
                    result.push({
                        paper: allNewspaperCountsWithLocationData[i].paper,
                        city: allNewspaperCountsWithLocationData[i].city,
                        startDate: allPapersDateRanges[j].startDate,
                        endDate: allPapersDateRanges[j].endDate,
                        count: allNewspaperCountsWithLocationData[i].count
                    });
                }
            }

            console.log('noDateRangeNewspapers.length', noDateRangeNewspapers.length);

            for (let j = 0; j < noDateRangeNewspapers.length; j++) {
                if (allNewspaperCountsWithLocationData[i].paper === noDateRangeNewspapers[j].paper) {
                    result.push({
                        paper: allNewspaperCountsWithLocationData[i].paper,
                        city: allNewspaperCountsWithLocationData[i].city,
                        startDate: noDateRangeNewspapers[j].startDate,
                        endDate: noDateRangeNewspapers[j].endDate,
                        count: allNewspaperCountsWithLocationData[i].count
                    });
                }
            }
        }

        console.log('result:', result);
    }
}