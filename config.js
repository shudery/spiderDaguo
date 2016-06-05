var tools = require('./tools.js');
const PAGELIST_INTERVAL = 2000,
	//翻页Lists爬取间隔
	WRITEFILE_FOLDER = './articles/',
	//保存文件位置
	WRITEFILE_STYLE = '.js',
	//保存article的文件格式
	RESPONSE_MINLENGTH = 1000,
	//response过低报警值
	DEFAULT_MAXPAGE = 3
	//默认List抓取深度

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
		tags:'',
		publishFrom: '',
		publishTime: ''
	}
};

module.exports = {
	fileStyle: WRITEFILE_STYLE,
	pageListInterval: PAGELIST_INTERVAL,
	resTextLen: RESPONSE_MINLENGTH,
	fileFolder :WRITEFILE_FOLDER,
	ArticleObj: ArticleObj,
	ListObj: ListObj,
	maxPage: DEFAULT_MAXPAGE
}