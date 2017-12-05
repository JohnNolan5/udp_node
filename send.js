// John Nolan
// send.js
// A module to send a message following the specific protocol for FG

// npm modules
const Uint64BE = require('int64-buffer').Uint64BE; // library to load 64 bytes to a buffer
const ipaddr = require('ipaddr.js');
const adler = require('adler32');

// constants
const quote = '"It always seems impossible until it\'s done" - Nelson Mandela';

// send a message
module.exports = {
  send(server, dest_port, dest_address) { // create message and send it on the server
    /** *
    Sends a message in the following format
    [ checksum (4 bytes) | timestamp (8 bytes) | ip address (4 bytes) | port (2 bytes) | message ]
    ** */

    // create buffers
    const stamp = Uint64BE(Date.now()); // timestamp (8 bytes)
    const buf_ts = stamp.toBuffer();

    const address = ipaddr.parse(server.address().address); // parse string into byte representation
    const buf_ip = Buffer.from(address.octets); // ip address buffer (4 bytes)

    const buf_p = Buffer.alloc(2); // port (2 bytes)
    buf_p.writeUInt16BE(server.address().port, 0); // send client port for possible responses

    const buf_q = Buffer.from(quote); // quote
    let buffer = Buffer.concat([buf_ts, buf_ip, buf_p, buf_q], 14 + quote.length);

    // calculate checksum
    const sum = adler.sum(buffer);
    const buf_cs = Buffer.alloc(4); // add check sum to buffer
    buf_cs.writeUInt32BE(sum, 0);
    buffer = Buffer.concat([buf_cs, buffer], buf_cs.length + buffer.length);

    server.send(buffer, dest_port, dest_address, (err) => {
      if (err) {
        console.log(err.message);
      }
    });
  },

};
