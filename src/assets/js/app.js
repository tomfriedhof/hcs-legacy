$(document).foundation();
Foundation.Abide.defaults.patterns['price'] = /^\$?(?!0\d)(?:\d+|\d{1,3}(?:,\d{1,3})*)(?:\.\d{2})?$/;
$('input.cc-num').payment('formatCardNumber');
$('input.cc-cvc').payment('formatCardCVC');

var hcs = (function(window, $) {
  var globalForm;

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

  function stripeResponseHandler(status, response) {
    var $form = globalForm;

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
    $("#donate-form").validate({
      rules: {
        form: {
          customAmount: {
            required: true
          },
          contact: {
            first: {
              required: true
            },
            last: {
              required: true
            }
          },
          email: {
            required: true,
            email: true
          }
        }
      },
      submitHandler: function (form) {
        checkValidCC(form);
      }
    });

    $("#payment-form").validate({
      rules: {
        form: {
          sponsorship: {
            required: true
          },
          contact: {
            first: {
              required: true
            },
            last: {
              required: true
            }
          },
          email: {
            required: true,
            email: true
          },
          phoneNumber: {
            required: true,
            phoneUS: true
          }
        }
      },
      submitHandler: function(form) {
        checkValidCC(form);
      }
    });
  }

  function checkValidCC(form) {
    var $form = $(form);
    var validCard = $.payment.validateCardNumber($form.find('input.cc-num').val());
    var validCVC = $.payment.validateCardCVC($form.find('input.cc-cvc').val());
    var validExpire = $.payment.validateCardExpiry($form.find('input.cc-ex-m').val(), $form.find('input.cc-ex-y').val());

    if (!validCard) {
      alert('Your card is not valid!');
      return false;
    }
    else if (!validCVC) {
      alert('Your CVC is not valid!');
      return false;
    }
    else if (!validExpire) {
      alert('Your card expire date is not valid!');
      return false;
    }



    // Disable the submit button to prevent repeated clicks
    $form.find('button').prop('disabled', true);
    globalForm = $form;
    Stripe.card.createToken($form, stripeResponseHandler);

    // Prevent the form from submitting with the default action
    return false;
  }

  function closedModal() {
    $('body').on('closed.zf.reveal', function() {
      player.stopVideo();
    });
  }

  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  function showMessage() {
    var error = getParameterByName('error');
    var message = getParameterByName('success');
    var addClass = 'success';
    if (error || message) {
      if (error) {
        addClass = 'alert';
        message = error;
      }
      var tag = document.createElement('div');
      tag.innerHTML = "<div data-closable class='callout " + addClass + "'><h5>" + message + "</h5><button class='close-button' aria-label='Dismiss alert' type='button' data-close><span aria-hidden='true'>&times;</span></button></div>";
      var addTo = $('#callout-placeholder');
      addTo.append(tag);
    }
  }

  return {
    interceptForm: interceptForm,
    showAmount: showAmount,
    checkCookie: checkCookie,
    closedModal: closedModal,
    showMessage: showMessage,
    globalForm: globalForm
  };

})( window, jQuery );

hcs.showMessage();
hcs.interceptForm();
hcs.closedModal();
hcs.showAmount('.sponsorship-select', '.custom-amount');
