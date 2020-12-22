const uuidv1 = require('uuid/v1');
const CronJob = require('cron').CronJob;
const { JOB_STATUS } = require('./job-enums');
const boom = require('boom')
const moment = require('moment')

module.exports = function (runAt, doWork, onStart = null, onComplete = null, onError = null, onCancel = null, meta) {
    var self = this;
    self.id = uuidv1();
    self.status = JOB_STATUS.SCHEDULED;
    self.createdOn = new Date();
    self.scheduledOn = runAt ? runAt.toDate() : moment().add(2, 's').toDate();
    self.cancellationReason = "This job was cancelled.";

    for (const key in meta) {
        if (meta.hasOwnProperty(key)) {
            self[key] = meta[key];
        }
    }

    if (!doWork)
        throw new Error("doWork is not assigned")
    var doWork = doWork;

    self.start = () => {
        self.cronJob = new CronJob(
            self.scheduledOn,
            () => {
                self.status = JOB_STATUS.RUNNING
                if (onStart)
                    onStart(self);

                doWork(self)
                    .then(result => {
                        if (self.status == JOB_STATUS.CANCELLED)
                            return;
                        self.status = JOB_STATUS.COMPLETED;
                        self.completedOn = new Date();
                        if (onComplete)
                            onComplete(result, self);
                    })
                    .catch(error => {
                        console.log("job error: ", error)
                        self.status = JOB_STATUS.ERROR;
                        self.completedOn = new Date();
                        if (!error.isBoom)
                            throw boom.badImplementation(error.message);
                        throw error;
                    })
                    .catch(error => {
                        if (onError)
                            onError(error, self);
                    })
            },
            () => {
                self.status = JOB_STATUS.CANCELLED;
                self.completedOn = new Date();
                if (onCancel)
                    onCancel(self.cancellationReason, self);
            })
        self.cronJob.start();
    }

    self.stop = (reason) => {
        self.cancellationReason = reason || self.cancellationReason;
        self.cronJob.stop();
    }

    return self;
}