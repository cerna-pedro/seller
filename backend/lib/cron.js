const cron = require('node-cron');
const callPromises = require('./callPromises');


cron.schedule('*/3 * * * *', () => {
  callPromises()
});
