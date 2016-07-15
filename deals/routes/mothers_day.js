var request = require('superagent');
var express = require('express');
var moment = require('moment-timezone');
var router = express.Router();
var config = require('../../build/config').config;
var fs = require("fs");
var path = require('path');
router.get('/mothers_day',function(req, res, next){
  var origin = req.protocol + '://' + req.get('host');
    res.render('views/mothers_day', {
      title: "Anker | Mother's Day",
      origin: origin,
      config: config,
      verson: '6',
    });
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
