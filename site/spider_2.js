/*	
编号：2   
网站：w3cfuns前端网
爬取深度：1  
筛选条件：浏览量1500
*/
var cheerio = require('cheerio'),
	config = require('../config.js'),
	log4js = require('log4js'),
	colors = require('colors'),
	Spider = require('../spider.js'),
	_ = require('underscore'),
	tools = require('../tools.js'),
	logger = log4js.getLogger('-');

const MIN_COUNT_VIEW = 1000;
module.exports = new Spider({
	id:2,
	name: 'w3cfuns',
	homePage_url: ['http://www.w3cfuns.com'],
	domain: 'http://www.w3cfuns.com/',
	maxPage: 1,
	/**
	 * 列表页爬取函数
	 * @param {String} 列表页面字符串
	 * @return {Object Array} 未过滤的列表信息
	 */
	fetchList: function(datas) {
		var $ = cheerio.load(datas),
			lists = $('.noteinfo'),
			that = this,
			lists_nofilter = [];
		$('.noteinfo').each(function(index, val) {
			var thisObj = new config.ListObj();
			thisObj.articleUrl = (that.domain + $(this).find('h2 a').eq(1).attr('href'));
			thisObj.title = $(this).find('h2>a').eq(1).text();
			thisObj.author = $(this).find('h2>a').eq(0).text();
			thisObj.countView = $(this).find('div>span').eq(1).text();
			thisObj.countComment = $(this).find('div>span').eq(2).text();
			thisObj.tags = $(this).find('div>span').eq(3).text();
			thisObj.site = that.name;
			lists_nofilter.push(thisObj);
		})
		return lists_nofilter;
	},
	/**
	 * 列表文章定制，筛选函数
	 * @param {Object} 未过滤的列表信息
	 * @return {Object Array} 经过筛选后的列表数组
	 */
	filterLists: function(lists_nofilter) {
		var lists = [];
		_.each(lists_nofilter, function(val) {
			if (val.countView > MIN_COUNT_VIEW) {
				lists.push(val);
			}
		})
		return lists;
	},
	//article页模板匹配
	templates: [{
		regexp: /.*/,
		/**
		 * 模板脚本
		 * @param {String} 爬到的网页
		 * @param {Object} list字段
		 * @return {Object} article
		 */
		fetchArticle: function(pageHtml, list) {
			var $ = cheerio.load(pageHtml),
				article = config.ArticleObj(list);
			article.content = $('#postview').text();
			article.createTimeLebal = new Date();
			article.createTime = new Date().getTime();
			article.fromList.publishTime = $('#infos>span span').text();
			if (!article.content) {
				logger.warn(list.site.grey + '_article_' + list.id.yellow + '_article_content is empty')
			} else {
				logger.info(list.site.grey + '_article_' + list.id.yellow + '_get the article')
			}
			return article;

		}
	}],
	//翻页规则函数，将翻页内容Push到homePage_url
	addSitePage: function() {
		// var that = this;
		// for (var i = 2; i <= this.maxPage; i++) {
		// 	this.homePage_url.push(this.homePage_url[0] + '?page=' + i);
		// }
		logger.warn(this.name.grey + '_only one page.'.yellow)
	}
});
