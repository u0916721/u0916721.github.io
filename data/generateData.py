# pip install requests
# Tutorial here -> https://www.nylas.com/blog/use-python-requests-module-rest-apis/
# https://stackoverflow.com/questions/12309269/how-do-i-write-json-data-to-a-file
import requests
import json
#Vernal Express 9/12/2001
response = requests.get("https://api.lib.utah.edu/udn/v1/issue/docs/22658299?start=0&limit=100&sort=id%7Casc")
with open("./Data/Vernal9-12-2001.json", "w") as f:
    json.dump(response.json(), f)

#Vernal Express 1-1-1995
response = requests.get("https://api.lib.utah.edu/udn/v1/issue/docs/22650613?start=0&limit=100&sort=id%7Casc")
with open("./Data/Vernal1-1-1995.json", "w") as f:
    json.dump(response.json(), f)

#Vernal Express 4-1-1997
response = requests.get("https://api.lib.utah.edu/udn/v1/issue/docs/22653316?start=0&limit=100&sort=id%7Casc")
with open("./Data/Vernal4-1-1997.json", "w") as f:
    json.dump(response.json(), f)

#Tribune 9/12/2001
response = requests.get("https://api.lib.utah.edu/udn/v1/issue/docs/27847048?start=0&limit=100&sort=id%7Casc")
with open("./Data/SaltLakeTribune9-12-2001.json", "w") as f:
    json.dump(response.json(), f)

#Tribune 1-1-1995
response = requests.get("https://api.lib.utah.edu/udn/v1/issue/docs/28001934?start=0&limit=100&sort=id%7Casc")
with open("./Data/SaltLakeTribune1-1-1995.json", "w") as f:
    json.dump(response.json(), f)

#Tribune 4-2-1997
response = requests.get("https://api.lib.utah.edu/udn/v1/issue/docs/22653316?start=0&limit=100&sort=id%7Casc")
with open("./Data/SaltLakeTribune4-1-1997.json", "w") as f:
    json.dump(response.json(), f)

#Garfield 9/12/2001
response = requests.get("https://api.lib.utah.edu/udn/v1/issue/docs/3473624?start=0&limit=100&sort=id%7Casc")
with open("./Data/Garfield9-12-2001.json", "w") as f:
    json.dump(response.json(), f)

#Garfield 1-1-1995
response = requests.get("https://api.lib.utah.edu/udn/v1/issue/docs/3447408?start=0&limit=100&sort=id%7Casc")
with open("./Data/Garfield1-1-1995.json", "w") as f:
    json.dump(response.json(), f)

#Garfield 4-2-1997
response = requests.get("https://api.lib.utah.edu/udn/v1/issue/docs/3457924?start=0&limit=100&sort=id%7Casc")
with open("./Data/Garfield4-1-1997.json", "w") as f:
    json.dump(response.json(), f)

#LoganHerald 9/12/2001
response = requests.get("https://api.lib.utah.edu/udn/v1/issue/docs/30325517?start=0&limit=100&sort=id%7Casc")
with open("./Data/LoganHerald9-12-2001.json", "w") as f:
    json.dump(response.json(), f)

#LoganHerald 1-1-1995
response = requests.get("https://api.lib.utah.edu/udn/v1/issue/docs/30216560?start=0&limit=100&sort=id%7Casc")
with open("./Data/LoganHerald1-1-1995.json", "w") as f:
    json.dump(response.json(), f)

#LoganHerald 4-2-1997
response = requests.get("https://api.lib.utah.edu/udn/v1/issue/docs/30242212?start=0&limit=100&sort=id%7Casc")
with open("./Data/LoganHerald4-1-1997.json", "w") as f:
    json.dump(response.json(), f)

#All Newspapers Counts
response = requests.get("https://api.lib.utah.edu/udn/v1/papers/")
with open("./Data/AllNewspapersCounts.json", "w") as f:
    json.dump(response.json(), f)