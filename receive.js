//John Nolan
//receive.js
// a function to receive a message in the specific format for FG

//npm modules
const Uint64BE =  require('int64-buffer').Uint64BE; // library to load 64 bytes to a buffer
const ipaddr = require('ipaddr.js');
const adler = require('adler32');

// map datastructure for counting messages from each address
var server_counts = new Map()

module.exports = {

	parse: function (msg) {

		/***
		 parse the message from a client
		 the format is specific to client messages
		 we will need another case for responses from a server
		***/

		var cs = adler.sum(msg.slice(4));

		if (cs == msg.readUInt32BE(0)) {	
			
			console.log(msg.slice(18) + "\n"); //quote

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

	}

};

