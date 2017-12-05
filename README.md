# udp_node
A simple udp client/server built with node js.

"receive.js" contains a module that can parse data sent using a specific format. "send.js" contains a module to send a message in that format. "index.js" contains the actual implementation of these modules within a server/client program.

run a server by specifying just the listening port:
"node index.js -p *port*"

run a client by specifying both the listening port and the destination address/port:
"node index.js -p *port* -s *address:port*"

