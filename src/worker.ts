import Bull from 'bull';
import * as Redis from 'ioredis';
import {config} from './config';
import {client, logger} from './handlers';
import {cron} from './tasks';

const REDIS_URL = config.REDIS_URL;
const BOT_TOKEN = config.BOT_TOKEN;
const CRON_QUEUE_NAME = config.CRON_QUEUE_NAME;
const VERSION = config.VERSION;

const redisConnection = new Redis.default(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// instantiate queue using redis connection
const cronQueue = new Bull(CRON_QUEUE_NAME, {
  createClient: () => redisConnection.duplicate(),
  defaultJobOptions: {removeOnComplete: true, removeOnFail: true},
});

// create processor for each cron job and add cron jobs to the queue
// duplicate tasks don't affect anything, bull will ignore dupes
for (const job in cron) {
  cronQueue.process(cron[job].job.name, cron[job].job);
  cronQueue.add(job, {}, {repeat: {cron: cron[job].cron}});
}

cronQueue.on('completed', job => logger.info(`Cron ${job.name} completed.`));

client.on('ready', async () => {
  logger.info(`Worker v${VERSION} started as ${client.user?.tag}`, {
    type: 'startup',
  });
});

client.login(BOT_TOKEN);
