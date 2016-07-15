
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
    
    window.$userList = $("#userList");
    window.userListCount = $userList.children().length;
    window.listPositon = userListCount/3*178;
    $userList.css("left","-"+listPositon+"px");
    t = null,f=null;
    $userList.width(userListCount * 178).attr("index","0");
    if($.cookie('token')) {
      var nick_name = localStorage.getItem('nick_name');
      var email = localStorage.getItem('email') || 'Account';
      $(".login").html("<div>" + email + "</div><div>You have successfully entered. Good luck!</div>").css({"color":"#37a7e1"});
      addFastCharger();
    }
    $(".winnerlist").on("click","i",function(event){
      clearInterval(t);
      clearTimeout(f);
      showWinner($(event.target).attr("date-key"))
      f = setTimeout(function(){
          t = setInterval(showWinner,2000);
      },4000)
    })
    $("#register").on("click",function(){
      var key = location.search.substr(1);
      location.href="/register?back=deals/fast_chargers_giveaway"+ (key ? "&" + key : "");
    })
    $("#login").on("click",function(){
      var key = location.search.substr(1);
      location.href="/login?back=deals/fast_chargers_giveaway&"+ (key ? "&" + key : "");
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
    //getUsers();
    $("#google").on("click",function(){
      var url = location.href;
      if(url.indexOf("?")<0){
        url = url + "?utm_source=website&utm_media=banner&utm_content=sub";
      }
       window.open("https://plus.google.com/share?url="+encodeURIComponent(url),'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
    })
    t = setInterval(showWinner,2000);
    setInterval(function(){
      var min = Math.floor((nowDate % (1000 * 60 * 60)) / (1000 * 60));
      var sec = Math.floor((nowDate % (1000 * 60)) / 1000);
      $(".timer").html("00:" + (min < 10 ? ("0" + min) : min) + ":" + (sec <10 ? ("0" + sec) : sec) ); 
      nowDate = nowDate == 0 ? 3600000 : nowDate-1000;
      if(nowDate== 3600000 ){
        location.reload();
        //getUsers();
      }
    },1000)
  }
function showWinner(type){
  type = type || "down";
  if(type === "down"){
    $userList.animate({"left":"-"+(listPositon+178)+"px"},1000,"linear",function(){
      var nowDom = $userList.children().eq(0);
      $userList.append(nowDom).css("left",-listPositon)
    })
  }else{

     $userList.animate({"left":"-"+(listPositon-178)+"px"},1000,"linear",function(){
        var nexDom =$userList.children().eq($userList.children().length-1);
        $userList.prepend(nexDom)
        $userList.css("left",-listPositon);
    })
  }
  
  /*
 var index = parseInt($userList.attr("index")),
     type = type || "down";
     if(type == "up" ){
        index = index == 0 ? userListCount : index - 1;
     }else{
        index = index == userListCount - 3 ? 0 : index + 1;
     }
     $userList.attr("index",index);
     $userList.css("transform","translate3d(-" + index * 178 + "px, 0, 0)");
     */
}
  function addFastCharger() {
      var  screens={};
      screens.width = Math.min(window.screen.width, window.innerWidth);
      screens.height = Math.min(window.screen.height, window.innerHeight);
      screens.colorDepth = window.screen.colorDepth || 0;
      var output = {
        'token': $.cookie('token')
      };
      document.cookie.split(/\s*;\s*/).forEach(function(pair) {
        pair = pair.split(/\s*=\s*/);
        if(pair[0] && /\[|=|\]/g.test(pair[0]) === false) {
          output[pair[0]] = pair.splice(1).join('=');
        }
      });
      $.ajax({
        method: 'POST',
        url: '/api/content?path=/api/deals/deals_audios/auto_charge',
        contentType: 'application/json',
        headers:output,
      }).done(function(res){
        
      }).fail(function(r) {
        var json = r && r.responseJSON;
        if (json.error) {
          alert(json.error);
        }
      }).always(function() {
      });
  }

  function getUsers() {
    
      var  screens={};
      var output = {};
      $.ajax({
        method: 'get',
        url: '/api/content?path=/api/deals/deals_audios/auto_charge_winners&count=500&date=' + new Date().getTime(),
        contentType: 'application/json',
        headers:output,
      }).done(function(res){
        var html = "";
        for(var i=0,g=res.winner.length;i<g;i++){
          var user = res.winner[i];
          var nowDate = new Date(new Date(user.updated_at).getTime()-1000*60*60*7);
          html +="<li><div>05/";
          html +=nowDate.getDate()<10 ? "0"+nowDate.getDate():nowDate.getDate();
          html +="/2016 ";
          html +=nowDate.getHours()<10?"0"+nowDate.getHours():nowDate.getHours();
          html+=":"
          html +=nowDate.getMinutes()<10?"0"+nowDate.getMinutes():nowDate.getMinutes();
          html +="PDT</div>";
          html +="<div>";
          html +=user.email.substr(0,2)+"***"+user.email.substr(user.email.indexOf("@"));
          html +="</div><div>Prize: ";
          html +=user.action;
          html += "</div></li>";
        }
        $("#userList").html(html+html+html);
        window.userListCount = $userList.children().length;
        window.listPositon = userListCount/3*178;
        $userList.css("left","-"+listPositon+"px");
        console.info(res);
      }).fail(function(r) {
        var json = r && r.responseJSON;
        if (json.error) {
          alert(json.error);
        }
      }).always(function() {
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
