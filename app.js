const superagent = require('superagent'),
    mongoose = require('mongoose'),
    cheerio = require('cheerio'),
    colors = require('colors'),
    _ = require('./lib/daguo'),
    fs = require('fs');

const postSchema = require('./models/postSchema'),
    dbServer = 'mongodb://127.0.0.1:27017/node',
    log = _.log;

//connect db
mongoose.connect(dbServer)
const postModel = mongoose.model('posts', new mongoose.Schema(postSchema));

let tasks = [],
    ponit;

fs.readdirSync(__dirname + '/sites').forEach((path, i) => {
    let site = require('./sites/' + path)(postModel);
    tasks.push(startSpider(site));
});

startTasks();

function startTasks() {
    point = 0;
    tasks[point]();
}

function startSpider(site, count) {
    return function() {
        site.listsFetch()
            .then((posts) => {
                let taskLists = [];
                posts.forEach((post) => {
                    post && taskLists.push(site.postFetch(post));
                });
                return Promise.all(taskLists);
            }).then((posts) => {
                log(`${site.baseSite} done!`.yellow);
                //爬下一个网站
                point++;
                tasks[point] && tasks[point]();
            }).catch((err) => {
                err && log(`promise error catch :${err}`);
            });
    };
};
