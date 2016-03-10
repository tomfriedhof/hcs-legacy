var AppConfig = require('../config');
var Promise   = require('bluebird');
var AWS       = require('aws-sdk');
var jade = require('jade');

AWS.config.update(AppConfig.get('/aws/config'));
var SES       = new AWS.SES();
Promise.promisifyAll(SES);

module.exports = function(subject, message) {
  var to  = ['hcs@activelamp.com'];
  var frm = 'noreply@activelamp.com';
  var body = jade.renderFile("views/email.jade", {formData: message});

  return SES.sendEmailAsync({
    Source: frm,
    Destination: { ToAddresses: to },
    Message: {
      Subject: {
        Data: subject
      },
      Body: {
        Html: {
          Data: body
        }
      }
    }
  });

}
