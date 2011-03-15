require.paths.unshift('./lib');

var xmpp
  , host        = "localhost"
  , sys         = require('sys')
  , net         = require('net')
  , tls         = require('tls')
  , fs          = require('fs')
  , xmppHandler = require('xmpp-handler')
  , tcpServer   = net.createServer(function (socket){
    socket.on("connect", function () {
      xmpp = new xmppHandler();
      sys.puts("Connection from " + socket.remoteAddress);
    });  
    socket.on("data", function(data){
      sys.puts('---client---\n' + data);
      xmpp.process(data.toString());
    });  
    xmpp.on('reply', function(xmlresp){
      sys.puts('---server---\n' + xmlresp);
      socket.write(xmlresp);
    });
  });

// XMPP server bound to port 5222 on localhost
tcpServer.listen(5222, host);
console.log("VoiceGate XMPP gateway running on "+host+" port 5222");