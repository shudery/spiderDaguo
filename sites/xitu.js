const superagent = require('superagent');
const cheerio = require('cheerio');
const colors = require('colors');
const _ = require('../lib/daguo');
const log = _.log;

module.exports = function(model) {

    return {
        url: 'https://gold.xitu.io/welcome/frontend',
        baseUrl: 'https://gold.xitu.io',
        baseSite: 'xitu',
        model,
        listsFetch() {
            let that = this;
            return new Promise((resolve, reject) => {
                log(`start fetch ${that.baseSite}`.yellow);
                superagent.get(that.url)
                    .end((err, res) => {
                        !res.text && reject(`listsFetch res.text error: '${that.url}'`.red)
                        let $ = cheerio.load(res.text, { decodeEntities: false });
                        let lists = $('.entries .entry');
                        let tasks = [];
                        lists.each(function() {
                            let link = $(this).find('.entry-meta .entry-meta-more a').attr('href');
                            if (link) {
                                link = link.split('url=')[1];
                                tasks.push(that.checkDatas(link, $(this), that.model));
                            }

                        });
                        Promise.all(tasks)
                            .then((posts) => {
                                log(`all checked lists: ${that.url}`.yellow);
                                resolve(posts);
                            });
                    });
            });
        },

        checkDatas(link, $el) {
            let that = this;
            return new Promise((resolve, reject) => {
                that.model.find({ link: link }, { link: '' }, (err, data) => {
                    err && reject(`find data error: '${link}'`.red)
                    if (data.length) {
                        log(`already fetch and save on db: '${link}'`.yellow);
                        resolve(null);
                    } else {
                        let post = {};
                        post.site = that.baseSite;
                        post.link = link;
                        post.title = $el.find('.entry-title').text();
                        // post.desc = $el.find('.summary>p').text();
                        post.createAt = Date.now();
                        resolve(post);
                    }
                })
            });
        },

        postFetch(post,cb) {
            let that = this;
            // return new Promise((resolve, reject) => {
                superagent.get(post.link)
                    .end((err, res) => {
                        !res.text && log(`postFetch res.text error :${link}`)
                        let $ = cheerio.load(res.text, { decodeEntities: false });
                        post.author = $('.author-name').text();
                        post.publishAt = $('.author-meta').text();
                        post.content = $('.entry-content').html();
                        // post.tags = $('.taglist--inline').text();
                        if (post.content) {
                            that.model.create(post, (err) => {
                                err && log(`db save error..`);
                                log(`db save success:'${post.link}'`.green)
                                cb(null,post);
                            })
                        } else {
                            log(`this link lose content: '${post.link}'`.red)
                            cb(null,post);
                        }
                    })
            // });
        },
    };
};
