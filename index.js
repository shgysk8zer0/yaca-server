const ws = require('ws');
const http = require('http');
const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);
const socket = new ws.Server({port: 3000});
const server = http.createServer();

server.on('upgrade', socket.handleUpgrade);
socket.on('connection', ws => {
  console.log('New connection established');
  ws.send('Hello. How may I help you?');
  rl.on('line', txt => ws.send(txt));
  rl.on('close', () => process.exit(0));
  ws.on('message', console.log);
});
socket.on('close', console.log);
