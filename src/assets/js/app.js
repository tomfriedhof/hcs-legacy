$(document).foundation();
Foundation.Abide.defaults.patterns['price'] = /^\$?(?!0\d)(?:\d+|\d{1,3}(?:,\d{1,3})*)(?:\.\d{2})?$/;

var hcs = (function(window, $) {

  function showSponsorLevel(elem, showElem) {
    $(elem).change(function() {
      var selected = $(this).val();
      $(showElem).hide();
      $('#' + selected).toggle();
    });
  }

  function showAmount(elem, showElem) {
    $(elem).change(function() {
      var selected = $(this).val();
      if (selected == 'custom') {
        $(showElem).show();
      }
      else {
        $(showElem).hide();
      }
    });
  }

  function formSubmit(form) {
    var $form = $(form);

    $.ajax({
      url : $form.attr('action') || window.location.pathname,
      type: "POST",
      data: $form.serialize(),
      success: function (data) {
        $form.html(data);
      },
      error: function (jXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });
  }

  function stripeListen() {
    $('.stripe-button-el').click(function() {
      formSubmit('#contact-form');
    });
  }

  function addDataEmail() {
    var $email = $(".email-form");
    $email.change(function() {
      var email = $(this).val();

      $('.reveal form script').each(function(elem) {
        $(this).attr('data-email', email);
      })
    });
  }

  function stripeResponseHandler(status, response) {
    var $form = $('#payment-form');

    if (response.error) {
      $form.find('.payment-errors').text(response.error.message);
      $form.find('button').prop('disabled', false);
    }
    else {
      var token = response.id;
      // Insert the token into the form so it gets submitted to the server
      $form.append($('<input type="hidden" name="form[stripeToken]" />').val(token));
      // and submit
      $form.get(0).submit();
    }
  }

  function interceptForm() {
    $('#payment-form').submit(function(event) {
      var $form = $(this);

      // Disable the submit button to prevent repeated clicks
      $form.find('button').prop('disabled', true);

      Stripe.card.createToken($form, stripeResponseHandler);

      // Prevent the form from submitting with the default action
      return false;
    });
  }

  return {
    showSponsorLevel: showSponsorLevel,
    stripeListen: stripeListen,
    addDataEmail: addDataEmail,
    interceptForm: interceptForm,
    showAmount: showAmount
  };

})( window, jQuery );

hcs.interceptForm();
hcs.showAmount('.sponsorship-select', '.custom-amount');
//hcs.addDataEmail();
//hcs.showSponsorLevel('.sponsorship-select', '.stripe-form');
//hcs.stripeListen();
