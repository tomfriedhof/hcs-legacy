$(document).foundation();
Foundation.Abide.defaults.patterns['price'] = /^\$?(?!0\d)(?:\d+|\d{1,3}(?:,\d{1,3})*)(?:\.\d{2})?$/;

var hcs = (function(window, $) {

  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1);
      if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return false;
  }

  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
  }

  function checkCookie(cname, player) {
    var cookie = getCookie(cname);
    if (!cookie) {
      setTimeout(function() {
        $('#videoModal').foundation('open');
        player.playVideo();
        setCookie('hcs_visited', 1, 14);
      }, 200);
    }
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

  function closedModal() {
    $('body').on('closed.zf.reveal', function() {
      player.stopVideo();
    });
  }

  return {
    interceptForm: interceptForm,
    showAmount: showAmount,
    checkCookie: checkCookie,
    closedModal: closedModal
  };

})( window, jQuery );

hcs.interceptForm();
hcs.closedModal();
hcs.showAmount('.sponsorship-select', '.custom-amount');
