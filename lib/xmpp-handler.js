require.paths.unshift('.');
var sys     = require('sys')
  , events  = require('events')
  , libxml  = require("libxmljs");

function Xmpp(){
  if ( false === (this instanceof Xmpp) ){
    return new Xmpp();
  }
  var self = this;
  events.EventEmitter.call(self);
  
  self.isAuthenticated = false;
  self.isXmlDocStarted = false;
  self.isXmlStreamOpen = false;
  self.xmlStreamStart = '<?xml version="1.0" ?><stream:stream from="localhost" id="voicegate" xmlns="jabber:client" xmlns:stream="http://etherx.jabber.org/streams" version="1.0">';
  self.xmlStreamEnd = '</stream:stream>';
  
  self.saxParser = new libxml.SaxPushParser(function(p){
    var xml;
    
    p.onStartDocument(function(){
      self.isXmlDocStarted = true;
    });
    
    p.onStartElementNS(function(elem, attrs, prefix, uri, namespaces){
      if ( !self.isXmlDocStarted ){
        return;
      } else if ( prefix == "stream" && elem == "stream" ){
        xml = self.xmlStreamStart + libxml.Document().node('stream:features', function(n){
          n.node('mechanisms', {'xmlns' : "urn:ietf:params:xml:ns:xmpp-tls"}, function(n){
            n.node('mechanism', {}, 'PLAIN');
          });
        }).toString();
        self.emit('reply', xml);
      }
    });
    
    p.onEndElementNS(function(elem, prefix, uri){
      if ( !self.isXmlDocStarted ){
        return;
      } else if ( prefix == "stream" && elem == "stream" ){
        self.emit('reply', self.xmlStreamEnd);
      }
    });
    
  });
};

sys.inherits(Xmpp, events.EventEmitter);
Xmpp.prototype.process = function(clientxml){
  this.saxParser.push(clientxml);
};
    
//     var reply = "";
//     if ( !this.isXmlStreamOpen && /<stream:stream/.test(clientxml) ){ // client opened XMPP stream
//       reply = this.xmlStreamStart;
//       reply += libxml.Document().node('stream:features', function(n){
//         n.node('mechanisms', {'xmlns' : "urn:ietf:params:xml:ns:xmpp-tls"}, function(n){
//           n.node('mechanism', {}, 'PLAIN');
//         });
//       }).toString();
//       this.isXmlStreamOpen = true;
//     // } else if ( /<starttls\s+xmlns=('|").+('|")\s*\/>/.test(clientxml) ) { // proceed tls encryption
//     //   reply = '<proceed xmlns="urn:ietf:params:xml:ns:xmpp-tls"/>';
//     // } else if ( /<auth/.test(clientxml) ) {
//     //   //reply = '<success xmlns="urn:ietf:params:xml:ns:xmpp-sasl"/>';
//     } else if ( this.isXmlStreamOpen ) {
//       if (/<\/stream:stream>/.test(clientxml) ) {
//         reply = this.xmlStreamEnd;
//         this.isXmlStreamOpen = false;
//       } else {
//         data = this.saxParser.push(clientxml);
//         
//       }
//     }
//     
//     return reply;
//   }
// };

module.exports = new Xmpp();