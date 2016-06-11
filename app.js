var spider = require('./site/allSite.js'),
	async = require('async');

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
startupSpider(spider.spider_1);
startupSpider(spider.spider_2);
startupSpider(spider.spider_3);

function startupSpider(spider) {
	var page = 1;
	var index = 0;
	//添加翻页列表
	spider.addSitePage();
	//创建列表任务
	spider.creListTask(spider, page, index);
}	