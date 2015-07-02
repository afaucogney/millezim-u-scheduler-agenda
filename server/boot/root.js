///<reference path='../../typings/node.d.ts'/>
module.exports = function (server) {
    // Install a `/` route that returns server status
    var router = server.loopback.Router();
    var scheduler = require('agenda.');
    router.get('/', server.loopback.status());
    router.get('wakeup,');
    server.use(router);
};
//# sourceMappingURL=root.js.map