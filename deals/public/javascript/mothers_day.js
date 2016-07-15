(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = '//connect.facebook.net/en_US/sdk.js';
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));
(function(){
  window.onload = function() {
    FastClick.attach(document.body);
    getCode();
    if($.cookie('token')) {
      var email = localStorage.getItem('email') || ''
      email ? $('#from').val(email).prop('readOnly', true) :'';
      $(".login").hide();
    }
    $('.smail').on('click', 'img',function(event){
      var $img = $(this);
      var url = $img.attr('src');
      $('#selectCard').attr('src', url);
      $('.smail img').removeClass('on');
      $img.addClass('on');
    })
    $('.btn').on('click',function(){
      var $btn = $(this);
      var reg=/^\w([.!#$%&\'*+\-\/=?^_`{|}~\w]{0,62})?@(\w([!#$%&\'*+\-\/=?^_`{|}~\w]{0,62}\w)?\.){1,7}\w([!#$%&\'*+\-\/=?^_`{|}~\w]){0,62}\w$/;
      var from = $('#from').val(),to = $('#to').val();
      if(!from){
        alert("Please enter the sender email.")
        return;
      }
      if(!to){
          alert("Please enter the recipient email.");
          return;
      }
      if(!reg.test(from) || !reg.test(to)){
        alert('Please enter a valid email address (Example: name@domain.com)');
        return;
      }
      if($('#code').val()==""){
        alert('Please enter the captcha.');
        return;
      }
      if(from == to){
        alert('Can not use same email address.');
        return;
      }
      if ($btn.hasClass('disabled')) {
        return;
      }
      $btn.addClass('disabled');
      sendMail(from, to, function() {
        $btn.removeClass('disabled');
      });
    })
    $('#j-sendAnother').on('click',function(){
      $("#to,#code").val("");
      $.cookie('token') ? $("#form").val(""):"";
      $('.auto-hide').hide();
      $('.auto-show').show();
    });
    $('#imgcode').on('click',function(){
      getCode();
    })
    $(".blink").on("click",function(){
      $("#prods")[0].scrollIntoView();
    })
    $('.facebook').on('click',function(){
      FB.ui({
        method: 'share',
        href: location.href,
      }, function (response) {
        if(response) {
        }
      });
    });
    $("#google").on("click",function(){
       window.open("https://plus.google.com/share?url="+encodeURIComponent(location.href),'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
    })
    $(".lock a").html("<strong>SEND E-CARD</strong> AND GET PROMO CODE >>").css({"float":"left"});
    $(".lock span").hide();
    $(".lock").show().on("click",scollTop);

  }
function scollTop(event){
  event.preventDefault();
  $(document). scrollTop(0)
}
  function sendMail(f_email, t_email, callback) {
      var  screens={};
      screens.width = Math.min(window.screen.width, window.innerWidth);
      screens.height = Math.min(window.screen.height, window.innerHeight);
      screens.colorDepth = window.screen.colorDepth || 0;
      var source = $.cookie('reg_source') || location.href;
      const body = {
        'register_source': encodeURIComponent(source),
        'f_email': f_email,
        't_email': t_email,
        // 'email_content': $('#emailContent').val(),
        'img_url': imagePath +'/'+ $('div.smail img.on').data('img'),
        'captcha': $('#code').val(),
        'captcha_key':captcha_code
      };
      $('#j-toEmail').html(t_email);
      var output = {};
      document.cookie.split(/\s*;\s*/).forEach(function(pair) {
        pair = pair.split(/\s*=\s*/);
        if(pair[0] && /\[|=|\]/g.test(pair[0]) === false) {
          output[pair[0]] = pair.splice(1).join('=');
        }
      });
      // return console.log(body);
      $.ajax({
        method: 'POST',
        url: '/api/content?path=/api/deals/deals_audios/mother_day',
        contentType: 'application/json',
        headers:output,
        data: JSON.stringify(body),
      }).done(function(res){
        if(res.error == "2"){
          alert("Dear ianker.com customer, please merge your account to anker.com. To do so, go to the anker.com login page and enter your email address and original password. Your accounts will be merged and you will get your unique referral code.");
        }else{
          $('.auto-hide').show();
          $('.auto-show').hide();
          $('.lock span').show();
          $(".lock").show().off();
          $(".lock a").html("BUY AT AMAZON").css({"float":"right","background-color":"#06a7e2"});
          $(".imglist").off().on("click","img",function(event){
              var url = $(event.target).parent().find("a").attr("href");
              window.open(url);
          })
          $(".imglist img").css("cursor","pointer");
        }
        getCode();
      }).fail(function(r) {
        var json = r && r.responseJSON;
        if (json.error) {
          alert(json.error);
        }
        // $('#to').val('');
        getCode();
      }).always(function() {
        if($.isFunction(callback)) callback();
      });
  }

  function getCode(){
    $('#code').val('');
    $.ajax({
      method: 'get',
      url: '/api/content?path=/api/users/obtain_captcha',
      data:{nowDate:new Date().getTime()},
    }).done(function(res){
      $('#imgcode').attr('src',res.captcha_url);
      window.captcha_code = res.captcha_code;
    });
  }
  window.fbAsyncInit = function() {
  FB.init({
    appId      : config.FB_APP_ID,
    xfbml      : true,
    version    : 'v2.5'
  });
};
})();
