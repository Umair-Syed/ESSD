import cron from 'node-cron';
import ServersMetaModel from '../models/server-meta';
import { ICreateServerMetaBody } from './tasks/databaseTask';
import updateServicesDataTask from './tasks/servicesTask';
import updateDatabaseDataTask from './tasks/databaseTask';
import updateDiskUsageDataTask from './tasks/diskUsageTask';
import updateMemoryUsageDataTask from './tasks/memoryUsageTask';

const timeInterval = 5; // need to set in database and user will set it from footer
const smallerTimeInterval = timeInterval < 2 ? timeInterval : 2;


export default function startCronJobs() {
  
  cron.schedule(`*/${timeInterval} * * * *`, async () => {
      console.log('Running the main update task every 5 minutes');
      try {
        const servers = await ServersMetaModel.find();
        for (const server of servers) {
          await updateServicesDataTask(server);
          await updateDatabaseDataTask(server as ICreateServerMetaBody);
        }
      } catch (error) {
        console.error(`Failed to execute update task with time interval: ${timeInterval}, Error: ${error} `);
      }
    });

  cron.schedule(`*/${smallerTimeInterval} * * * *`, async () => {
      console.log('Running the update task for disk and memory every 2 minutes');
      try {
        const servers = await ServersMetaModel.find();
        for (const server of servers) {
          await updateDiskUsageDataTask(server);
          await updateMemoryUsageDataTask(server);
        }
      } catch (error) {
        console.error(`Failed to execute update task with time interval: ${smallerTimeInterval}, Error: ${error}`);
      }
  });
}

