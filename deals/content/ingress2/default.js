(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = '//connect.facebook.net/en_US/sdk.js';
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));
(function(){
$(document).ready(function(){
  FastClick.attach(document.body);
  var nick_name = localStorage.getItem('nick_name');
  var email = localStorage.getItem('email') || 'Account';
  var country_code = localStorage.getItem('country_code');
  if($.cookie('token')) {
    $("#loginInfo").html(nick_name ? nick_name : email).css("color","#37a7e1");
    shareEntries("anker_login");
  }
  var source = location.pathname.slice(1) + location.search;
  $("#register").on("click",function(){
    location.href="/register?back=" + encodeURIComponent(source);
  })
  $("#login").on("click",function(){
    location.href="/login?back=" + encodeURIComponent(source);
  })
  $(".setup").on("click","i",function(event){
      shareConfirm(event, $(event.target).attr("data-type"));
  })
  $("#country").on("click","a",function(event){
    var selVal = $(event.target).html();
    if(selVal == $("#countryVal").html()){
        return;
    }
    var urlOjb = AppActions.getUrlParam() || {},urlStr = "";
    urlOjb.country_code = selVal;
    for(var key in urlOjb){
      urlStr = key ? urlStr + "&" + key+"="+urlOjb[key] :"";
    }
    urlStr ="?" + urlStr.substr(1);
    location.href="/deals/ingress2"+ urlStr;
  })
  if(countryId == "UK"){
    $("#country").html("<li><a id='countryVal'>UK</a></li><li><a>US</a></li><li><a>DE</a></li>")
  }else if(countryId == "DE"){
    $("#country").html("<li><a id='countryVal'>DE</a></li><li><a>US</a></li><li><a>UK</a></li>")
  }
})
//签到
function shareEntries(type) {
  console.info(type);
  if($.cookie('token')) {
    $.ajax({
      method: "POST",
      url: "/api/content?path=/api/deals/deals_audios/",
      headers: {'token': $.cookie('token')},
      contentType: 'application/json',
      data: JSON.stringify({"action_type": type, "deals_type":"IG2","country_code":  window.countryId}),
      success: function(r) {
        getUserTicket();
      },
      complete: function(r) {
        if(r.status === 401) logOut();
      }
    });
  }
}
function getUserTicket(){
  if($.cookie('token')) {
    $.ajax({
      method: "get",
      url: "/api/content?path=/api/deals/deals_audios/entries",
      headers: {'token': $.cookie('token')},
      data: {"deals_type":"IG2","country_code": window.countryId,"is_all":true,"verson":new Date().getTime()},
      success: function(r) {
        $(".count").html(r.entries);
      },
      complete: function(r) {
        if(r.status === 401) logOut();
      }
    });
  }
}
//分享步骤错误提示
function shareConfirm(event, val) {
  if($.cookie('token') && window.country) {
    shareEntries(val);
    if(val ==="share_google"){
      window.open("https://plus.google.com/share?url="+encodeURIComponent(location.href+"?verson=1"),'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
    }else if(val === "share_facebook"){
      FB.ui({
        method: 'share',
        href: location.href,
      }, function (response) {
        if(response) {
        }
      });
    }
    return true;
  } else {
    event.preventDefault();
    event.stopPropagation();
    dialog.confirm({
      'content': "Please complete previous step!"
    }, function() {
      //
    }, '', 'OK');
    return false;
  }
}
 //退出
function logOut() {
  $.removeCookie('token', { path: '/' });
  localStorage.removeItem('nick_name');
  localStorage.removeItem('email');
  location.href=location.href;
}
window.fbAsyncInit = function() {
  FB.init({
    appId      : config.FB_APP_ID,
    xfbml      : true,
    version    : 'v2.5'
  });
};

})()
