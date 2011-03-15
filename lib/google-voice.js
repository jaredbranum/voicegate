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
  events.EventEmitter.call(self);
};
sys.inherits(GoogleVoice, events.EventEmitter);

GoogleVoice.prototype.login = function(user, pass){
  if ( contacts.login(user, pass) ){
    console.log('success');
  } else {
    console.log('failure');
  }
};
GoogleVoice.prototype.send = function(to, text){
  console.log('sending sms to: '+to);
};

module.exports = new GoogleVoice();