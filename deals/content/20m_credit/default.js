
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
  $(document).ready(function(){
    FastClick.attach(document.body);
    setUserEmail();
    $("#facebookLogin").on("click",facebookLoginDig);
    $("#googleLogin").on("click",googleLoginDig);
    $(".iLogin").on("click",function(){
       var key = location.search.substr(1);
      location.href="/login?back="+encodeURIComponent("deals/20m_credit"+(key ? "?" + key : ""));
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
      $("#setRule").on("click",function(){
          $(document). scrollTop($(".rule1").offset().top);
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
function setUserEmail(){
  isLogin = $.cookie("token") ? true : false;
  if(isLogin) {
    $(".setup1").hide();
    $(".setup2").show();
    $("#tips1").html("Welcome to the party!");
    $("#tips2").html("Share the link below to refer friends and start earning Anker Dollars!");
    getCode();
    getUserTicket();
  }else{
    $(".setup1").show();
    $(".setup2").hide();
    if(invitation_code){
      $("#tips1").html("We’re celebrating over 20 million happy Anker users!");
      $("#tips2").html("Get $30 for signing up and $1 for every friend you bring");
    }
  }
}
 function getCode(){
    $.ajax({
       method: "get",
      url: "/api/content?path=/api/deals/deals_invitations/invitation_code",
      contentType: 'application/json',
      headers: {'token': $.cookie('token')},
      }).done(function(res){
        myCode = res.invitation_code;
        //$(".count").html(res.remain_count >0 ?res.remain_count : "0");
        var shareUrl = location.protocol+"//" + location.host +"/deals/20m_credit?ic=" + myCode;
        $("#shareUrl").html(shareUrl);
        $("#tweetShare").attr("href", "https://twitter.com/intent/tweet?text="+encodeURIComponent(twshare +' '+ shareUrl));

      }).error(function(){
          AppActions.signOut();
          location.reload();
      })
  }
  function getUserTicket() {
      var source = $.cookie('reg_source') || location.href;
      $("#start").off("click");
      $.ajax({
         method: "get",
        url: "/api/content?path=/api/deals/deals_invitations/invitation_count",
        contentType: 'application/json',
        data: {"deals_name":"20m_credit"}
        }).done(function(res){
            var invitation_count = res.invitation_count.toString().split("");
            var temp = "";
            if(invitation_count.length === 1){
              temp = "<span class='tb'>0</span><span class='tb'>" + invitation_count[0] + "</span>";
            }else{
              for(var i = 0,g = invitation_count.length;i < g; i++){
                temp += "<span class='tb'>" + invitation_count[i] + "</span>";
              }
            }
            $("#creditCount").html(temp);

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
        /*if (json.is_first_login) {
          dialog.confirm({
            'title': "Welcome to anker.com! ",
            'content': "Update your country to USA on your Profile Page to receive your Anker Store coupons. <br>The coupons are not valid for Amazon or non-US orders."
          });
        }*/
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
