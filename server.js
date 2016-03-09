require('dotenv').config();

var express = require('express');
//var expressValidator = require('express-validator');
var app = express();
var bodyParser = require('body-parser');
var aws = require('aws-sdk');
var stripe = require("stripe")(process.env.STRIPE_SECRET);
var favicon = require('serve-favicon');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(bodyParser());
app.use(favicon(__dirname + '/dist/assets/favicon.ico'));
//app.use(expressValidator([])); // this line must be immediately after express.bodyParser()!
//app.use(express.static(__dirname + '/dist'));

// Form submission
var pricing = {
  gold: '150000',
  silver: '75000',
  bronze: '35000',
  business: '15000',
  personal: '2500'
};

/**
 * Sends the charge to Stripe
 * @param amount
 * @param stripeToken
 * @param callback
 */
var sendCharge = function(amount, stripeToken, callback) {
  var charge = stripe.charges.create({
    amount: amount,
    currency: 'usd',
    source: stripeToken,
    description: "HCS Legacy charge"
  }, function(err, charge) {
    if (err && err.type === 'StripeCardError') {
      callback(false);
    }
    else {
      callback(charge);
    }
  });
};

app.post('/form/submit', function(req, res) {
  var form = req.body.form;
  var stripeToken = form.stripeToken;
  var amount = false;
  if (typeof pricing[form.sponsorship] !== 'undefined') {
    amount = pricing[form.sponsorship];
  }
  else if (form.customAmount) {
    amount = form.customAmount * 100;
  }
  console.log("AMOUNT");
  console.log(amount);
  if (amount) {
    sendCharge(amount, stripeToken, function (charge) {
      if (charge) {
        var send = require('./common/sendEmailViaSES');
        var form = req.body.form;

        send(form.email, 'HCS Legacy Project', form).then(function (response) {
          res.redirect('/success');
        }, function (reason) {
          res.send(reason);
        });
      }
      else {
        console.log("Charge");
        console.log(charge);
      }
    });
  }
  else {
    console.log("No amount");
    res.send("No amount");
  }

});



// Post purchase
app.post('/:plan', function(req, res) {
  if (typeof pricing[req.params.plan] != 'undefined') {
    var stripeToken = req.body.stripeToken;
    sendCharge(pricing[req.params.plan], stripeToken, function(charge) {
      if (charge) {
        res.sendfile(__dirname + '/dist/success.html');
      }
    });

  }
});

app.get('/.well-known/acme-challenge/' + process.env.LETSENCRYPT_PUBLIC_PROOF_1, function (req, res) {
  res.end(process.env.LETSENCRYPT_PROOF_1);
});

app.get('/.well-known/acme-challenge/' + process.env.LETSENCRYPT_PUBLIC_PROOF_2, function (req, res) {
  res.end(process.env.LETSENCRYPT_PROOF_2);
});

app.use(express.static(__dirname + '/dist'));

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});
