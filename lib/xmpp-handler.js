var sys = require('sys');

(function() {
  var Xmpp = function(){
    this.authenticated = false;
  };
  
  Xmpp.prototype = {
    authenticated: false,
    startAuthentication: function(clientxml){
      sys.puts('---client---\n' + clientxml);
      var reply = "";
      if ( /<stream:stream/.test(clientxml) ){ // setup xmpp handshake
        reply = '<?xml version="1.0" ?>' +
                  '<stream:stream ' +
                    'from="localhost" ' +
                    'id="voicegate" ' +
                    'xmlns="jabber:client" ' +
                    'xmlns:stream="http://etherx.jabber.org/streams" ' +
                    'version="1.0">';
        // socket.write(reply);
        // sys.puts('---server---');
        // sys.puts(reply);
        reply += '<stream:features>' +
                  // '<starttls xmlns="urn:ietf:params:xml:ns:xmpp-tls">' +
                  //   '<required/>' +
                  // '</starttls>' +
                  '<mechanisms xmlns="urn:ietf:params:xml:ns:xmpp-sasl">' +
                    // '<mechanism>DIGEST-MD5</mechanism>' +
                    '<mechanism>PLAIN</mechanism>' +
                  '</mechanisms>' +
                '</stream:features>';
      } else if ( /<starttls\s+xmlns=('|").+('|")\s*\/>/.test(clientxml) ) { // proceed tls encryption
        reply = '<proceed xmlns="urn:ietf:params:xml:ns:xmpp-tls"/>';
      } else if ( /<auth/.test(clientxml) ) {
        //reply = '<success xmlns="urn:ietf:params:xml:ns:xmpp-sasl"/>';
      } else if ( /<\/stream:stream>/.test(clientxml) ) {
        reply = '</stream:stream>';
      }
      sys.puts('---server---\n' + reply);
      return reply;
    }
  };
  
  module.exports = new Xmpp;
})();