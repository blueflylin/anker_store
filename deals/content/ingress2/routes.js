var request = require('superagent');
var express = require('express');
var moment = require('moment-timezone');
var router = express.Router();
var config = require('../../../build/config').config;
var fs = require("fs");
var path = require('path');
var AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey
});

router.all('/ingress2/admin', (req, res, next) => {
  getApi('get', '/api/deals/deals_audios/all_entries', {
    "country_code": 'US',
    "zone": "1"
  }, {
    'token': req.cookies ? req.cookies.token : ''
  }).then(function(r) {
    if (r.status === 200) {
      var new_data = req.body;
      s3load(['ingressLang.json'], function(result) {
        var plData = eval('(' + result[0] + ')');
        if (new_data.type === 'lang') {
          plData[new_data.country_code] = new_data.lang;
          s3update('ingressLang.json', JSON.stringify(plData));
        }
        res.render('content/ingress2/admin', {
          title: 'Anker | Car Charger',
          lang: plData,
          data: {}
        })
      });
    } else {
      res.redirect('/deals/ingress2');
    }
  })
})


router.get('/ingress2',function(req, res, next){
  config = res.locals.config;
  var origin = req.protocol + '://' + req.get('host');
  
  s3load(['ingressLang.json'], function(result) {
    var plLang = eval('(' + result[0] + ')');
    var country_code = req.query.country_code || "US";
    var lanList = plLang[country_code] || plLang["US"];
    res.render('content/ingress2/default', { title: 'Anker | Ingress Giveaway',lang: lanList,country: country_code, config:config,token: (req.cookies ? req.cookies.token:''),verson:"3",origin:origin});
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
function s3update(key, data) {
  var s3 = new AWS.S3({
    params: {
      Bucket: 'm-anker-com', //Bucket路径
      Key: key, //檔案名稱
      ACL: 'public-read' //檔案權限
    }
  });
  s3.upload({
    Body: data
  }, function(err, data) {
    console.log(err)
  })
}

function s3load(keys, callback) {
  var result = [];
  keys.map(function(item) {
    var s3 = new AWS.S3({
      params: {
        Bucket: 'm-anker-com', //Bucket路径
        Key: item //檔案名稱
      }
    });
    s3.getObject().on('httpData', function(chunk) {
      result.push(chunk.toString('utf8'))
    }).on('httpDone', function() {
      if (result.length >= keys.length) {
        callback(result);
      }
    }
    ).send();
  })
}

module.exports = router;
