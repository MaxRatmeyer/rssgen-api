const axios = require('axios');
const DOMParser = require('xmldom').DOMParser;

const appHeaders = {
  "access-control-allow-origin": "*",
  "max-is-amazing": "Bigly"
}

module.exports.main = async event => {
  // No parameters sent or the parameter URL does not exist
  if (event.queryStringParameters === null || event.queryStringParameters.url === undefined) {
    return {
      statusCode: 404,
      headers: appHeaders,
      body: JSON.stringify({
        message: "Parameter 'url' does not exist."
      })
    };
  }

  const feedURL = event.queryStringParameters.url

  console.log("Received request for feed URL '" + feedURL + "'")

  const feedResponse = await axios.get(feedURL).catch(function (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.headers);

      return {
        statusCode: 404,
        headers: appHeaders,
        body: JSON.stringify({
          message: "URL doesn't exist."
        })
      };
    }
  });;

  const parsedFeed = new DOMParser().parseFromString(feedResponse.data);

  let categoriesCollection = []

  let categories = parsedFeed.documentElement.getElementsByTagName('category', 'application/xml');

  for (category in categories) {
    let categoryObject = categories[category];

    if (categoryObject.firstChild && categoryObject.firstChild.nodeValue !== null) {
      let categoryValue = categoryObject.firstChild.nodeValue;

      if (categoryValue.replace(/^\s+|\s+$/g, '') !== "") { //Strips whitespace and line breaks

        if (!categoriesCollection.includes(categoryValue)) {
          categoriesCollection.push(categoryValue)
        }
      }
    }
  }

  let response = {
    "categories": []
  }

  categoriesCollection.forEach(function(item, index) {
    response.categories[index] = {"category": item};
  })

  return {
    statusCode: 200,
    headers: appHeaders,
    body: JSON.stringify(response)
  }
}