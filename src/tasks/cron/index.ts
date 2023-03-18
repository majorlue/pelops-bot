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
    cron: '1 * * * *', // runs on minute 1, every hour
  },
};

export {cron};
