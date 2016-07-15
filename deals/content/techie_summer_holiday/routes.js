var request = require('superagent');
var express = require('express');
var router = express.Router();
var moment = require('moment-timezone');
var config = {};

router.get('/tsh', (req, res, next) => {
  config = res.locals.config;
  var origin = req.protocol + '://' + req.get('host');
  var invitation_code = req.query.ic || "";
  var d = new Date();
  d = moment.tz(d, "America/Los_Angeles");
  var nowDate = (new Date(moment.tz(new Date("2016-05-29T23:59:59-07:00"), "America/Los_Angeles").format()).getTime()) - (new Date(moment.tz(new Date(), "America/Los_Angeles").format()).getTime());
  res.render('content/techie_summer_holiday/default', { title: 'Anker | Techie Summer Holiday', config:config,nowDate:nowDate,token: (req.cookies ? req.cookies.token:''),verson:"3",origin:origin,invitation_code:invitation_code});
});
const getApi = (path, params) => new Promise(resolve => {
  // console.log(config.api + path);
  request('get', config.api + path)
  .send(params)
  // .set(headers)
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
