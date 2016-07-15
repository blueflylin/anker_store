var request = require('superagent');
var express = require('express');
var router = express.Router();
var config = {};

/* Aduio 页面方法 */
router.get('/pu_flash_deal', (req, res, next) => {
  config = res.locals.config;
  var cookies = req.cookies || {};
  var token = cookies.token || '';
  // console.log(cookies);
  getApi('/api/activities/flash_deal_show', {}, cookies).then(function(r) {
    var data = r && r.body || {};
    // console.log(data);
    var PUCountrys = config.pu_countrys || [];
    var profileCountry = data.country_code || 'US'; // PU以后台国家为准, 非: Cookie.load('country');
    var puCountry = PUCountrys.filter((item, i) => {return -1 != item.codes.indexOf(profileCountry)});
    puCountry = puCountry[0] && puCountry[0]['code'] || '';

    if (r.status === 402 || r.status === 401) {
      res.redirect('/login?back=poweruser');
    } else {
      res.render('views/pu_flash_deal', {
        verson: 2,
        title: 'Anker | PU FLASH DEAL',
        token: token,
        banner_text: `<p>At Anker, we’re committed to constant improvement through user feedback. Our Power User programme is one of the main ways we engage with users to learn how we can do better.</p>
        <p>As a Power User, you can sign up to receive free samples of existing and pre-release products in exchange for insightful and unbiased feedback.</p>
        <p>Try our products. Share your experience. Help us get it right.</p>`,
        data: data,
        pu_country: puCountry,
        amazon_domain: {
          'US': 'amazon.com',
          'CA': 'amazon.ca',
          'UK': 'amazon.co.uk',
          'FR': 'amazon.fr',
          'IT': 'amazon.it',
          'DE': 'amazon.de',
          'ES': 'amazon.es',
          'JP': 'amazon.co.jp',
        }[puCountry],
      });
    }
  });
});

const getApi = (path, params, cookies) => new Promise(resolve => {
  var headers = {
    'platform': config.platform
  };
  headers['country'] = (cookies['country'] || 'US').toUpperCase();
  if (cookies['token']) {
    headers['X-Spree-Token'] = cookies['token'];
  }
  request('get', config.api + path)
  .send(params)
  .set(headers)
  .accept('application/json')
  .end(function(err, res){
    try {
        resolve(res);
      } catch(e) {
        resolve({
          'body': {
            'title': 'Error',
            'content': 'Error',
          },
          'status': 404
        });
      }
  });
});


module.exports = router;
