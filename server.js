// setting up server constants
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var port = process.env.PORT || 8080
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
  let numberInput = (req.body.number);
  let tickerPrice = (req.body.price);
  let tickerInput = (req.body.ticker);
  if (numberInput.length != 11) {
    res.send('Invalid phone number, please make sure you typed in a correct 11 digit US phone number. Example: 14156825971')
  }
  console.log("Looking up ticker "+tickerInput.toUpperCase()+"..."); // log to make sure input is correct
  console.log("Searching if price is below "+(tickerPrice)+"..."); // ^^ price 
  console.log("Sending alerts to "+"'"+numberInput+"'");   // ^^ number

  //api url 
  var url = "https://cloud.iexapis.com/stable/stock/"+(tickerInput)+"/quote/latestPrice?token=pk_a03abb8aebc849bb8a93b6c8f6dbdb71";
  console.log("Fetching ticker API from "+url); // logging url


  // api call function
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
        clearTimeout(getData);
        // twilio text when price is below user input
      /*  client.messages.create({
          to: '+'+numberInput,
          from:'+12057829974',
          body: tickerInput.toUpperCase()+" has fallen below "+tickerPrice+"!"
        }) */
      }
    } catch (error) {
      console.log(error);
      res.status(400).send('Invalid input, please go back and try again.')
    }
  };
  // the formuoli
  getData();
  
}); // closing tags
    


  /* res.status(400).send('Invalid input, please go back and try again.') //error message */

    /* client.messages.create({
        to: '+14156527111',
        from: '+12057829974',
        body: tickerInput.toUpperCase()+" has fallen below "+tickerPrice+"!"
      }); */
    