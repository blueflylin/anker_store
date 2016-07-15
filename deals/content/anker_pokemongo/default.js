(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = '//connect.facebook.net/en_US/sdk.js';
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));
(function(){
   var selectCountry = countryId;
   var isClickAnker = false;
   var isClickShare = false;
$(document).ready(function(){
  FastClick.attach(document.body);
  var nick_name = localStorage.getItem('nick_name');
  var email = localStorage.getItem('email') || 'Account';
  if($.cookie('token')) {
    $(".setp1Info").html(nick_name ? nick_name : email).css("color","#37a7e1");
    getUserTicket();
  }
  var key = location.search.substr(1);
  $("#register").on("click",function(){
    location.href="/register?back="+encodeURIComponent("deals/pokessentials"+(key ? "?" + key : ""));
  })
  
  $("#login").on("click",function(){
    location.href="/login?back="+encodeURIComponent("deals/pokessentials"+(key ? "?" + key : ""));
  })
  $("#setp2").on("click","i",function(event){
      if(!$.cookie('token')){
        event.preventDefault();
        event.stopPropagation();
        dialog.confirm({
          'content': "Please complete previous step!"
        }, function() {
        }, '', 'OK');
      }else{
        isClickAnker = true;
      }
  })
  $("#setp3").on("click","i",function(event){
      var dataType = $(event.target).attr("data-type");
      if(!isClickAnker){
        event.preventDefault();
        event.stopPropagation();
        dialog.confirm({
          'content': "Please complete previous step!"
        }, function() {
          //
        }, '', 'OK');
      }else{
        isClickShare = true;
        if(dataType =="share_google"){
          window.open("https://plus.google.com/share?url="+encodeURIComponent(location.href+"?verson=1"),'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600'); 
        }else if(dataType =="share_facebook"){
            FB.ui({
              method: 'share',
              href: location.href,
            }, function (response) {
              if(response) {
              }
            });
          }
      }      
  })
  $(".btn").on("click",function(){
    if(isClickShare){
      shareEntries("share_facebook");
      dialog.confirm({
        'content': "You’re entered! We’ll email the winners on July 25th, so make sure to check your inbox and your junk mail."
      }, function() {
        //
      }, '', 'OK');
    }else{
         dialog.confirm({
          'content': "Please complete previous step!"
        }, function() {
          //
        }, '', 'OK');
    }
  })
})
window.fbAsyncInit = function() {
  FB.init({
    appId      : config.FB_APP_ID,
    xfbml      : true,
    version    : 'v2.5'
  });
};
//签到
function shareEntries(type) {
  if($.cookie('token')) {
    $.ajax({
      method: "POST",
      url: "/api/content?path=/api/deals/deals_audios/",
      headers: {'token': $.cookie('token')},
      contentType: 'application/json',
      data: JSON.stringify({"action_type": type, "deals_type":"POKEMONGO","country_code": selectCountry}),
      success: function(r) {
        //getUserTicket();
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
      contentType: 'application/json',
      data: {"deals_type":"POKEMONGO","country_code": selectCountry,"is_all":true,"verson":new Date().getTime()},
      success: function(r) {
        if(r.entries >0 ){
          isClickAnker = true;
          isClickShare = true;
        }
      },
      complete: function(r) {
        if(r.status === 401){
          AppActions.signOut();
        };
      }
    });
  }
}
 
})();
