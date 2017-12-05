//John Nolan
// index.js
// The client and server for my Nelson Mandela udp program


// npm modules
const dgram = require('dgram');

// argv
const argv = require('minimist')(process.argv.slice(2)); // parse arguments into an object

// my functions
const send = require('./send.js').send;
const parse =  require('./receive.js').parse;


// constants
const server = dgram.createSocket('udp4'); // acts as client and server


// arguments
let dest_address = ''; // server address
let dest_port = 0;

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



// server callbacks
server.on('message', (msg) => { // NOTE: rinfo (second arg) passes the data I print, but I excluded it to build my own data buffer
	parse(msg); // print statement for this message format
});


server.on('listening', () => {
	console.log('Listening at %s:%s', server.address().address, server.address().port); //${server.address().address}:${server.address().port}');
});


// start server or client behavior
if (dest_address.length) { // address assigned: act as client
	setInterval(send.bind(null, server, dest_port, dest_address), 2000); 
	// send every 2 seconds 
}

server.bind(port);
// begin listening for responses

