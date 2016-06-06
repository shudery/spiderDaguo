/*	
编号：3  
网站：segmentfault
爬取深度：3  
筛选条件：浏览量3000
*/
var cheerio = require('cheerio'),
	config = require('../config.js'),
	log4js = require('log4js'),
	colors = require('colors'),
	Spider = require('../spider.js'),
	tools = require('../tools.js'),
	_ = require('underscore'),
	logger = log4js.getLogger('-');

const MIN_COUNT_VIEW = 3000;
module.exports = new Spider({
	name: 'segmentfault',
	//每月热门
	homePage_url: ['https://segmentfault.com/blogs/hottest/monthly'],
	domain: 'https://segmentfault.com',
	maxPage: 1,
	/**
	 * 列表页爬取函数
	 * @param {String} 列表页面字符串
	 * @return {Object Array} 未过滤的列表信息
	 */
	fetchList: function(datas) {
		var $ = cheerio.load(datas),
			lists = $('.stream-list__item'),
			that = this,
			lists_nofilter = [];
		$('.views small').remove();
		$('.stream-list__item').each(function(index, val) {
			var thisObj = new config.ListObj();
			thisObj.articleUrl = (that.domain + $(this).find('.summary>h2>a').eq(0).attr('href'));
			thisObj.title = $(this).find('.summary h2 a').text().trim();
			thisObj.author = $(this).find('.author li a').eq(0).text().trim();
			thisObj.countView = $(this).find('.views').text().trim();
			thisObj.countStar = $(this).find('.author li small').text().trim();
			thisObj.publishFrom = $(this).find('.author li a').eq(1).text().trim();
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
			if (/k/.test(val.countView)) {
				val.countView = 1000 * val.countView.split('k')[0];
				if (val.countView > MIN_COUNT_VIEW) {
					lists.push(val);
				}
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
			article.content = $('.article').html();
			article.createTimeLebal = new Date();
			article.createTime = new Date().getTime();
			$('.article__author a').remove();
			article.fromList.publishTime = $('.article__author').text();
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
		var that = this;
		for (var i = 2; i <= this.maxPage; i++) {
			this.homePage_url.push(this.homePage_url[0] + '?page=' + i);
		}
		if (this.homePage_url.length === 0) {
			logger.warn(this.name.grey + '_only one page.'.yellow)
		}
	}
});