require('dotenv').config();

var express = require('express');
//var expressValidator = require('express-validator');
var app = express();
var bodyParser = require('body-parser');
var aws = require('aws-sdk');
var stripe = require("stripe")(process.env.STRIPE_SECRET);


app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(bodyParser());
//app.use(expressValidator([])); // this line must be immediately after express.bodyParser()!
//app.use(express.static(__dirname + '/dist'));

// Form submission
app.post('/form/submit', function(req, res) {
  var send = require('./common/sendEmailViaSES');
  var form = req.body.form;

  //req.checkBody('form[email]', 'Email address is required').notEmpty().isString();

  //var errors = req.validationErrors();


    send(form.email, 'HCS Legacy Project', form).then(function (response) {
      res.send(response);
    }, function (reason) {
      res.send(reason);
    });

});

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

var pricing = {
  gold: '150000',
  silver: '75000',
  bronze: '35000',
  business: '15000',
  personal: '2500'
};

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

app.get('/.well-known/acme-challenge/EOknB6K3ku_L3P_fqm-kn7lO5fqWO5R5I13Tn3c0tGc', function (req, res) {
  res.end(process.env.LETSENCRYPT_PROOF);
});

app.use(express.static(__dirname + '/dist'));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
