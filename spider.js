var superagent = require('superagent'),
	cheerio = require('cheerio'),
	express = require('express'),
	config = require('./config'),
	log4js = require('log4js'),
	colors = require('colors'),
	http = require('http'),
	tools = require('./tools.js'),
	url = require('url'),
	fs = require('fs'),
	_ = require('underscore'),
	logger = log4js.getLogger('-');


module.exports = function(obj) {
	return {
		//爬虫标识
		name: obj.name,
		//lists的URL数组
		homePage_url: obj.homePage_url,
		domain: obj.domain || '',
		//List爬取深度
		maxPage: obj.maxPage || config.maxPage,
		//任务初始索引值
		taskNum: 0,
		//存放该爬虫的article
		articles: [],
		//存放所有Lists
		lists_nofilter: [],
		//存放只经过全局筛选的lists
		lists_noSingleFilter: [],
		//存放经过筛选的Lists
		lists: [],
		//统一过滤条件
		globalFilter: config.globalFilter || '',
		fetchList: obj.fetchList || '',
		filterLists: obj.filterLists || '',
		templates: obj.templates || '',
		addSitePage: obj.addSitePage || '',
		allFilterLists: function(lists_nofilter) {
			var lists = [];
			if (config.startGlobalFilter) {
				var filter = config.globalFilter;
				_.each(lists_nofilter, function(val) {
					var choose = filter.filter_field && val.title.indexOf(filter.filter_field) > -1;
					if (choose) {
						lists.push(val);
					}
				});
				return lists;
			} else {
				return lists_nofilter;
			}
		},
		/**
		 * 创建列表爬取任务
		 * @param {Object} 爬虫
		 * @param {Number} 当前list的页面数
		 * @param {Number} 当前list的任务索引
		 */
		creListTask: function(spider, page, index) {
			superagent.get(spider.homePage_url[index])
				.end(function(err, res) {
					spider.lists_nofilter = spider.lists_nofilter.concat(spider.fetchList(res.text));
					spider.lists_noSingleFilter = spider.lists_noSingleFilter.concat(spider.allFilterLists(spider.lists_nofilter));
					spider.lists = spider.lists.concat(spider.filterLists(spider.lists_noSingleFilter));
					page++;
					index++;
					(function(page, index) {
						if (page <= spider.maxPage) {
							logger.info(spider.name.grey + ('_PAGE_NO.' + (page - 1) + ' already fetch!').green)
							setTimeout(function() {
								spider.creListTask(spider, page, index)
							}, config.pageListInterval)
						} else {
							logger.info(spider.name.grey + ('_PAGE_NO.' + (page - 1) + ' already fetch!').green)
							logger.info(spider.name.grey + ('_finish all listTask and create articleTask:').green)
							spider.creArticleTask(spider.lists);

						}
					})(page, index);
				});
		},
		/**
		 * 创建文章爬取任务
		 * @param {Object} Lists列表数组
		 * @return {Object} Promise
		 */
		creArticleTask: function(lists) {
			var that = this;
			var promises = [];
			for (var i = 0; i < lists.length; i++) {
				var index = i;
				var fetchArticle = that.filterTemplates(lists[index]);
				//将文章爬取请求存入promises
				promises.push(that.requestArticle(lists[index], index, fetchArticle));
			};
			return Promise.all(promises)
				.then(function(value) {
					//所有Lists爬取完成
					logger.info(that.name.grey + ('_finish all promises').green);
					//将爬到的articles存入文件
					fs.writeFile(config.fileFolder + that.name + '_' + tools.createId() + config.fileStyle, JSON.stringify(that.articles), function(err) {
						err && logger.info(err);
						!err && logger.info(that.name.grey + '_write success'.green)
					})
				}).catch(err => {
					logger.info(err);
				});
		},
		/**
		 * 列表网页结构模板匹配
		 * @param {Object} 单一list对象
		 * @return {Object Function} list对应article页的脚本
		 */
		filterTemplates: function(list) {
			for (var i = 0; i < this.templates.length; i++) {
				if (this.templates[i].regexp.test(list.articleUrl)) {
					//返回对应url的脚本模板
					return this.templates[i].fetchArticle;
				}
			}
			logger.warn('article_' + list.id.yellow + 'No templates match!');
			return '';
		},
		/**
		 * 分配发送请求，获取网页内容，用fetchArticle解析页面
		 * @param {Object} 单一list对象
		 * @param {Number} 任务分配索引
		 * @param {Object Function} 网页对应匹配脚本
		 */
		requestArticle: function(list, index, fetchArticle) {
			var that = this;
			return new Promise(function(resolve, reject) {
				logger.info(that.name.grey + '_article_' + list.id.yellow + '_request url of article:');
				superagent.get(list.articleUrl)
					.end(function(err, res) {
						if (res.text.length > config.resTextLen) {
							logger.info(that.name.grey + '_article_' + list.id.yellow + '_get the pageHtml');
							resolve(res.text);
						} else {
							reject('request article res_text is empty!');
						}
					});
			}).then(function(resHtml) {
				//保存article
				that.articles.push(fetchArticle(resHtml, list));
			})
		}
	}
}

// log4js.loadAppender('file');
// log4js.addAppender(log4js.appenders.file('logs/cheese.log'), 'cheese');
// //logger.setLevel('INFO');
// log4js.configure({
// 	appenders: [{
// 		type: 'console'
// 	}, {
// 		type: 'file',
// 		filename: 'logs/cheese.log',
// 		category: 'cheese'
// 	}],
// 	replaceConsole: true
// });