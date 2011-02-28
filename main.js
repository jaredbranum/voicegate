var sys = require('sys');
var net = require('net');
var server = net.createServer(function (socket) {

  // Every time someone connects, tell them hello and then close the connection.
  socket.addListener("connect", function () {
    sys.puts("Connection from " + socket.remoteAddress);
    //socket.write("<?xml version='1.0' encoding='UTF-8' ?><success xmlns=\"urn:ietf:params:xml:ns:xmpp-sasl\" />");
    //socket.end("Hello World\n");
  });
  
  socket.addListener("data", function(data){
    sys.puts('---');
    sys.puts(data);
    var reply = "<?xml version='1.0' ?><stream:stream xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams' id='c2s_123' from='example.com' version='1.0'>";
    socket.write("");
  });
  

});

// Fire up the server bound to port 7000 on localhost
server.listen(5222, "localhost");

// Put a friendly message on the terminal
console.log("TCP server listening on port 5222 at localhost.");