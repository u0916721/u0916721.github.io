//This class reperesents a publication example Garfield1-1-1995.json
// A publication has several articles atteched to it
// Here is where we do our analysis of publications
// https://stackoverflow.com/questions/43431550/async-await-class-constructor
class Publication {

  // Constructor takes in the json of the publication
  constructor(publication) {
    // Save for analysis.
    this.wordFrequencyArray = [];
    this.publication = publication;
    // This is our word frequency map
    this.wordFrequencyMap = new Map();

  }
  //Find most common word in OCR, given a doccument with many OCRs
  findMostCommonWordOCR( stopWords, dict) {
    // These are all the words that are in the entire publication.
    let wordArray = ['swag'];
    // See https://stackoverflow.com/questions/10346722/how-to-split-a-string-by-white-space-or-comma for regex
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter for use of filter
    // See https://stackoverflow.com/questions/767486/how-do-i-check-if-a-variable-is-an-array-in-javascript for use of type of
    // Sometimes a doccument will not have an OCR, so we are filtering those out here
    let hasOCRItems = this.publication.docs.filter((doc) => typeof doc.ocr !== "undefined");
    //console.log(hasOCRItems);
    hasOCRItems.forEach(element => {
      wordArray = wordArray.concat(element.ocr.split(/[ ,]+/));
    });
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
    // let wordFrequencyMap = new Map();
    wordArray.forEach(element => {
      // Check if key is in map
      if (this.wordFrequencyMap.has(element)) {

        // if it is increment value
        this.wordFrequencyMap.set(element, this.wordFrequencyMap.get(element) + 1);
      }
      else {
        // if not add
        // We will check here is we want to add it by comparing to stop words
        if (stopWords.includes(element.toLowerCase())) {
          // We do not add 
        }
        else {
          if (dict.has(element.toLowerCase())) {
            this.wordFrequencyMap.set(element, 1);
          }
        }
      }
    });
    // Map to array conversion https://stackoverflow.com/questions/56795743/how-to-convert-map-to-array-of-object
    this.wordFrequencyArray = Array.from(this.wordFrequencyMap, ([word, value]) => ({ ['x1']: word, ['y1']: value }));
    this.wordFrequencyArray = this.wordFrequencyArray.sort((a, b) => b.y1 - a.y1);
    // console.log(this.wordFrequencyArray);
  }

 /**
  * 
  * @param {*} ocr content
  * @param {*} stopWords 
  * @param {*} dict 
  */
  addToWordFrequencyMap(ocr, stopWords, dict) {

    let wordArray = ocr.split(/[ ,]+/);
    wordArray.forEach(element => {
      // Check if key is in map
      if (this.wordFrequencyMap.has(element.toLowerCase())) {

        // if it is increment value
        this.wordFrequencyMap.set(element.toLowerCase(), this.wordFrequencyMap.get(element.toLowerCase()) + 1);
      }
      else {
        // if not add
        // We will check here is we want to add it by comparing to stop words
        // Sometimes we do not want to use stop words hence the end of the boolean
        if (stopWords.includes(element.toLowerCase()) && globalApplicationState.useStopWords) {
          // We do not add 
        }
        else {
          //If we arent using stopwords, then useStopWords = false and thus we ignore this if
          if (dict.has(element.toLowerCase()) || !globalApplicationState.useStopWords) {
            this.wordFrequencyMap.set(element.toLowerCase(), 1);
          }
        }
      }
    });
    let arrayToSort = Array.from(this.wordFrequencyMap, ([word, value]) => ({ ['x1']: word, ['y1']: value }));
    this.wordFrequencyArray = arrayToSort.sort((a, b) => b.y1 - a.y1);
  }

  /**
   * Dealing with massive amounts of data might be more effiecnt to sort at the very end.
   */
  sortWordFrequency() {
    let arrayToSort = Array.from(this.wordFrequencyMap, ([word, value]) => ({ ['x1']: word, ['y1']: value }));
    this.wordFrequencyArray = arrayToSort.sort((a, b) => b.y1 - a.y1);
  }
}