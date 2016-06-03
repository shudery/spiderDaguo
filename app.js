var superagent = require('superagent'),
	cheerio = require('cheerio'),
	express = require('express'),
	config = require('./config.js'),
	colors = require('colors'),
	Spider = require('./spider.js'),
	tools = require('./tools.js'),
	http = require('http'),
	url = require('url'),
	fs = require('fs'),
	_ = require('underscore');
/**
 * 初始化爬虫对象
 * @param {Object} 初始化对象信息
 * @return {Object} 爬虫对象
 */
var spider_001 = new Spider({
	name: 'qianDuanLuanDun',
	homePage_url: ['http://www.html-js.com/article'],
	domain: 'http://www.html-js.com',
	maxPage: '',
	/**
	 * 列表页爬取函数
	 * @param {String} 列表页面字符串
	 * @return {Object Array} 未过滤的列表信息
	 */
	fetchList: function(datas) {
		var $ = cheerio.load(datas),
			lists = $('.other-r'),
			that = this,
			lists_nofilter = [];
		$('.other-r').each(function(index, val) {
			var thisObj = new config.ListObj();
			thisObj.articleUrl = (that.domain + $(this).parent().parent().find('.title-wrapper a').attr('href'));
			thisObj.title = $(this).parent().parent().find('.title-wrapper a').attr('title');
			thisObj.author = $(this).find('span').eq(0).find('a').text();
			thisObj.countView = $(this).find('span').eq(1).find('a').text();
			thisObj.countComment = $(this).find('span').eq(3).find('a').text();
			thisObj.publishTime = $(this).find('span').eq(2).find('a').text();
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
			if (val.countView > 400) {
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
			article.content = $('article .wrapper').text();
			article.createTimeLebal = new Date();
			article.createTime = new Date().getTime();
			if (!article.content) {
				console.log(tools.getTime() + list.site.green + '_article_'+list.id.green + '_article_content is empty')
			} else {
				console.log(tools.getTime() + list.site.green + '_article_'+list.id.green + '_get the article')
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

	}
});
//开始爬取
startupSpider(spider_001);
function startupSpider(spider){
	var page = 1;
	var index = 0;
	//添加翻页列表
	spider.addSitePage();
	//创建列表任务
	spider.creListTask(spider, page, index);
}



