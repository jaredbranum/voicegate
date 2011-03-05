require.paths.unshift('.');

var sys = require('sys')
  , net = require('net')
  , tls = require('tls')
  , libxmljs = require("libxmljs")
  , tlsserver = tls.createServer(function (socket){
    
  })
  , tcpserver = net.createServer(function (socket) {

  // Every time someone connects, tell them hello and then close the connection.
  socket.addListener("connect", function () {
    sys.puts("Connection from " + socket.remoteAddress);
    //socket.write("<?xml version='1.0' encoding='UTF-8' ?><success xmlns=\"urn:ietf:params:xml:ns:xmpp-sasl\" />");
    //socket.end("Hello World\n");
  });
  
  socket.addListener("data", function(data){
    sys.puts('---client---');
    sys.puts(data);
    var reply;
    if ( /<stream:stream/.test(data) ){ // setup xmpp handshake
      reply = '<?xml version="1.0" ?>' +
                '<stream:stream ' +
                  'from="localhost" ' +
                  'id="voicegate" ' +
                  'xmlns="jabber:client" ' +
                  'xmlns:stream="http://etherx.jabber.org/streams" ' +
                  'version="1.0">';
      socket.write(reply);
      sys.puts('---server---');
      sys.puts(reply);
      reply = '<stream:features>' +
                '<starttls xmlns="urn:ietf:params:xml:ns:xmpp-tls">' +
                  '<required/>' +
                '</starttls>' +
                '<mechanisms xmlns="urn:ietf:params:xml:ns:xmpp-sasl">' +
                  '<mechanism>DIGEST-MD5</mechanism>' +
                  '<mechanism>PLAIN</mechanism>' +
                '</mechanisms>' +
              '</stream:features>';
      socket.write(reply);
      sys.puts('---server---');
      sys.puts(reply);
    } else if ( /<starttls\s+xmlns=('|").+('|")\s*\/>/.test(data) ) { // proceed tls encryption
      reply = '<proceed xmlns="urn:ietf:params:xml:ns:xmpp-tls"/>';
      socket.write(reply);
      sys.puts('---server---');
      sys.puts(reply);
      tls
    } else if ( /<\/stream:stream>/.test(data) ) {
      reply = '</stream:stream>';
      sys.puts('---server---');
      sys.puts(reply);
      //socket.end();
    }
    socket.write("");
  });
  

});

// XMPP server bound to port 5222 on localhost
tcpserver.listen(5222, "localhost");

// Put a friendly message on the terminal
console.log("VoiceGate XMPP gateway running on localhost port 5222");