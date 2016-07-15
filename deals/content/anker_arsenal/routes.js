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

router.all('/anker_arsenal/admin', (req, res, next) => {
  getApi('get', '/api/deals/deals_audios/all_entries', {
    "country_code": 'US',
    "zone": "1"
  }, {
    'token': req.cookies ? req.cookies.token : ''
  }).then(function(r) {
    if (r.status === 200) {
      var new_data = req.body;

      s3load(['anker_arsenal.json'], function(result) {
        var plData = eval('(' + result[0] + ')');
        console.info(result[0]);
        if (new_data.type === 'data') {
          plData[new_data.country_code] = new_data.data;
          s3update('anker_arsenal.json', JSON.stringify(plData));
        }
        res.render('content/anker_arsenal/admin', {
          title: 'Anker | anker_arsenal',
          data: plData
        })
      });
    } else {
      res.redirect('/deals/anker_arsenal');
    }
  })
})


router.get('/anker_arsenal',function(req, res, next){
  var origin = req.protocol + '://' + req.get('host');
  var d = new Date();
  d = moment.tz(d, "America/Los_Angeles");
  var nowDate = (new Date(moment.tz(new Date("2016-06-16T23:59:59-07:00"), "America/Los_Angeles").format()).getTime()) - (new Date(moment.tz(new Date(), "America/Los_Angeles").format()).getTime());
  s3load(['anker_arsenal.json'], function(result) {
    var plData = eval('(' + result[0] + ')');
    res.render('content/anker_arsenal/default', {
      title: "Anker | anker_arsenal",
      config: config,
      origin:origin,
      data:plData["us"],
      nowDate:nowDate,
      verson: '9'
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
