const functions = require('firebase-functions');
const Twit = require('twit');
const config = require('./config')
const T = new Twit(config);
const cron = require('cron');
const express = require('express')
const app = express();
const port = 3000;
app.listen(port, function(){
    console.log('listening to port '+port);
})
const tweet = {
    status: ''
}

let cronJob = cron.job("0 0 * * *", function(){
    console.info('cron job completed');
    getProgress();
}); 
console.log('cronJob started')
cronJob.start();

function getProgress(){
    let now = new Date();
    let start = new Date(now.getFullYear(), 0, 0);
    let diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    let oneDay = 1000 * 60 * 60 * 24;
    let day = Math.floor(diff / oneDay);
    let percent = (day / 365) * 100;
    tweet.status = `${percent.toFixed(2)}% of 100%`;
    console.log('tweet status',tweet.status);
    T.post('statuses/update', tweet, tweeted)
}
function tweeted(err, data, response) {
    if (err) {
        console.log("Something went wrong!", err);
    }
    else {
        console.log("voila tweeted",tweet.status);
    }
}

exports.app = functions.https.onRequest(app);