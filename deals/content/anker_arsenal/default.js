
(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = '//connect.facebook.net/en_US/sdk.js';
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));
(function (d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  //js.src = 'https://plus.google.com/js/client:platform.js?onload=startApp';
  js.src='https://apis.google.com/js/client:platform.js'
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'google-jssdk'));
(function(){
  var isLogin = false,myCode;
  countdown();
  $(document).ready(function(){
    FastClick.attach(document.body);
    setUserEmail();
    $("#facebookLogin").on("click",facebookLoginDig);
    $("#googleLogin").on("click",googleLoginDig);
    $(".iLogin").on("click",function(){
       var key = location.search.substr(1);
      location.href="/login?back="+encodeURIComponent("deals/fathers_day"+(key ? "?" + key : ""));
    });
    $('#facebookShare').on('click',function(event){
      if(isShare(event)){
          FB.ui({
            method: 'share',
            href: (origin+"?ic=" + myCode),
          }, function (response) {
            if(response) {
            }
          });
        }
      });
      //getUsers();
      $("#googleShare").on("click",function(event){
        if(isShare(event)){
          var url = origin+"?ic="+myCode;
          window.open("https://plus.google.com/share?url="+encodeURIComponent(url),'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
        }
      })
      $("#tweetShare").on("click",function(event){
        isShare(event);
      })
  })
function isShare(event){
  if(!isLogin){
    dialog.confirm({
      'content': "Please complete previous step!"
    }, function() {
      //
    }, '', 'OK');
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  return true
}
function countdown(){
    if(nowDate>0){
      var t = setInterval(function(){
        nowDate = nowDate - 1000;
        var days =  Math.floor(nowDate / (1000 * 60 * 60 * 24));
        var hours = Math.floor((nowDate / (1000 * 60 * 60 )) % 24);
        var minutes = Math.floor((nowDate % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((nowDate % (1000 * 60)) / 1000);
          $("#days").html(days);
          $("#hours").html(hours);
          $("#minutes").html(minutes);
          $("#seconds").html(seconds);
        if(nowDate<=0){
          clearInterval(t);
        }
      },1000)
    }else{
      $("#hours").html("00");
    }
  }
function setUserEmail(){
  isLogin = $.cookie("token") ? true : false;
  if(isLogin) {
    /*
    var nick_name = localStorage.getItem('nick_name');
    var email = localStorage.getItem('email') || 'Already Entered';
    $("#users").html(email).css({"color":"#37a7e1"});
    $("#userLoginTips").html("You have successfully entered. Good luck! ");
    $("#facebookLogin,#googleLogin,.iLogin").hide();*/
    $(".setup1").hide();
    $(".setup2").show();
    getCode();
  }else{
    $(".setup1").show();
    $(".setup2").hide();
    if(invitation_code){
        $("#userLoginTips").html("<div>Link your social media to </div><div>start earning tickets and enter the Spin-to-Win</div>");
    }
  }
  if(invitation_code!="" && $.cookie('token')==""){
      $("#userLoginTips").html("Link your social media to help friends earn free tech!");
  }
}
 function getCode(){
    $.ajax({
       method: "post",
      url: "/api/content?path=/api/deals/deals_audios/father_day",
      contentType: 'application/json',
      headers: {'token': $.cookie('token')},
      }).done(function(res){
        myCode = res.invitation_code;
        $(".count").html(res.remain_count >0 ?res.remain_count : "0");
        var shareUrl = location.protocol+"//" + location.host +"/deals/fathers_day?ic=" + myCode;
        $("#shareUrl").html(shareUrl);
        $("#tweetShare").attr("href", "https://twitter.com/intent/tweet?text="+encodeURIComponent(twshare +' '+ shareUrl));
        //getUserTicket();
        //res.invitation_code;
        var $btn = $("#start");
        $btn.removeClass("disable");
        if(res.remain_count > 0){
           $btn.on("click",getUserTicket);
        }else{
          $btn.on("click",function(){
            dialog.confirm({
                'content':  "You are out of spins. Refer friends for more chances to win!"
              }, function() {
              }, '', 'OK');
          });
        }
      }).error(function(){
          AppActions.signOut();
          location.reload();
      })
  }
  function getUserTicket() {
      var source = $.cookie('reg_source') || location.href;
      $("#start").off("click");
      $.ajax({
         method: "post",
        url: "/api/content?path=/api/deals/deals_audios/father_lottery",
        contentType: 'application/json',
        data: {}
        }).done(function(res){
            var index = 2160;
            var hash = {
              "Battery":{"angle":220,"prize":"Lightning to USB Cable (3ft / 0.9m)"},
              "Car Charger":{"angle":300,"prize":"PowerDrive 2 Lite"},
              "Wall Charger":{"angle":260,"prize":"PowerPort 6 Lite"},
              "Case/Screen":{"angle":60,"prize":"ToughShell & GlassGuard+"},
              "Flight ticket":{"angle":360,"prize":"$1000 Flight Ticket"},
              "Selfie Stick":{"angle":139,"prize":"Bluetooth Selfie Stick"},
              "Cable":{"angle":179,"prize":"Nylon-Braided Micro USB Cable (3ft / 0.9m)"}
            };
            $(".count").html(res.remain_count > 0 ? res.remain_count : "0");
            if(!res.is_winner){
              index += 100;
            }else{
              index += hash[res.reward].angle || 100;
            }
            $(".startimg").rotate({ angle:0,animateTo:index,duration:5000,easing: $.easing.easeInOutExpo,callback:function(){
                $('#lotteryBtn').stopRotate();
                if(res.remain_count>0){
                  $("#start").on("click",getUserTicket);
                }else{
                  $("#start").on("click",function(){
                    dialog.confirm({
                        'content':  "You are out of spins. Refer friends for more chances to win!"
                      }, function() {
                      }, '', 'OK');
                  });
                }
                if(res.is_winner){
                   dialog.confirm({
                    'content':  "Congratulations! You've won a " + hash[res.reward].prize +". Our marketing team will contact you via email within 48 hours. Feel free to refer friends for more chances to win."
                  }, function() {
                  }, '', 'OK');
                }
            }})
        }).error(function(){
          AppActions.signOut();
          location.reload();
      })
  }
  function googleLoginDig() {
    var webconfig = {
      'client_id': config.GOOGLE_APP_ID,
      'scope':'https://www.googleapis.com/auth/userinfo.email',
      'collection': 'visible'
    }
    gapi.auth.authorize(webconfig, function(authResult){
      gapi.client.load('plus', 'v1', function(){
        gapi.client.plus.people.get({userId: 'me'}).execute(function(resp){
            var email = resp.emails ? resp.emails[0].value : '';
            var user = {
            "login": email,
            "uid": resp.id,
            "third_party": "google",
            "nick_name": resp.displayName || email.split('@')[0]
          };
          third_party_login(user);
        });
      });
    });
  };
  function facebookLoginDig() {
    if (FB.getUserID() != "") {
      FB.api('/me', function () {
        FB.logout();
      })
    }
    FB.login(function(response){
      if (response.status === "connected") {
        FB.api('/me?fields=name,email', {locale: 'en_US', fields: 'name, email'}, function(response) {
          if (!response.error) {
            var user = {
              "login": response.email || "",
              "uid": response.id,
              "third_party": "facebook",
              "nick_name": response.name
            };
            third_party_login(user);
          }
        });
      }
    }, {scope: 'public_profile,email,user_birthday'});
  };
  function third_party_login(user){
    user.inviter_code = invitation_code;
    var source = $.cookie('reg_source') || location.href;
    var body = {
      "register_source": encodeURIComponent(source),
      "user": user
    };
    $.ajax({
      url:"/api/content?path=/api/sessions/third_party_login",
      data:JSON.stringify(body),
      method:"post",
      contentType: 'application/json'
    }).done(function(json){
      if (json.token) {
        AppActions.signOut();
        json.loginType = 'third_party_login';
        AppActions.signIn(json);
        //this.loginBack(AppActions.getUrlParam().back);
        AppActions.setCart(json.item_count);
        setUserEmail();
        //location.href=location.protocol+"//" + location.host +"/deals/powerhousedetail?invitation_code="+json.invitation_code;
      }
    })
  };
window.fbAsyncInit = function() {
  FB.init({
    appId      : config.FB_APP_ID,
    xfbml      : true,
    version    : 'v2.5'
  });
};
})();
