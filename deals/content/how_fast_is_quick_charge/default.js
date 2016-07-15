;(function(){
  $(document).ready(function(){
     FastClick.attach(document.body);
    var nick_name = localStorage.getItem('nick_name');
    var email = localStorage.getItem('email') || 'Account';
    var isLogin = false;
    if($.cookie('token')) {
      $(".one > div").html("1. "+(nick_name ? nick_name : email)).css("color","#37a7e1");
      isLogin = true;
      getUserTicket();
    }

    var key = location.search.substr(1);
    $("#login").on("click",function(){
      location.href="/login?back=" + encodeURIComponent("deals/how_fast_is_quick_charge"+(key ? "?" + key : ""));
    })
    $("#register").on("click",function(){
      location.href="/register?back=" + encodeURIComponent("deals/how_fast_is_quick_charge"+ (key ? "&" + key : ""));
    })
    
    $("#getCode").on("click",shareEntries);
    $("#tweetShare").on("click",function(event){
      if(isLogin){
        window.isClick = true;
        $("#getCode").css("background-color","#00a2e1");
      }
      else{
        alert("Please complete previous step!");
        event.preventDefault();
      }
    })
    countdown();
  })
  function countdown(){
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
  }
  function getUserTicket(){
    if($.cookie('token')) {
      $.ajax({
        method: "get",
        url: "/api/content?path=/api/deals/deals_audios/entries",
        headers: {'token': $.cookie('token')},
        data: {"deals_type":"FAST_CHARGE","action_type":"get_code","country_code": "US","is_all":true,"verson":new Date().getTime()},
        success: function(r) {
          if(r.entries>0){
            $(".code").show();
            $("#getCode").css("background-color","#00a2e1");
            window.isClick = true;
          }
          //$(".count").html(r.entries);
        },
        complete: function(r) {
          if(r.status === 401){
            AppActions.signOut();
            location.href="/login?back=deals/how_fast_is_quick_charge";
          }
        }
      });
    }
  }
  //签到
  function shareEntries() {
      var  screens={};
      screens.width = Math.min(window.screen.width, window.innerWidth);
      screens.height = Math.min(window.screen.height, window.innerHeight);
      screens.colorDepth = window.screen.colorDepth || 0;
      if($.cookie('token') && window.isClick) {
        $.ajax({
          method: "POST",
         url: "/api/content?path=/api/deals/deals_audios/",
          headers: {'token': $.cookie('token')},
          contentType: 'application/json',
          data: JSON.stringify({"action_type": "get_code", "deals_type":"FAST_CHARGE","country_code":  "US"}),
          success: function(r) {
            $(".code").show();
            $(document). scrollTop($(".charges").offset().top);
          },
          error:function(r){
            if(r.status == 401){
              alert("Get codes failed, please login again");
              AppActions.signOut();
              location.href="/login?back=deals/how_fast_is_quick_charge";
            }
            if(r.status>499 && r.status<599){
              alert('System busy, please try agian');
            }
          }
        })
      }else{
          alert("Please complete previous step!");
      }
  }

})()


