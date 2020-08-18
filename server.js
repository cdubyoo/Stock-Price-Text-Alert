// setting up server constants
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000
var twilio = require('twilio');
var client = new twilio('ACec8293c0145ed41cb4ed95a7f6c76b1e', '504eba99f793b33331f3506030dd41fa');

// console logging that server is running
app.listen(port, () => {
  console.log(`stock app listening at http://localhost:${port}`)
});

// routing static fille, linking the public folder
app.use(express.static("public"));
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/index.html");
});


// making api request using axios
const axios = require("axios");
const { stringify } = require('querystring');
var url = "https://cloud.iexapis.com/stable/stock/${ticker}/quote/latestPrice?token=pk_a03abb8aebc849bb8a93b6c8f6dbdb71"; 




// bodyparser to read inputs from front end
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 


app.post('/', function(req, res){
  // storing ticker input/price and number
  let tickerInput = (req.body.ticker);
  let tickerPrice = (req.body.price);
  let numberInput = (req.body.number);
  console.log("Looking up ticker "+tickerInput.toUpperCase()+"..."); // log to make sure input is correct
  console.log("Searching if price is below "+(tickerPrice)+"..."); // ^^ price 
  /* console.log("Sending alerts to "+"'"+numberInput+"'"); */  // ^^ number

  //setting up api call 
  var url = "https://cloud.iexapis.com/stable/stock/"+(tickerInput)+"/quote/latestPrice?token=pk_a03abb8aebc849bb8a93b6c8f6dbdb71";
  console.log("Fetching ticker API from "+url); // logging url



  async function getData() {
    try {
      const response = await axios.get(url);
      const currentPrice = response.data;
      console.log(currentPrice);
      if (currentPrice > tickerPrice) {
        console.log("Current price is above input, and will continue searching.")
        setTimeout(getData, 3000);
      } else {
        console.log("Current price is below input, will stop searching and alert user")
        clearTimeout(getData)
      }
    } catch (error) {
      console.log(error);
    }
  };

getData();



/*
  // interval loop
  let callInterval = setInterval(() => { 
    getData(url);
    }, 3000);
    let currentPrice = getData(url);
    console.log()
    /* let currentPrice = parseFloat(getData(url));
    if (tickerPrice < currentPrice) {
      clearInterval(callInterval);
      console.log(currentPrice); */

  
   /* 
    let currentPrice = getData(url);
    if 
  }

  
    
    callApi(); {
      let currentPrice = getData(url);
      if (tickerPrice < currentPrice) { //checking if input price is less than current price
        clearInterval(callInterval);
        console.log("Current price is below input price, stopping search...");
      }}
  
    */
  }); // closing tags
    


  /* res.status(400).send('Invalid input, please go back and try again.') //error message */

    /* client.messages.create({
        to: '+14156527111',
        from: '+12057829974',
        body: tickerInput.toUpperCase()+" has fallen below "+tickerPrice+"!"
      }); */
    