const Queue = require('bee-queue');
const queue = new Queue('notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost'
  },
  activateDelayedJobs: true
});


const addToQueue = async (delayTimestamp, notificationId, feedbackId) => {
  const jobs = await queue.getJobs('delayed')
  const scheduledJobs = jobs.filter(job => job.data.notificationId == notificationId && job.data.feedbackId == feedbackId)
  scheduledJobs.forEach(async job => await queue.removeJob(job.id))
  
  console.log('adding to queue')
  
  queue.createJob({notificationId, feedbackId}).delayUntil(Date.now() + delayTimestamp).save()
}  

const processQueue = cb => {
  queue.process(async (job) => {
      console.log('processing job')
      return cb(job.data)
  })
}

module.exports = {addToQueue, processQueue}