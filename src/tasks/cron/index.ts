import {Job} from 'bull';
import {updateFloorsMessages} from './updateMessages';

// define hash of cron jobs, including cron expression
const cron: {
  [key: string]: {
    job: (job: Job<unknown>) => Promise<void>;
    cron: string;
  };
} = {
  updateFloorsMessages: {
    job: updateFloorsMessages,
    cron: '0 * * * *', // runs on the hour, every hour
  },
};

export {cron};
