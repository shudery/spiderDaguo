var sites = require('./site/allSite.js'),
	spiders = require('./spider.js'),
	async = require('async'),
	express = require('express');
var app = express();


// var spiderN = [];
// spiderN.push(spider.spider_1);
// spiderN.push(spider.spider_2);
// spiderN.push(spider.spider_3);
// async.mapLimit(spiderN,4,function(spider,callback){
// 	startupSpider(spider,callback)
// },function(err){
// 	console.log('!!!!MAPLIMIT ERROR!!!!')
// })
//开始爬取
startupSpider(sites.spider_1);
startupSpider(sites.spider_2);
startupSpider(sites.spider_3);

function startupSpider(site) {
	var page = 1;
	var index = 0;
	//添加翻页列表
	site.addSitePage();
	//创建列表任务
	site.creListTask(site, page, index);
};
