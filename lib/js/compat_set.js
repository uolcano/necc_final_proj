var getEvent = function(event) {
    return event || window.event;
};
var getTarget = function(event) {
    return event.target || event.srcElements;
};
var preventDefault = function(event) {
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }
};
var addHandler = function(elm, type, handler) {
    if (elm.addEventListener) {
        elm.addEventListener(type, handler, false);
    } else if (elm.attachEvent) {
        elm.attachEvent("on" + type, handler);
    } else {
        elm["on" + type] = handler;
    }
};
var removeHandler = function(elm, type, handler) {
    if (elm.removeEventListener) {
        elm.removeEventListener(type, handler, false);
    } else if (elm.detachEvent) {
        elm.detachEvent("on" + type, handler);
    } else {
        elm["on" + type] = null;
    }
};
/**
 * [maniInnerText 获取/写入指定DOM节点的文本节点内容]
 * @param  {[type]} elm    [指定DOM节点]
 * @param  {[type]} method [判断是写入还是获取文本节点内容]
 * @param  {[type]} txt    [写入的文本]
 */
var maniInnerText = function(elm, method, txt) {
    var _flag = (typeof elm.textContent === 'string');
    switch (method) {
        case 'get':
            return _flag ? elm.textContent : elm.innerText;
        case 'set':
            try { // 处理IE抛错，方式无法关闭视频窗口
                if (_flag) {
                    elm.textContent = txt;
                } else {
                    elm.innerText = txt;
                }
            } catch (e) {
                console.log(e);
            }
            break;
        default:
            throw new Error('Error: wrong method, only accept "get" and "set".');
    }
};
/**
 * [getWinWidth 获取当前浏览器的视口宽度，利用局部静态作用域将getWinWidth“释放”到全局环境中]
 * @return {[integer]} [当前视口宽度]
 */
var getWinWidth = function() {
    var _width = 0;
    if (document.compatMode === 'CSS1Compat') {
        _width = document.documentElement.clientWidth;
    } else if (document.compatMode === 'BackCompat') {
        _width = document.body.clientWidth;
    }
    // console.log(_width, window.innerWidth);
    _width = window.innerWidth || (_width + 17); // 17用来抵消IE跟其他浏览器的计算差别
    return _width;
};
/**
 * [getRules 获取某个样式表的CSS规则集]
 * @param  {[type]} sheet [样式表元素]
 * @return {[type]}       [C样式表下的SS规则集]
 */
var getRules = function(sheet) {
    return sheet.cssRules || sheet.rules;
};
