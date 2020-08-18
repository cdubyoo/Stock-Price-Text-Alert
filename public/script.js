
var ticker = document.getElementById('ticker');

document.querySelector('form.form').addEventListener('submit', function (e) {

    //prevent the normal submission of the form
   /* e.preventDefault(); */

    console.log(ticker.value);  
});
