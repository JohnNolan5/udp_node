//John Nolan
// udp-cs.js
// The client and server for my Nelson Mandela udp program

const dgram = require('dgram');
const adler = require('adler32');
const Uint64BE = require('int64-buffer').Uint64BE; // library to load 64 bytes to a buffer
const ipaddr = require('ipaddr.js');

const quote = '"It always seems impossible until it\'s done" - Nelson Mandela';

const server = dgram.createSocket('udp4'); // acts as client and server

server.on('message', (msg, rinfo) => {

	var cs = adler.sum(msg.slice(4));

	if (cs == msg.readUInt32BE(0)) {	

		console.log('Received %s', msg.slice(18));

		var time_sent = new Uint64BE(msg, 4); // read time stamp
		var time_diff = Date.now() - time_sent.toNumber();
		console.log('Time to send: %d', time_diff);

		var address = ipaddr.fromByteArray(msg.slice(12, 16));
		console.log('Source address: %s', address.toString());
		
		var port = msg.readUInt16BE(16);
		console.log('Sent port: %s', port.toString());
	} else {
		console.log('Error: message corrupted');
	}

});

server.on('listening', () => {
	console.log('Server listening at %s:%s', server.address().address, server.address().port); //${server.address().address}:${server.address().port}');
});

function send() { // create message and send it on the server

	/***
	Sends a message in the following format

	[ checksum (4 bytes) | timestamp (8 bytes) | ip address (4 bytes) | port (2 bytes) | message ]
	***/
	
	//create buffers
	var stamp = Uint64BE(Date.now()); // timestamp (8 bytes)
	var buf_ts = stamp.toBuffer();
	
	var address = ipaddr.parse(server.address().address); // parse string into byte representation
	var buf_ip = Buffer.from(address.octets); // ip address buffer

	var buf_p = Buffer.alloc(2); // port (
	buf_p.writeUInt16BE(server.address().port, 0);
	console.log("port: %d", server.address().port);

	var buf_q = Buffer.from(quote); //quote
	var buffer = Buffer.concat([buf_ts, buf_ip, buf_p, buf_q], 14 + quote.length);

	//calculate checksum
	var sum = adler.sum(buffer);
	var buf_cs = Buffer.alloc(4); // add check sum to buffer 
	buf_cs.writeUInt32BE(sum, 0);
	buffer = Buffer.concat([buf_cs, buffer], buf_cs.length + buffer.length);

	//TODO: specify sending and listening port
	server.send(buffer, 40001, (err) => {
		//TODO: handle errors
	});
	
}

//TODO: if else here for when we start as client / server
setInterval(send, 2000); 
// send every 2 seconds (this sends once)

server.bind(40001);
// begin listening for another client
