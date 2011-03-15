require.paths.unshift('.');
var sys      = require('sys')
  , events   = require('events')
  , https    = require('https')
  , contacts = require('google-contacts');

var GoogleVoice = function(){
  var self = this;
  if ( (self instanceof GoogleVoice) === false ){
    return new GoogleVoice();
  }
  self.authToken = null;
  self._rnr_se = null;
  self._gcData = null;
  events.EventEmitter.call(self);
};
sys.inherits(GoogleVoice, events.EventEmitter);

GoogleVoice.prototype.login = function(user, pass, cb){
  var self = this;
  var req = https.request({
    host: 'www.google.com',
    port: '443',
    path: '/accounts/ClientLogin?alt=json',
    method: 'POST',
    headers: { 'content-type' : 'application/x-www-form-urlencoded' }
  }, function(res){
    var data = '';
    res.on('data', function(chunk){
      data += chunk;
    });
    res.on('end', function(){
      var success = false;
      if ( res.statusCode == 200 ){
        var authMatch = /Auth=(.+)[\r\n]/.exec(data.toString());
        if ( authMatch.length > 1 ){
          self.authToken = authMatch[1];
          success = true;
          self.parseInboxHtml(function(r, html){            
            if ( cb ){
              cb(success, res, data, html);
            }
          });
        }
      }
    });
  });
  req.write(
    'accountType=GOOGLE&' +
    'Email=' + user + '&' +
    'Passwd=' + pass + '&' +
    'service=grandcentral&' +
    'source=UnlimitedSoftware-VoiceGate-0.1'
  );
  req.end();
};
GoogleVoice.prototype.parseInboxHtml = function(cb){
  var self = this;
  var req = https.get({
    host: 'www.google.com',
    port: '443',
    path: '/voice',
    headers: { 'Authorization' : 'GoogleLogin auth='+this.authToken }
  }, function(res){
    var html = '';
    res.on('data', function(chunk){
      html += chunk;
    });
    res.on('end', function(){
      html = html.toString().replace(/\n/g, ' ');
      // GV JS contains tons of single quotes - invalid in v8's JSON.parse
      eval( 'self.' + /(_gcData\s*=\s*\{.*\};)/.exec(html)[1] );
      self._rnr_se = self._gcData._rnr_se;
      if ( cb ){
        cb(res, html);
      }
    });
  });
};
GoogleVoice.prototype.smsInbox = function(cb){
  if ( this.authToken ){
    https.get({
      host: 'www.google.com',
      port: '443',
      path: '/voice/inbox/recent/sms/',
      headers: { 'Authorization' : 'GoogleLogin auth='+this.authToken }
    }, function(res){
      var data = '';
      res.on('data', function(d){
        data += d;
      });
      if ( cb ){
        res.on('end', function(){
          cb(res, d);
        });
      }
    });
  }
}
GoogleVoice.prototype.sendSms = function(to, text){
  console.log('sending sms to: ' + to);
  var req = https.request({
    host: 'www.google.com',
    port: '443',
    path: '/voice/sms/send/',
    method: 'POST',
    headers: { 'content-type'  : 'application/x-www-form-urlencoded',
               'Authorization' : 'GoogleLogin auth='+this.authToken }
  }, function(res){});
  req.write(
    'id=' +
    '&phoneNumber=' + to +
    '&text=' + text +
    '&_rnr_se=' + this._rnr_se
  );
  req.end();
};

module.exports = new GoogleVoice();