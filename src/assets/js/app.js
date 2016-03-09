$(document).foundation();

var hcs = (function(window, $) {

  function showSponsorLevel(elem, showElem) {
    $(elem).change(function() {
      var selected = $(this).val();
      $(showElem).hide();
      $('#' + selected).toggle();
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

  return {
    showSponsorLevel: showSponsorLevel,
    stripeListen: stripeListen,
    addDataEmail: addDataEmail
  };

})( window, jQuery );

hcs.addDataEmail();
hcs.showSponsorLevel('.sponsorship-select', '.stripe-form');
hcs.stripeListen();
