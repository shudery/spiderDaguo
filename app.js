const superagent = require('superagent'),
    mongoose = require('mongoose'),
    cheerio = require('cheerio'),
    colors = require('colors'),
    _ = require('./lib/daguo'),
    async = require('async'),
    fs = require('fs');

const postSchema = require('./models/postSchema'),
    dbServer = 'mongodb://127.0.0.1:27017/node',
    log = _.log;

mongoose.Promise = Promise;
//connect db
const db = mongoose.connect(dbServer);
const postModel = mongoose.model('posts', new mongoose.Schema(postSchema));

let tasks = [],
    ponit;

fs.readdirSync(__dirname + '/sites')
    .forEach((path, i) => {
        let site = require('./sites/' + path)(postModel);
        tasks.push(startSpider(site));
    });

// tasks.push(startSpider(require('./special/zhihu999.js')(mongoose.model('zhihuBest999', new mongoose.Schema(postSchema)))));

startTasks();

function startTasks() {
    point = 0;
    tasks[point]();
}

function startSpider(site, count) {
    return function() {
        site.listsFetch()
            .then((posts) => {

                async.mapLimit(posts, 5, (post, cb) => {
                    if (post) {
                        site.postFetch(post, cb);
                    } else {
                        cb(null)
                    };
                }, (err, result) => {
                    err && console.log(err);
                    log(`${site.baseSite} done!`.yellow);
                    //爬下一个网站
                    point++;
                    if (tasks[point]) {
                        tasks[point]();
                    };
                });
            }).catch((err) => {
                err && log(`promise error catch :${err}`);
            });
    };
};
