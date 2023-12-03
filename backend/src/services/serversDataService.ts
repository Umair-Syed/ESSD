import cron from 'node-cron';
import serverDataUpdateTask from './serverDataUpdateTask';
import diskDataOnlyUpdateTask from './diskDataOnlyUpdateTask';

const timeInterval = 5; // need to set in database and user will set it from footer

cron.schedule(`*/${timeInterval} * * * *`, () => {
    console.log('Running the main update task every 5 minutes');
    serverDataUpdateTask();
  });

cron.schedule(`*/${timeInterval < 2 ? timeInterval : 2} * * * *`, () => {
    console.log('Running the disk chart data update task every 2 minutes');
    diskDataOnlyUpdateTask();
});


