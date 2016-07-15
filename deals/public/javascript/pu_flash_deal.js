$(function() {
  // (function(d, s, id){
  //    var js, fjs = d.getElementsByTagName(s)[0];
  //    if (d.getElementById(id)) {return;}
  //    js = d.createElement(s); js.id = id;
  //    js.src = "//connect.facebook.net/en_US/sdk.js";
  //    fjs.parentNode.insertBefore(js, fjs);
  //  }(document, 'script', 'facebook-jssdk'));
  //  window.fbAsyncInit = function() {
  //  FB.init({
  //    appId      : config.FB_APP_ID,
  //    xfbml      : true,
  //    version    : 'v2.5'
  //  });
  FastClick.attach(document.body);
  $mobBanner = $('div.mob-banner');
  $mobBanner.on('click', 'h3', function() {
    var $btn = $(this);
    $btn.parent().toggleClass('expand');
  });
  var token = $.cookie('token');
  var headers = {
    token: token,
    country: $.cookie('country') || 'US',
  }
  var $prods = $('#prods');
  $prods.on('click', '.j-getcode', function() {
    var $btn = $(this);
    var datas = {
      // token: token,
      activity_item_id: $btn.data('id'),
    }
    if ($btn.hasClass('disable')) {
      return;
    }
    // return console.log($prods.find('.j-getcode').not($btn).addClass('disable'));
    $btn.addClass('disable');
    $.ajax({
      url: '/api/content?path=/api/activities/flash_deal_create',
      type: 'POST',
      dataType: 'json',
      headers: headers,
      contentType: 'application/json',
      data: JSON.stringify(datas),
      // data: datas,
    })
    .done(function(json) {
      // console.log(json);
      json = json || {};
      var err = json.error || json.exception;
      if (err) {
        return alert(json.err);
      } else if (json.code) {
        $btn.hide();
        var $pre = $btn.siblings('.pre-hide').removeClass('pre-hide');
        $pre.find('.code').html('(' + json.code + ')');
        $prods.find('.j-getcode').not($btn).addClass('disable');
      }
      $btn.removeClass('disable');
    })
    .fail(function() {
      $btn.html('CODE CLAIMED');
    })
    .always(function() {
      // $btn.hide();
      // var $pre = $btn.siblings('.pre-hide').removeClass('pre-hide');
      // $pre.find('.code').html('(' + '12q43q4rawrwar' + ')');
    });
  });
  $prods.on('click', '.j-review', function() {
    var $btn = $(this);
    var url = $btn.siblings('input[name="review_url"]').val();
    var actions = $btn.closest('div.actions').data();
    var reg = new RegExp(actions.domain + '/(review|gp/review|gp/customer-reviews).*', 'i'); // + actions.asin
    var datas = {
      // token: token,
      activity_item_id: $btn.data('id'),
      review_url: url,
    }
    // console.log('amazon.com/review/xx_' + actions.asin, reg, reg.test(url));
    if (!url) {
      alert('Please enter review URL.');
      return;
    } else if (!reg.test(url)) {
      alert('Wrong link, Please submit amazon review link agian.\n(example: https://www.amazon.com/review/YourReviewID).');
      return;
    }
    // return alert(1)
    if ($btn.hasClass('disable')) {
      return;
    }
    $btn.addClass('disable');
    $.ajax({
      url: '/api/content?path=/api/activities/flash_deal_review_create',
      type: 'POST',
      dataType: 'json',
      headers: headers,
      contentType: 'application/json',
      data: JSON.stringify(datas),
      // data: datas,
    })
    .done(function(json) {
      // console.log(json);
      json = json || {};
      var err = json.error || json.exception;
      if (err) {
        return alert(json.err);
      } else if (json.id) {
        $btn.closest('.review').hide();
      }
      $btn.removeClass('disable');
    })
    .fail(function() {
      $btn.closest('.review').hide();
    })
    .always(function() {
    });
  });
});
