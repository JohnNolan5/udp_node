//John Nolan
// udp-cs.js
// The client and server for my Nelson Mandela udp program


//npm modules
const dgram = require('dgram');
const adler = require('adler32');
const Uint64BE = require('int64-buffer').Uint64BE; // library to load 64 bytes to a buffer
const ipaddr = require('ipaddr.js');
const argv = require('minimist')(process.argv.slice(2)); // parse arguments into an object


//constants
const quote = '"It always seems impossible until it\'s done" - Nelson Mandela';
const server = dgram.createSocket('udp4'); // acts as client and server


// arguments
var dest_address = ''; // server address
var dest_port = 0;

if (argv.s) {
	var address = argv.s.split(':'); // provided as host:port
	dest_address = address[0];
	dest_port = address[1];
}

const port = argv.p || 0;

if (!port) {
	var err = new Error('Argument "-p" is required');
	throw err;
}


// map datastructure for counting messages from each address
var server_counts = new Map();


server.on('message', (msg) => { // TODO rinfo (second arg) passes that data, should I exclude it?

	/***
	 parse the message from a client
	 the format is specific to client messages
	 we will need another case for responses from a server
	***/

	var cs = adler.sum(msg.slice(4));

	if (cs == msg.readUInt32BE(0)) {	

		console.log('%s', msg.slice(18)); //quote

		var time_sent = new Uint64BE(msg, 4); // read time stamp
		var time_diff = Date.now() - time_sent.toNumber();
		console.log('Transfer time: %d', time_diff);

		var address = ipaddr.fromByteArray(msg.slice(12, 16)); // load address 
		console.log('Source address: %s', address.toString());

		var port = msg.readUInt16BE(16); // load client port, to which the server can respond
		console.log('Client port: %s', port.toString());

		var count = server_counts.get(address.toString()) || 0; // get current message count
		server_counts.set(address.toString(), count + 1); // update count
		

		console.log('Received %d message(s) from this address\n', count + 1);

	} else {
		var err = new Error('Checksums do not match, message corrupted');
		throw err;
	}

});


server.on('listening', () => {
	console.log('Listening at %s:%s', server.address().address, server.address().port); //${server.address().address}:${server.address().port}');
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
	var buf_ip = Buffer.from(address.octets); // ip address buffer (4 bytes)

	var buf_p = Buffer.alloc(2); // port (2 bytes)
	buf_p.writeUInt16BE(server.address().port, 0); // send client port for possible responses

	var buf_q = Buffer.from(quote); //quote
	var buffer = Buffer.concat([buf_ts, buf_ip, buf_p, buf_q], 14 + quote.length);

	//calculate checksum
	var sum = adler.sum(buffer);
	var buf_cs = Buffer.alloc(4); // add check sum to buffer 
	buf_cs.writeUInt32BE(sum, 0);
	buffer = Buffer.concat([buf_cs, buffer], buf_cs.length + buffer.length);

	server.send(buffer, dest_port, dest_address, (err) => {
		if (err) {
			console.log(err.message);
		}
	});
	
}


if (dest_address.length) { // address assigned: act as client
	setInterval(send, 2000); 
	// send every 2 seconds 
}


server.bind(port);
// begin listening for responses

