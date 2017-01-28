const superagent = require('superagent');
const mongoose = require('mongoose');
const cheerio = require('cheerio');
const colors = require('colors');
const _ = require('../lib/daguo');
const log = _.log;

module.exports = function(model) {

    return {
        url: 'https://zhuanlan.zhihu.com/api/posts/20751140',
        baseUrl: '',
        baseSite: 'zhihuBest999',
        model,
        listsFetch() {
            let that = this;
            return new Promise((resolve, reject) => {
                log(`start fetch ${that.baseSite}`.yellow);
                superagent.get(that.url)
                    .end((err, res) => {
                        var lists = JSON.parse(res.text).content.match(/<p>.*?<a.*?<\/a>.*?<\/p>/g);
                        lists.shift();
                        let tasks = [];
                        lists.forEach(function(list) {
                            let link = list.match(/href="(.*?)"/)[1];
                            tasks.push(that.checkDatas(link, list, that.model));
                        });
                        Promise.all(tasks)
                            .then((posts) => {
                                log('all list checked'.yellow);
                                resolve(posts);
                            });
                    });
            });
        },

        checkDatas(link, $el) {
            let that = this;
            return new Promise((resolve, reject) => {
                that.model.find({ link: link }, { link: '' }, (err, data) => {
                    err && reject(`find data error: '${link}'`)
                    if (data.length) {
                        log(`already fetch and save on db: '${link}'`);
                        resolve();
                    } else {
                        let post = {};
                        post.site = that.baseSite;
                        post.link = link;
                        post.title = $el.match(/<a.*?>(.*?)<\/a>/)[1];
                        post.id = $el.match(/<p>(\d..).*?<a.*?\/a>/)[1];
                        post.star = $el.match(/<a.*?\/a>(.*?)<\/p>/)[1]
                            // post.desc = $el.find('.summary>p').text();
                        resolve(post);
                    }
                })
            });
        },

        postFetch(post, cb) {
            let that = this;
            // return new Promise((resolve, reject) => {
            superagent.get(post.link)
                .end((err, res) => {
                    (!res || !res.text) && console.log(`postFetch res.text error :${post.link}`) && cb(null, post.id);
                    let $ = cheerio.load(res.text, { decodeEntities: false });
                    post.createAt = Date.now();
                    post.author = $('.answer-head .author-link').text();
                    post.publishAt = $('.zm-item-answer .answer-date-link').text();
                    post.content = $('.zm-editable-content.clearfix').html();
                    post.comments = $('.CommentItem_content_CYqW').html();
                    console.log(post.comments);
                    // post.tags = $('.taglist--inline').text();
                    if (post.content) {
                        that.model.create(post, (err) => {
                            err && log(`db save error.${err}`);
                            log(`db save success:'${post.link}'`)
                            cb(null, post.id);

                        })
                    } else {
                        log(`this link lose content: '${post.link}'`)
                        cb(null, post.id);
                    }
                })
                // });
        },
    };
};
