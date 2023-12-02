//This class reperesents an analysis of a publication
//Contains and can produce a word frequency array given a word
// Example [{date,amount},{date,amount}]
//Stores all the publications of a given paper given a date, granualirty and range.
class PublicationAnalysisTest
{
    
    // Constructor takes in the json of the publication

    /**
     * 
     * @param {*} date 
     * @param {*} stopWords 
     * @param {*} dict 
     */
    constructor(date,stopWords,dict)
    {
        // Save for analysis.
        this.stopWords = stopWords;
        this.dict = dict;
        this.date = date; 
        //  This map has the dates as the keys
        // Which maps to a map of (publication,publicationObject);
        this.publications = new Map();
        // Only one publications object at a time
        globalApplicationState.publications= this;
    }

    /**
     * 
     * @param {*} date the date to start with
     * @param {*} sets how many sets of data the users wants
     * @param {*} incrementAmount what to increment the month by
     */
    async generatePublicationDateRange(date,sets,incrementAmount)
    {
        //Javascript stange with adding a month to a date
       // https://stackoverflow.com/questions/5645058/how-to-add-months-to-a-date-in-javascript
       //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise might play around with
       //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
       const promises = [];
       for(let i = 0; i < sets; i++)
       {
      await this.storePublications(date);
       date.setDate(date.getDate() + incrementAmount);
       }
    }
    
    //Store publications
   async storePublications(date)
    {
        //first we get a list of all the doccuments we want
        let dateString = d3.utcFormat("%Y-%m-%d")(date);
        this.publications.set(dateString, new Map());
        // We are also going to create a general paper count here as well
        let genWordCount = new Publication(null);
        this.publications.get(dateString).set("All Papers",genWordCount);
        let totalToParse = await NewspaperUtils.getNumberOfDocsPublishedOnDate(date);
        // We increment by 100 since that is what we are calling our chunks by
        for(let i = 0; i * 100 < totalToParse; i++)
        {
            let docs = (await NewspaperUtils.getDocsPublishedOnDate(date,i * 100)).docs;
            //If it does not have an OCR we do not care
            docs = docs.filter((doc) => typeof doc.ocr !== "undefined");
            for (const doc of docs) {
                // We are also going to create a general paper count here as well

                // Add to the all papers object.
                this.publications.get(dateString).get("All Papers").addToWordFrequencyMap(doc.ocr,this.stopWords,this.dict);
                //If paper is in we add
                if(this.publications.get(dateString).has(doc.paper))
                {
                    this.publications.get(dateString).get(doc.paper).addToWordFrequencyMap(doc.ocr,this.stopWords,this.dict);
                }
                else
                {
                    let p = new Publication(null);
                    p.addToWordFrequencyMap(doc.ocr,this.stopWords,this.dict);
                    this.publications.get(dateString).set(doc.paper,p);
                }

            }

        }
    }
}