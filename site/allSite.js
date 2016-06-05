/*
	爬虫概览：
	——————————————————
	编号：1   
	网站：前端乱炖
	爬取深度：3  
	筛选条件：浏览量10000
    ——————————————————
    编号：2   
	网站：前端网
	爬取深度：1  
	筛选条件：浏览量1000
	 ——————————————————
    编号：3   
	网站：segmentfault
	爬取深度：3  
	筛选条件：浏览量1000

	*/
var spider_1 = require('./spider_1.js')
var spider_2 = require('./spider_2.js')
var spider_3 = require('./spider_3.js')

module.exports = {
	spider_1: spider_1,
	spider_2: spider_2,
	spider_3: spider_3
}