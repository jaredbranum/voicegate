require.paths.unshift('./lib');

var sys       = require('sys')
  , net       = require('net')
  , tls       = require('tls')
  , fs        = require('fs')
  , xmpp      = require('xmpp-handler')
  , libxmljs  = require("libxmljs")
  , tlsserver = tls.createServer({
    key:  fs.readFileSync('voicegate-key.pem'),
    cert: fs.readFileSync('voicegate-cert.pem')
  }, function (socket) {})
  , tcpserver = net.createServer(function (socket) {

  // Every time someone connects, tell them hello and then close the connection.
  socket.addListener("connect", function () {
    sys.puts("Connection from " + socket.remoteAddress);
    //socket.write("<?xml version='1.0' encoding='UTF-8' ?><success xmlns=\"urn:ietf:params:xml:ns:xmpp-sasl\" />");
    //socket.end("Hello World\n");
  });
  
  socket.addListener("data", function(data){
    var reply = undefined;
    if ( !xmpp.authenticated ){
      reply = xmpp.startAuthentication(data);
    }
    
    if ( reply !== undefined ){
      socket.write(reply);
    }
  });
  

});

// XMPP server bound to port 5222 on localhost
tcpserver.listen(5222, "localhost");

// Put a friendly message on the terminal
console.log("VoiceGate XMPP gateway running on localhost port 5222");