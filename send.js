//John Nolan
//send.js
//Send a message following specific protocol for FG

// npm modules
const Uint64BE =  require('int64-buffer').Uint64BE; // library to load 64 bytes to a buffer
const ipaddr = require('ipaddr.js');
const adler = require('adler32');

// constants
const quote = '"It always seems impossible until it\'s done" - Nelson Mandela';

// send a message
module.exports = {
	send: function (server, dest_port, dest_address) { // create message and send it on the server

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

};
