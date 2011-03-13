require.paths.unshift('.');
var sys     = require('sys')
  , events  = require('events')
  , libxml  = require("libxmljs");

var Xmpp = function(){
  var self = this;
  if ( (self instanceof Xmpp) === false ){
    return new Xmpp();
  }
  events.EventEmitter.call(self);
  
  self.xml = {
    isDocStarted: false,
    streamStart: '<?xml version="1.0" ?><stream:stream from="localhost" id="voicegate" xmlns="jabber:client" xmlns:stream="http://etherx.jabber.org/streams" version="1.0">',
    streamEnd: '</stream:stream>',
    openTags: [],
    charStream: '',
    getOpenTag: function(){
      var len = self.xml.openTags.length;
      if (len > 0){
        return self.xml.openTags[len-1];
      } else return null;
    }
  };
  self.Auth = {
    isAuthenticated: false,
    mechanism: '',
    authString: ''
  };
  self.xmlStreamStart = '<?xml version="1.0" ?><stream:stream from="localhost" id="voicegate" xmlns="jabber:client" xmlns:stream="http://etherx.jabber.org/streams" version="1.0">';
  self.xmlStreamEnd = '</stream:stream>';
  
  self.saxParser = new libxml.SaxPushParser(function(p){
    var xmlResp;
    
    p.onStartDocument(function(){
      self.xml.isDocStarted = true;
    });
    
    p.onStartElementNS(function(elem, attrs, prefix, uri, namespaces){
      if ( !self.xml.isDocStarted ){
        return;
      }
      self.xml.openTags.push({'elem': elem, 'attrs': attrs, 
        'prefix': prefix, 'uri': uri, 'namespaces': namespaces
      });
      if ( prefix == "stream" && elem == "stream" ){
        xmlResp = self.xml.streamStart + libxml.Document().node('stream:features', function(n){
          n.node('mechanisms', {'xmlns' : "urn:ietf:params:xml:ns:xmpp-tls"}, function(n){
            n.node('mechanism', {}, 'PLAIN');
          });
        }).toString();
        self.emit('reply', xmlResp);
      }
    });
    
    p.onCharacters(function(chars){
      self.xml.charStream += chars;
    });
    
    p.onEndElementNS(function(elem, prefix, uri){
      if ( !self.xml.isDocStarted ){
        return;
      }
      var tag = self.xml.openTags.pop();
      if ( !tag || !tag.elem || tag.elem != elem ){ return; }
        
      if ( prefix == "stream" && elem == "stream" ){
        self.emit('reply', self.xml.streamEnd);
      } else if ( elem == "auth" ){
        var buf = new Buffer(self.xml.charStream, 'base64').toString().split('\u0000');
        if ( buf.length > 2 ){
          console.log('username is: '+ buf[1]);
          console.log('password is: '+ buf[2]);
        }
      }
      
      self.xml.charStream = '';
    });
    
  });
};

sys.inherits(Xmpp, events.EventEmitter);
Xmpp.prototype.process = function(clientxml){
  this.saxParser.push(clientxml);
};

module.exports = new Xmpp();