import cron from 'node-cron';
import ServersMetaModel from '../models/server-meta';
import updateServicesDataTask from './tasks/servicesTask';
import updateDatabaseDataTask from './tasks/databaseTask';
import updateDiskUsageDataTask from './tasks/diskUsageTask';
import updateMemoryUsageDataTask from './tasks/memoryUsageTask';

const timeInterval = 5; // need to set in database and user will set it from footer

cron.schedule(`*/${timeInterval} * * * *`, async () => {
    console.log('Running the main update task every 5 minutes');
    try {
      const servers = await ServersMetaModel.find();
      for (const server of servers) {
        await updateServicesDataTask(server);
        await updateDatabaseDataTask(server);
      }
    } catch (error) {
      console.error('Failed to execute update task1:', error);
    }
  });

cron.schedule(`*/${timeInterval < 2 ? timeInterval : 2} * * * *`, async () => {
    console.log('Running the disk chart data update task every 2 minutes');
    try {
      const servers = await ServersMetaModel.find();
      for (const server of servers) {
        await updateDiskUsageDataTask(server);
        await updateMemoryUsageDataTask(server);
      }
    } catch (error) {
      console.error('Failed to execute 2 min update task2:', error);
    }
});


