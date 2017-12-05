// John Nolan
// receive.js
// a function to receive a message in the specific format for FG

// npm modules
const Uint64BE = require('int64-buffer').Uint64BE; // library to load 64 bytes to a buffer
const ipaddr = require('ipaddr.js');
const adler = require('adler32');

// map datastructure for counting messages from each address
const server_counts = new Map();

module.exports = {

  parse(msg) {
    /** *
    Parse the message from a client
    According to the format given by
    FG
    ** */

    const cs = adler.sum(msg.slice(4));

    if (cs === msg.readUInt32BE(0)) {

      console.log(`${msg.slice(18)}`); // quote

      const time_sent = new Uint64BE(msg, 4); // read time stamp
      const time_diff = Date.now() - time_sent.toNumber();
      console.log('Transfer time: %d ms', time_diff);

      const address = ipaddr.fromByteArray(msg.slice(12, 16)); // load address
      console.log('Source address: %s', address.toString());

      const port = msg.readUInt16BE(16); // load client port, to which the server can respond
      console.log('Client port: %s', port.toString());

      const count = server_counts.get(address.toString()) || 0; // get current message count
      server_counts.set(address.toString(), count + 1); // update count

      console.log('Received %d message(s) from this address\n', count + 1);

    } else {
      const err = new Error('Checksums do not match, message corrupted');
      throw err;
    }
  },

};

