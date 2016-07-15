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

router.all('/fast_chargers_giveaway/admin', (req, res, next) => {
  getApi('get', '/api/deals/deals_audios/all_entries', {
    "country_code": 'US',
    "zone": "1"
  }, {
    'token': req.cookies ? req.cookies.token : ''
  }).then(function(r) {
    if (r.status === 200) {
      var new_data = req.body;
      s3load(['chargers.json'], function(result) {
        var plData = eval('(' + result[0] + ')');
        if (new_data.type === 'data') {
          plData[new_data.country_code] = new_data.data;
          s3update('chargers.json', JSON.stringify(plData));
        }
        res.render('content/fast_chargers_giveaway/admin', {
          title: 'Anker | Car Charger',
          data: plData
        })
      });
    } else {
      res.redirect('/deals/fast_chargers_giveaway');
    }
  })
})


router.get('/fast_chargers_giveaway',function(req, res, next){
  var origin = req.protocol + '://' + req.get('host');
  s3load(['chargers.json'], function(result) {
    var plData = eval('(' + result[0] + ')');
    var d = new Date(),
        minutes = d.getMinutes(),
        seconds = d.getSeconds();
      if(seconds != 0){
          minutes =  minutes + 1;
          seconds =  seconds;
      }
      minutes = 60 - minutes;
      seconds = 60 - seconds;
    var nowDate = (minutes*60*1000)+ seconds*1000;

    getApi("get","/api/deals/deals_audios/auto_charge_winners",{count:500}, {'token': req.cookies ? req.cookies.token : ''}).then(function(data){
      
      data.body.winner.map(function(item,i){
        var nowDate = moment.tz(new Date(item.updated_at), "America/Los_Angeles").format("MM-DD-YYYY HH:mm");
        item.updated_at = nowDate;
        return item;
      })
      res.render('content/fast_chargers_giveaway/default', {
        title: "Anker | Car Charger",
        nowDate: nowDate,
        config: config,
        origin:origin,
        data:plData["us"],
        users:data.body,
        verson: '8'
      });
    })
    
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
