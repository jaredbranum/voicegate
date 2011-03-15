require.paths.unshift('.');
var sys      = require('sys')
  , https    = require('https')

var GoogleContacts = function(){
  var self = this;
  if ( (self instanceof GoogleContacts) === false ){
    return new GoogleContacts();
  }
  self.authToken = null;
};

GoogleContacts.prototype = {
  login: function(u,p,cb){
    var self = this;
    var req = https.request({
      host: 'www.google.com',
      port: '443',
      path: '/accounts/ClientLogin?alt=json',
      method: 'POST',
      headers: { 'content-type' : 'application/x-www-form-urlencoded' }
    }, function(res){
      res.on('data', function(d){
        var success = false;
        if ( res.statusCode == 200 ){
          var authMatch = /Auth=(.+)[\r\n]/.exec(d.toString());
          if ( authMatch.length > 1 ){
            self.authToken = authMatch[1];
            success = true;
          }
        }
        if ( cb ){
          cb(success, res, d);
        }
      });
    });
    req.write(
      'accountType=GOOGLE&' +
      'Email=' + u + '&' +
      'Passwd=' + p + '&' +
      'service=cp&' +
      'source=UnlimitedSoftware-VoiceGate-0.1'
    );
    req.end();
  },
  getContacts: function(){
    // TODO
  }
}

module.exports = new GoogleContacts();