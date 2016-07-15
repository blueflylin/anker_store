(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/en_US/sdk.js";
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
  var myCode,isLogin = false;
  window.onload = function() {
    FastClick.attach(document.body);
    setUserEmail();
    countdown();
    $("#facebookLogin").on("click",facebookLoginDig);
    $("#googleLogin").on("click",googleLoginDig);
    $(".iLogin").on("click",function(){
        var key = location.search.substr(1);
        location.href="/login?back="+encodeURIComponent("deals/tsh"+(key ? "?" + key : ""));
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
  }
  function isShare(event){
    if(!isLogin){
        alert("Please complete previous step!");
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
    return true
  }
  function setUserEmail(){
    if($.cookie('token')) {
      isLogin=true;
      var nick_name = localStorage.getItem('nick_name');
      var email = localStorage.getItem('email') || 'Already Entered';
      $("#users").html(email).css({"color":"#37a7e1"});
      $("#userLoginTips").html("You have successfully entered. Good luck!");
      $("#facebookLogin,#googleLogin,.iLogin").hide();
      getCode();
    }
    if(inviter_code!="" && $.cookie('token')==""){
        $("#userLoginTips").html("Link your social media to help friends earn free tech!");
    }
  }
  function getUserCount() {
      var  screens={};
      screens.width = Math.min(window.screen.width, window.innerWidth);
      screens.height = Math.min(window.screen.height, window.innerHeight);
      screens.colorDepth = window.screen.colorDepth || 0;
      const body = {
        'register_source': encodeURIComponent(location.href),
        'invitation_code': myCode,
        'nowDate' : new Date().getTime()
      };
      $.ajax({
         method: "get",
        url: "/api/content?path=/api/users/inviter_count",
        contentType: 'application/json',
        data: body
        }).done(function(res){
            if(res.inviter_count > 0){
              $("#noDate").html(res.inviter_count+" ");
              var ispc = isPC();
              if(res.inviter_count <11){
                  ispc ? $(".line").css("width",5*res.inviter_count+"%") : $(".line").css("height",20*res.inviter_count+"px");
                  res.inviter_count>=5 ? $(".index").eq(0).addClass("on") : '';
                  res.inviter_count ==10 ? $(".index").eq(1).addClass("on") : '';
              }
              else if(res.inviter_count >10 && res.inviter_count<31){
                  ispc ? $(".line").css("width",(50 + 1.25*(res.inviter_count-10))+"%") : $(".line").css("height",(200 + 5*(res.inviter_count-10))+"px");
                  $(".index").eq(0).addClass("on")
                  $(".index").eq(1).addClass("on")
                  res.inviter_count ==30 ? $(".index").eq(2).addClass("on") : '';
              }else if(res.inviter_count >= 31){
                $(".index").eq(0).addClass("on")
                $(".index").eq(1).addClass("on")
                $(".index").eq(2).addClass("on")
                ispc ? $(".line").css("width",(75 + 0.35714285714286*(res.inviter_count-30))+"%") : $(".line").css("height",(300 + 1.4285714*(res.inviter_count-30))+"px");
                res.inviter_count >=100 ? $(".index").eq(3).addClass("on") : '';
              }
            }else{
              $("#noDate").html("No ");
            }
           
        })
  }
  function getCode(){
    $.ajax({
       method: "get",
      url: "/api/content?path=/api/users/obtain_invitation",
      contentType: 'application/json',
      headers: {'token': $.cookie('token')},
      }).done(function(res){
        myCode = res.invitation_code;
        $("#shareUrl").html(location.protocol+"//" + location.host +"/deals/tsh?ic=" + myCode);
        $("#tweetShare").attr("href", "https://twitter.com/intent/tweet?text="+encodeURIComponent("Big thanks to @AnkerOfficial for the free #SummerTech! Anyone can join 😁 https://www.anker.com/deals/tsh?ic="+myCode));
        getUserCount();
        //res.invitation_code;
      }).error(function(){
          AppActions.signOut();
          location.reload();
      })
  }
  //countdown();
  function countdown(){
    if(nowDate>0){
      var t = setInterval(function(){
        nowDate = nowDate - 1000;
        var hours = Math.floor(nowDate / (1000 * 60 * 60));
        var minutes =Math.floor((nowDate % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((nowDate % (1000 * 60)) / 1000);
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
    user.inviter_code = inviter_code;
    var body = {
      "register_source": encodeURIComponent(location.href),
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
  function isPC(){
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone","SymbianOS", "Windows Phone","iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    if($(window).width()==1024){
        flag=true;
    }
    return  flag;
  }
  window.fbAsyncInit = function() {
  FB.init({
    appId      : config.FB_APP_ID,
    xfbml      : true,
    version    : 'v2.5'
  });
};
})()


