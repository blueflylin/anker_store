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

router.all('/dealsConfig', (req, res, next) => {
  getApi('get', '/api/deals/deals_audios/all_entries', {
    "country_code": 'US',
    "zone": "1"
  }, {
    'token': req.cookies ? req.cookies.token : ''
  }).then(function(r) {
    if (r.status === 200) {
      var new_data = req.body;
      s3load(['dealsConfig.json'], function(result) {
        var plData = eval('(' + result[0] + ')');
        if (new_data.type === 'data') {
          delete new_data.type;
          var newData = {};
          for(var i = 0;i<1000;i++){
            if(new_data["key"+i]){
                newData[new_data["key"+i]] = new_data["value"+i];
            }else{
              break;
            }
          }
          plData = newData;
          //console.info(newData);
          s3update('dealsConfig.json', JSON.stringify(newData));
        }
        res.render('content/dealsConfig/admin', {
          title: 'Anker | config',
          data: plData
        })
      });
    } else {
      res.redirect('/index');
    }
  })
})
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
