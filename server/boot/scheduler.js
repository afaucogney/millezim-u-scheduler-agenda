///<reference path='../../typings/node.d.ts'/>
var herokuAlive = require('./heroku-alive');
var isTwinGoingSleep = 0;
process.env.IS_TwIN_SHOULD_SLEEP = isTwinGoingSleep;
var Agenda = require('Agenda');
var agenda = new Agenda({ db: { address: process.env.AGENDA_MONGO_URL } });
var wakeTwinJob = agenda.define('wakeup twin', function (job, done) {
    herokuAlive.sendKeepAlive(process.env.TWIN_URL, process.env.TWIN_PORT);
});
agenda.define('wakeup self', function (job) {
    console.log("WakeUp Self : " + new Date);
    agenda.every('');
    herokuAlive.sendKeepAlive(process.env.SELF_URL, process.env.SELF_PORT);
    if (!isTwinGoingSleep)
        agenda.now('sleep twin');
});
var count = 3;
agenda.define('sleep twin', function (job, done) {
    console.log("Sleep Twin : " + new Date);
    herokuAlive.stopKeepAlive(process.env.TWIN_URL, process.env.TWIN_PORT, function (err, chunk) {
        if (err)
            done(err);
        if (chunk.status === 1) {
            process.env.IS_TwIN_SHOULD_SLEEP = 1;
            done();
        }
        else if (chunk.status === 0) {
            count--;
            if (count > 0) {
                console.log("remain " + count + " trials");
                agenda.schedule('in 30 second', 'sleep twin');
                console.log("wait 30 seconds");
            }
        }
    });
});
agenda.define('sleep self', function (job, done) {
    console.log("Sleep Self : " + new Date);
    agenda.cancel({ name: 'wakeup self' }, function (err, numRemoved) {
        if (err)
            console.log(err);
        else {
            console.log(numRemoved);
            done();
        }
    });
});
if (process.env.AM_I_MORNING === 1) {
    agenda.every('at 01:00am', 'wakeup self');
    agenda.every('at 01:00pm', 'wakeup twin');
    agenda.every('at 02:00pm', 'sleep self');
}
else {
    agenda.every('at 01:00pm', 'wakeup self');
    agenda.every('at 01:00am', 'wakeup twin');
    agenda.every('at 02:00am', 'sleep self');
}
//# sourceMappingURL=scheduler.js.map