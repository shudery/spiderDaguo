var tools = require('./tools.js');

//翻页Lists爬取间隔
const PAGELIST_INTERVAL = 1000,
//爬虫总数
	SPIDER_NUM = 3,
	//保存文件位置
	WRITEFILE_FOLDER = './articles/',
	//保存article的文件格式
	WRITEFILE_STYLE = '.js',
	//response过低报警值
	RESPONSE_MINLENGTH = 1000,
	//默认List抓取深度
	DEFAULT_MAXPAGE = 3,
	//是否开启全局过滤
	START_GLOBAL_FILTER = false,
	//全局搜索字段
	FILTER_FIELD = 'javascript',
	//全局过滤要求
	MIN_COUNT_VIEW = false,
	MIN_COUNT_STAR = false,
	MIN_COUNT_COMMENT = false;
//全局过滤对象
var globalFilter = {
		filter_field: FILTER_FIELD,
		min_count_view: MIN_COUNT_VIEW,
		min_count_star: MIN_COUNT_STAR,
		min_count_comment: MIN_COUNT_COMMENT
	};
	//article字段构造函数
function ArticleObj(list) {
	var obj = {};
	obj.fromList = list;
	obj.content = '';
	obj.createTime = '';
	obj.createTimeLebal = '';
	obj.coverPic = '';
	return obj;
};
//list字段构造函数
function ListObj() {
	return {
		id: tools.createId(),
		site: '',
		articleUrl: '',
		title: '',
		author: '',
		countView: '',
		countStar: '',
		countComment: '',
		tags: '',
		publishFrom: '',
		publishTime: ''
	}
};

module.exports = {
	fileStyle: WRITEFILE_STYLE,
	pageListInterval: PAGELIST_INTERVAL,
	spiderNum : SPIDER_NUM,
	resTextLen: RESPONSE_MINLENGTH,
	fileFolder: WRITEFILE_FOLDER,
	startGlobalFilter: START_GLOBAL_FILTER,
	globalFilter: globalFilter,
	ArticleObj: ArticleObj,
	ListObj: ListObj,
	count: 0,
	articles: [],
	maxPage: DEFAULT_MAXPAGE
}