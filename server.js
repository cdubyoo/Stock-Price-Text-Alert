// setting up server constants
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var port = process.env.PORT || 8080
var twilio = require('twilio')
var client = new twilio('ACec8293c0145ed41cb4ed95a7f6c76b1e', 'da5dd0cdfa4acbcf5e36ac4952cc0c6f');


const mongoose =require('mongoose');
const bcrypt = require('bcryptjs');
const { ensureAuthenticated, forwardAuthenticated } = require('./config/auth.js');

// db config
const db =require('./config/keys').MongoURI;

// passport config
const passport = require('passport');
require('./config/passport')(passport);

//setting up connect-flash
const session = require('express-session');
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
})
);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());


// connect to mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true})
  .then(()=> console.log('MongoDB Connected...'))
  .catch(err => console.log(err))

// console logging that server is running
app.listen(port, () => {
  console.log(`stock app listening at http://localhost:${port}`)
});

// routing static file, linking the public folder
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false})); // to access login and password from post method
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/login.html");
});


// create authentication

// User model

const User = require('./models/User.js')

// login page
app.get('/login', (req,res) => {
  res.render('login.html')
})

// app page
app.get('/app', ensureAuthenticated, (req, res) => res.render('app.html'));

// register page
app.get('/register', (req,res) => {
  res.render('register.html')
})


// setting up register page
app.post('/register', (req, res) => {
  const { username, password, password2 } = req.body;
  let errors = [];

  if(password !== password2) {
    errors.push({msg: 'passwords do not match'})
    res.redirect('/register3.html')
  } else {
    // validation passed
    User.findOne({ username: username})
    .then(user => {
      if(user) {
        // User exists
        errors.push({msg: 'user name is taken'})
        res.redirect('/register2.html')
    } else {
      const newUser = new User({
        username,
        password
      });
      console.log(newUser)

      // hash password
      bcrypt.genSalt(10, (err, salt) => 
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if(err) throw err;
          // set password to hashed
          newUser.password = hash;
          // save user
          newUser.save()
            .then(user => {
              res.redirect('/register4.html');
            })
            .catch(err => console.log(err));
        }))
    }
});
}})

// login handle

app.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/login3.html',
    failureRedirect: '/login2.html',
  }) (req, res, next);
})

// log out handle

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login.html')
});











// stock app!


// making api request using axios
const axios = require("axios");
const { stringify } = require('querystring');
var url = "https://cloud.iexapis.com/stable/stock/${ticker}/quote/latestPrice?token=pk_a03abb8aebc849bb8a93b6c8f6dbdb71"; 




// bodyparser to read inputs from front end
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 


app.post('/stock', function(req, res){
  // storing ticker input/price and number
  let tickerInput = (req.body.ticker);
  let tickerPrice = (req.body.price);
  if (tickerPrice < 0) {
    res.send('Please input a number above 0 for the price to be alerted at.')
  }
  let numberInput = (req.body.number);
  if (numberInput.length != 11) {
    res.send('Invalid phone number, please make sure you typed in a correct 11-digit US phone number. Example: 14156825971')
  }
  console.log("Looking up ticker "+tickerInput.toUpperCase()+"..."); // log to make sure input is correct
  console.log("Searching if price is below "+(tickerPrice)+"..."); // ^^ price 
  console.log("Sending alerts to "+numberInput);   // ^^ number

  //api url 
  var url = "https://cloud.iexapis.com/stable/stock/"+(tickerInput)+"/quote/latestPrice?token=pk_a03abb8aebc849bb8a93b6c8f6dbdb71";
  console.log("Fetching ticker API from "+url); // logging url


  // api call function
  async function getData() {
    try {
      const response = await axios.get(url);
      var currentPrice = response.data;
      console.log(currentPrice);
      if (currentPrice > tickerPrice) {
        console.log("Current price is above input, and will continue searching.")
        setTimeout(getData, 300000);
        res.end('Current price is above '+tickerPrice+', and will check again after 5 minutes.')
      } else {
        console.log(tickerInput.toUpperCase()+" is currently at "+currentPrice+" and has fallen below "+tickerPrice+"!")
        console.log("Current price is below input, will stop searching and alert user at +"+numberInput)
        res.end('Current price at '+currentPrice+', which is below '+tickerPrice+', text alert has been sent to '+numberInput)
        clearTimeout(getData);
        // twilio text when price is below user input
        client.messages.create({
          to: '+'+numberInput ,
          from:'+12057829974',
          body: tickerInput.toUpperCase()+" is currently at "+currentPrice+" and has fallen below "+tickerPrice+"!"
        }) 
      }
    } catch (error) {
      console.log(error);
      res.status(400).send('Invalid ticker input, please go back and try again.')
    }
  };
  // the formuoli
  getData();

}); // closing tags
    


 
  
