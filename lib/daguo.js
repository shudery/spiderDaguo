/**2016/9/9 
 * author @daguo
 * shudery@foxmail.com
 * toolkit
 * tools for developing quickly
 * 
 * node:
 * getPath
 * queryStr
 * queryPrase
 * 
 * dev:
 * tryBlock,
 * extend,
 * log
 * 
 * constructor:
 * VerArray
 */

// root 的值, 客户端为 `window`, 服务端(node) 中为 `exports`
var root = this;

//Predicate Function
typeof isString === 'undefined' && (isString = function(target) {
    return typeof target === 'string' ? true : false;
})

typeof isArray === 'undefined' && (isArray = function(target) {
    return Object.prototype.toString.call(target) === '[object Array]';
})

typeof isObject === 'undefined' && (isObject = function(target) {
    return typeof target === 'object' && !isArray(target) && target !== null;
})

typeof stringify === 'undefined' && (stringify = JSON.stringify)
typeof parse === 'undefined' && (parse = JSON.parse)


/**
 * 更新、扩展对象属性
 * 依赖：clone深复制
 * @param  {[type]}  base     需扩展对象
 * @param  {[type]}  add      素材
 * @param  {Boolean} isUpdate false扩展对象，不更新，true只更新对象，不扩展属性
 * @return {[type]}           
 */
function extend(base, add, isUp, isPoint) {
    let isUpdate = isUp || false;
    let isDeep = isPoint || false;
    let obj = isDeep ? clone(base) : base;
    for (let i in add) {
        if (i in obj) {
            isUpdate && (obj[i] = add[i]);
        } else {
            !isUpdate && (obj[i] = add[i])
        }
    }
    return obj;
}
// console.log(extend({a:1,b:2},{b:33,c:44},true))

/**
 * 拼接，解析查询字符串
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
function queryStr(obj) {
    let arr = [];
    for (let i in obj) {
        arr.push(i + '=' + obj[i]);
    }
    return '?' + arr.join('&');
}
//没有处理单个Key对应多个value
function queryPrase(str) {
    let objArr = str.split('?')[1].split('&');
    return objArr.reduce((pre, cur) => {
        pre[cur.split('=')[0]] = cur.split('=')[1];
        return pre;
    }, {})
}
/**
 * 遍历目录
 * @param  [string] 遍历根节点
 * @return [array] 返回所有文件路径
 */
function getPath(path) {
    if (!isString(path)) {
        return new TypeError('expecting a string!');
    }
    let fileList = [];
    (function searchPath(path) {
        //读目录所有文件
        fs.readdirSync(path).forEach((item) => {
            //获得文件信息，判断是否为文件夹
            if (fs.statSync(path + item).isDirectory()) {
                searchPath(path + item + '/');
            } else {
                fileList.push(path + item);
            }
        });
    })(path)
    return fileList;
}
/**
 * 用try包裹执行，让程序不中断
 * @param [string] 需要包裹的代码字符串
 * @return [string] catch到的错误，
 */
function tryBlock(str, msg) {
    !isString(str) && console.log('expecting a string!');
    try {
        eval(str);
    } catch (e) {
        console.log(`throw error form tryBlock:${e}\nmsg:${msg?msg:'nothing'}`)
        return e;
    }
}
/**
 * 调试打印，带标识，依赖非严格模式
 */
function log(string, flag) {
    root.count = root.count || 0;
    root.count++;
    let time = (new Date()).toString().match(/20\d\d\s(.*?)\s/)[1];
    let str = `<${time}><LOG ${root.count}${flag?' '+flag:''}>`;
    if (typeof string !== 'string') {
        console.log(str);
        console.log(string);
    } else {
        console.log(str + string);
    }
    return str;
}


/**
 * 数据类型深复制，函数只复制引用
 * @param  [object]
 * @return [object]  
 */
function clone(obj) {
    //function类型属于object虽然也是引用类型，但是通常深拷贝也是直接赋值
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    //创建的新对象和原对象种类一致
    let ctr = Array.isArray(obj) ? [] : new obj.constructor;
    //保存对象的构造函数信息
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            ctr[i] = typeof obj !== 'object' ? obj[i] : clone(obj[i]);
        };
    }
    return ctr;
}

/**
 * inject all module by pass module's name as arguments
 * @return {[type]} [description]
 */
function injection() {
    var str = '';
    Array.from(arguments).forEach(val => {
        if (/\//.test(val)) {
            log('expecting a module or but no carry path!', 'injection error');
            return;
        };
        //自定义模块名
        if (isArray(val)) {
            str += 'global.' + val[1] + '=require("' + val[0] + '");'
            return;
        };
        str += 'global.' + val + '=require("' + val + '");'
        eval(str);
    })
}

function random(num, isString) {
    var num = num || 10;
    if (!isString) {
        for (var i = 0, sum = ''; i < num; i++) {
            sum += Math.floor(Math.random() * 10)
        }
    } else {
        for (var i = 0, sum = ''; i < num; i++) {
            sum += String.fromCodePoint(Math.floor(Math.random() * ('z'.codePointAt() - 'a'.codePointAt() + 1) + 'a'.codePointAt()))
        };
    };
    return sum;
};
const toolkit = {
    injection,
    extend,
    getPath,
    tryBlock,
    log,
    clone,
    queryStr,
    queryPrase,
    random,
}

module.exports = toolkit;
