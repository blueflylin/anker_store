var __host = window.config && config.host || 'www.anker.com';
// console.log(typeof __host);
window.AppActions = {
  getUser: function() {
    return {
      'token': $.cookie('token') || '',
      'order_id': $.cookie('order_id') || '',
      'order_token': $.cookie('order_token') || '',
      'email': localStorage.getItem('email') || '',
      'nick_name': localStorage.getItem('nick_name') || localStorage.getItem('email') || 'Account',
      'avatar': localStorage.getItem('avatar_image') || '',
      'loginType': localStorage.getItem('loginType'),
      'invitation_code': localStorage.getItem('invitation_code') || '',
      'is_power_user': localStorage.getItem('is_power_user') || '',
    };
  },
  getCountry: function() {
    return $.cookie('country');
  },
  setCart: function(n) {
    if(this.getCountry() == 'US') {
      n = n || 0;
      $.cookie('cart_count', n, { expires: 365, path: '/' });
      var cartCount = document.getElementById('cartCount');
      if (cartCount) {
        cartCount.innerHTML = n;
        if(n  == 0) {
          cartCount.classList.add('hide');
        } else {
          cartCount.classList.remove('hide');
        }
      };
    }
  },
  signOut: function() {
    $.removeCookie('token', {path: '/'});
    $.removeCookie('order_id', {path: '/'});
    $.removeCookie('order_token', {path: '/'});
    $.removeCookie('cart_count', {path: '/'});
    this.setCart(0);
    localStorage.removeItem('email');
    localStorage.removeItem('profile');
    localStorage.removeItem('nick_name');
    localStorage.removeItem('avatar_image');
    localStorage.removeItem('invitation_code');
    localStorage.removeItem('user_password');
    localStorage.removeItem('order_price');
    localStorage.removeItem('purchase');
    localStorage.removeItem('country_code');
    localStorage.removeItem('user_id');
    ga('set', 'userId', null );
    if(window._maq) {
      window._maq = [['_setAccount', __host]];
    }
  },
  signIn: function(json) {
    // return console.log([['_setUID', 111], ['_setAccount', __host]]);
    $.cookie('token', json.token, { expires: 365, path: '/' });
    if (json.id) {
      localStorage.setItem('user_id', json.id);
      ga('create', config.GOOGLE_TRACKING_ID, {user_id: json.id});
      if(window._maq) {
        window._maq = [['_setUID', json.id], ['_setAccount', __host]];
      }
      ga('set', 'userId', json.id);
      ga('set', 'dimension1', json.id);
    }
    if (json.email) localStorage.setItem('email', json.email);
    if (json.nick_name) localStorage.setItem('nick_name', json.nick_name);
    json.is_power_user ? localStorage.setItem('is_power_user', '1') : localStorage.removeItem("is_power_user");
    if (json.order_id && json.order_token) {
      $.cookie('order_id', json.order_id, { expires: 365, path: '/' });
      $.cookie('order_token', json.order_token, { expires: 365, path: '/' });
    } else {
      $.cookie('order_id', null, {path: '/'});
      $.cookie('order_token', null, {path: '/'});
      this.setCart(0);
    }
    json.loginType ? localStorage.setItem('loginType', json.loginType) : localStorage.removeItem('loginType');
    localStorage.removeItem('user_password');
    localStorage.removeItem('order_price');
    localStorage.removeItem('purchase');
  },
  getUrlParam: function() {
    var search = location.search.replace('?', '').split('&');
    var params = {};
    for (var i in search) {
      var key = search[i].split('=')[0];
      var value = search[i].split('=')[1];
      params[key] = value;
    }
    return params;
  }
};
function ThirdLogin(){
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
    window.fbAsyncInit = function() {
      FB.init({
        appId      : config.FB_APP_ID,
        xfbml      : true,
        version    : 'v2.5'
      });
    };
}
ThirdLogin.prototype = {
  facebookLoginDig :function(callback) {
    var _this = this;
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
            _this.third_party_login(user, callback);
          }
        });
      }
    }, {scope: 'public_profile,email,user_birthday'});
  },
  googleLoginDig : function(callback) {
    var webconfig = {
      'client_id': config.GOOGLE_APP_ID,
      'scope':'https://www.googleapis.com/auth/userinfo.email',
      'collection': 'visible'
    },_this = this;
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
          _this.third_party_login(user, callback);
        });
      });
    })
  },
  third_party_login : function(user,callback){
    user.inviter_code = window.invitation_code;
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
        AppActions.setCart(json.item_count);
        callback && callback();
        /*if (json.is_first_login) {
          dialog.confirm({
            'title': "Welcome to anker.com! ",
            'content': "Update your country to USA on your Profile Page to receive your Anker Store coupons. <br>The coupons are not valid for Amazon or non-US orders."
          });
        }*/
      }
    })
  }
}
function Share(){

}
