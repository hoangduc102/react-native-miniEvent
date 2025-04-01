import cron from 'cron';
import https from 'https';

const job = new cron.CronJob('*/14 * * * *', () => {
    https
    .get(process.env.API_URL, (res) => {
        if(res.statusCode === 200) {
            console.log('GET request sent successfully');
        }else{
            console.log('GET request failed', res.statusCode);
        }
    })
    .on('error', (e) => {
        console.error('Error while sending GET request', e);
    })
})

export default job;

//CRON KOB EXPLANATION
//Cron jobs are scheduled tasks that run periodically at fixed intervals.
// we want to sned 1 GET request for every 14 minutes to keep the server alive

//How to define a "Schedule"?
//You define a schedule using a cron expression with consists of 5 fields representing:

//! MINUTE, HOUR, DAY OF MONTH, MONTH, DAY OF WEEK

//?EXAMPLE && EXPLANATION:
//* 14 * * * * - Every 14 minutes
//* 0 0 * * 0 - Every Sunday at midnight
//* 30 3 15 * * - At 3:30 AM on the 15th day of every month
//* 0 0 1 1 * - At midnight on January 1st
//* 0 * * * * - Every hour



