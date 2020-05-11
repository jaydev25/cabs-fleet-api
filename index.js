const restify = require('restify');
let cabs = require('./cabs');
const _ = require('lodash');
const cors = require('cors');
const myEmitter = require('./events');
const helper = require('./helper');

function getCabs(req, res, next) {
    res.json({
        cabs: _.filter(cabs, { assigned: false }),
        success: true,
        message: 'Cabs!!'
    });
    next();
}
function getCab(req, res, next) {
    const cab = _.find(cabs, (cab) => {
        return cab.id == req.params.id
    });
    res.json({
        cab,
        success: true,
        message: 'Cab Info!!'
    });
    next();
}
function bookCab(req, res, next) {
    const index = _.findIndex(cabs, (cab) => {
        return cab.id == req.params.id
    });

    if (cabs[index].assigned) {
        res.json({
            cabs: _.filter(cabs, { assigned: false }),
            success: false,
            message: 'Cab already booked!!'
        });
    } else {
        cabs[index].assigned = true;
        res.json({
            cabs: _.filter(cabs, { assigned: false }),
            success: true,
            message: 'Cab booked!!'
        });
    }
    next();
}
function resetCabs(req, res, next) {
    cabs.forEach((cab) => {
        cab.assigned = false;
    });
    res.json({
        cabs: _.filter(cabs, { assigned: false }),
        success: true,
        message: 'Cabs reseted!!'
    });
    next();
}

function subscribeCab(req, res, next) {
    myEmitter.emit('event', req.params.id);
    res.writeHead(200, {
        Connection: "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*"
    });

    setInterval(() => {
        const index = _.findIndex(cabs, (cab) => {
            return cab.id == req.params.id
        });
    
        const latlng = helper.generateRandomPoint(cabs[index].location, 500);
        res.write("event: CabLocationUpdate\n");
        res.write(`data: ${JSON.stringify(latlng)}`);
        res.write("\n\n");
    }, 1000);
}
var server = restify.createServer();
server.get('/cabs', getCabs);
server.post('/cab/:id', getCab);
server.post('/cab/book/:id', bookCab);
server.get('/cabs/reset', resetCabs);
server.get('/cab/subscribe/:id', subscribeCab);
server.use(
    function crossOrigin(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        return next();
    }
);
server.use(cors())
server.listen(9002, function () {
    console.log('%s listening at %s', server.name, server.url);
});