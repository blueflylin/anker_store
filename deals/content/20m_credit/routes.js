var request = require('superagent');
var express = require('express');
var moment = require('moment-timezone');
var router = express.Router();
var config = require('../../../build/config').config;

router.get('/20m_credit',function(req, res, next){
  var origin = req.protocol + '://' + req.get('host');
  var invitation_code = req.query.ic || "";
  var pageIndex = Math.floor(Math.random(1) * 5);
 getApi("get","/api/products/search",{per_page:6,page:pageIndex == 0 ? 1 : pageIndex,label:"Anker Store"}, {'token': req.cookies ? req.cookies.token : ''}).then(function(data){
    res.render('content/20m_credit/default', {
      title: "Anker | 20 Million Happy Users Celebration",
      config: config,
      origin:origin,
      data:data.body.products.slice(0,2),
      data1:data.body.products.slice(2),
      invitation_code:invitation_code,
      verson: '8'
    });
  })
});
const getApi = (method, path, params, cookies) => new Promise(resolve => {
  var headers = {'platform': config.platform};
  if(cookies['token']) {
    headers['X-Spree-Token'] = cookies['token'];
  }
  request(method, config.api + path)
  .send(params)
  .set(headers)
  .accept('application/json')
  .end(function(err, res) {
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
