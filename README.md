# UDN Project
## Project Website Link
## Screencast Link
[https://www.youtube.com/watch?v=3bQMBdyp-Ic](https://www.youtube.com/watch?v=3bQMBdyp-Ic)
## Generating Charts
### Memory and Time are Factors
This project pulls from an API that houses over 36 million records. It is **not advised** to pull a large amount of data unless you have the time and storage to do so. Start small, getting 5 sets of records will probably take a minute. For **faster times**, be on campus and connected to the campus internet, the API server is hosted on the campus network.
## UI Components
Below is an explanation of the UI components as they appear.
### Newspaper Selection Dropdown
There is a paper selection dropdown that contains all the papers, they are sorted alphabetically for the most part, except for the first three which are papers of interest.
### Word List Input
The words you choose must be in a comma-separated list. No spaces, and the limit is ten.
### Date Input
We ask for the start date, start dates need to be in the **format YYYY-MM-DD**
### Increment Amount
This is how many days in the future we increment the start date from. An example if the increment amount is 3:  
`1990-01-01 + 3, means the next date is 1990-01-04`
### Times to Increment By
This is how many times we want to increment. So if we wanted to capture a whole month of data, we would set our Increment Amount to 1 (1 day), the Date as the beginning of the month, and the times to increment by 30 (days in a month).
### Stop Word Filter
This radio button when checked applies a stop word and dictionary filter, and when unchecked, does not apply a filter. Uncheck this if you want to search words that may not appear in the dictionary like y2k.

## External Libraries
### Tailwind
We use [Tailwind](https://tailwindcss.com/docs/installation/play-cdn) CSS play CDN for some basic UI stylings  
 `<script src="https://cdn.tailwindcss.com"></script>`
### Marriott Library API Reference
Our project accesses and uses the Marriott Library UDN API, the Swagger page is found [here](https://api.lib.utah.edu/docs/udn-v1.html)
### dictionary.json
This is the Webster's dictionary in JSON form. Here is the [link](https://github.com/matthewreagan/WebstersEnglishDictionary)
### Stopwords.json
An array of strings that contains stop words, derived from [here](https://github.com/stopwords-iso/stopwords-en)
