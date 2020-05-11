const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on('event', (event) => {
  console.log('an event occurred!', event);
});

module.exports = myEmitter;