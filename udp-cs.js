//John Nolan
// udp-cs.js
// The client and server for my Nelson Mandela udp program

const dgram = require('dgram');
const adler = require('adler32');

const quote = '"It always seems impossible until it\'s done" - Nelson Mandela';

const server = dgram.createSocket('udp4'); // acts as client and server


server.on('message', function (msg, rinfo) {
	console.log('Received %s', msg);
});

server.on('listening', function() {
	console.log('Server listening at %s:%s', server.address().address, server.address().port); //${server.address().address}:${server.address().port}');
});

function send() { // create message and send it on the server
	
	//create buffers
	buf_ts = Buffer.alloc(8); // timestamp
	buf_ip = Buffer.alloc(4); // ip address
	buf_p = Buffer.alloc(2); // port
	buf_q = Buffer.from(quote); //quote
	buffer = Buffer.concat([buf_ts, buf_ip, buf_p, buf_q], 14 + quote.length);

	//calculate checksum
	sum = adler.sum(buffer);
	buf_cs = Buffer.alloc(4); // add check sum to buffer 
	buf_cs.writeUInt32BE(sum, 0);
	buffer = Buffer.concat([buf_cs, buffer], buf_cs.length + buffer.length);

	//TODO: specify sending and listening port
	server.send(buffer, 40001, function(err) {
		console.log("Sent");
	});
	
};


setTimeout(send, 2000); 
// send every 2 seconds (this sends once)

server.bind(40001);
// begin listening for another client
