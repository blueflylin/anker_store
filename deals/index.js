var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var moment = require('moment-timezone');
var config = require('../build/config').config;

var deals = express();
const DEBUG = !process.argv.includes('--release');

// deals.use(require("connect-assets")());

// uncomment after placing your favicon in /public
deals.use(bodyParser.json());
deals.use(bodyParser.urlencoded({
  extended: true
}));
deals.use(cookieParser());
// view engine setup
deals.use(sassMiddleware({
  /* Options */
  src: path.join(__dirname, '../deals'),
  dest: path.join(__dirname, '../deals'),
  debug: false,
  outputStyle: 'compressed'
}));
deals.use(express.static(path.join(__dirname, process.env.NODE_ENV ? '../build/deals' : '../deals')));

//deals.use(express.static(path.join(__dirname, process.env.NODE_ENV ? '../build/deals' : '../build/deals')));

//deals.set('views', path.join(__dirname, process.env.NODE_ENV ? '../build/deals/views':'../deals/views'));
//deals.set('views', path.join(__dirname, process.env.NODE_ENV ? '../build/deals/views':'../deals'));
deals.set('views', path.join(__dirname, process.env.NODE_ENV ? '../build/deals':'../deals'));
deals.set('view engine', 'jade');
// deals.set('view options', { debug: false });

 //模版和路由内config带入
var config = require('../build/config').config;
deals.use(function(req, res, next) {
  const query = req.query;
  const oneday = 1000 * 60 * 60 * 24;
  res.locals.config = config; // *.jade: #{config.xxx}; ./routes/*.js: config = res.locals.config;
  var ads = [];
  if(query.utm_source) {
    ads.push(`utm_source=${query.utm_source || ''}&utm_media=${query.utm_media || query.utm_medium || ''}&utm_content=${query.utm_content || ''}&utm_term=${query.utm_term || ''}`);
  }
  if(query.ref) {
    ads.push(`ref=${query.ref}`);
  }
  if(query.tag) {
    ads.push(`tag=${query.tag}`);
  }
  ads = ads.join('&');
  if (ads) {
    res.cookie('ref_ads', ads, { path: '/', maxAge: oneday * 15 }); // 给其他API使用
    const fullUrl =  `${(req.protocol || 'http')}://${req.get('host')}${req.originalUrl}`
    res.cookie('reg_source', fullUrl, { path: '/', maxAge: oneday * 15 });
    // console.log('fullUrl', fullUrl);
  }
  // quick fix : reg_source 记录的url少了deals
  var regSource = req.cookies && req.cookies.reg_source || '';
  var rsMatch = regSource.match(new RegExp(req.get('host') + '/(ingress|fathers_day)', 'i'));
  // console.log('regSource', regSource, rsMatch);
  if (rsMatch) {
    regSource = regSource.replace(req.get('host'), `${req.get('host')}/deals`);
    // console.log('regSource', regSource);
    res.cookie('reg_source', regSource, { path: '/', maxAge: oneday * 15 });
  }

  var amazonTag = req.query.utm_term;
  if(!amazonTag) {
    var adsData = req.cookies && req.cookies.ref_ads || '';
    adsData = adsData.match(/utm_term=([^&]*)/);
    amazonTag = adsData && adsData[1];
    // console.log(adsData, amazonTag);
  }
  res.locals.amazonTag = amazonTag; // jade: href="#{amazonTag ? amazonUrl.replace(/&tag=[^&]+/, '&tag=' + amazonTag) : amazonUrl}"
  // console.log('amazonTag', amazonTag);
  next();
})

// deals.get('/music_for_you', require('../deals/routes/audio'));

deals.all(['/dealsconfig',"/dealsconfig/*"], require('../deals/content/dealsConfig/routes'));

// 10000hours
deals.get(['/10000hours', '/10000hours/m'], require('../deals/routes/10000hours'));

//powerline 专题
deals.get('/powerline_lightning', require('../deals/routes/powerline'));

//qc
deals.all(['/anker_qc', '/anker_qc/*'], require('../deals/routes/qc'));

//deals.get('/ingress_giveaway', require('../deals/routes/ingress'));


//deals.all(['/powerline_swap', '/powerline_swap/admin'], require('../deals/routes/powerline_swap'));

//deals.get('/slimshell_galaxy_s7', require('../deals/routes/protection'));

//deals.get('/home_vacduo', require('../deals/routes/homeVacDuo'));

//deals.all(['/powerhouse','/ph','/powerhousedetail'], require('../deals/routes/powerHouse'));

deals.get('/pu_flash_deal', require('../deals/routes/puFlashDeal'));

//deals.get('/mothers_day', require('../deals/routes/mothers_day'));

//deals.all(['/fast_chargers_giveaway','/fast_chargers_giveaway/admin'], require('../deals/content/fast_chargers_giveaway/routes'));

//deals.get('/usb-c', require('../deals/content/usbc/routes'));
//deals.get('/tsh', require('../deals/content/techie_summer_holiday/routes'));

//var nowDate = (new Date(moment.tz(new Date("2016-06-16T00:00:00-07:00"), "America/Los_Angeles").format()).getTime()) - (new Date(moment.tz(new Date(), "America/Los_Angeles").format()).getTime());
//if(nowDate >0){
  deals.all(['/ingress2','/ingress2/*'], require('../deals/content/ingress2/routes'));
//}
//nowDate = (new Date(moment.tz(new Date("2016-06-20T00:00:00-07:00"), "America/Los_Angeles").format()).getTime()) - (new Date(moment.tz(new Date(), "America/Los_Angeles").format()).getTime());
//if(nowDate >0){
  //deals.all(['/fathers_day','/fathers_day/*'], require('../deals/content/fathers_day/routes'));
//}

//deals.all(['/20m_credit','/20m_credit/*'], require('../deals/content/20m_credit/routes'));

deals.all(['/how_fast_is_quick_charge','/how_fast_is_quick_charge/*'], require('../deals/content/how_fast_is_quick_charge/routes'));

deals.all(['/anker_arsenal','/anker_arsenal/*'], require('../deals/content/anker_arsenal/routes'));
deals.all(['/pokessentials','/pokessentials/*'], require('../deals/content/anker_pokemongo/routes'));

module.exports = deals;
