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
    if (elm.addEventListener){
        elm.addEventListener(type, handler, false);
    } else if (elm.attachEvent){
        elm.attachEvent("on" + type, handler);
    } else {
        elm["on" + type] = handler;
    }
};
var removeHandler = function(elm, type, handler) {
    if (elm.removeEventListener){
        elm.removeEventListener(type, handler, false);
    } else if (elm.detachEvent){
        elm.detachEvent("on" + type, handler);
    } else {
        elm["on" + type] = null;
    }
};
var maniInnerText = function(elm, method, txt) {
    var flag = (typeof elm.textContent === 'string');
    switch (method) {
        case 'get':
            return flag ? elm.textContent : elm.innerText;
        case 'set':
            try {// 处理IE抛错，方式无法关闭视频窗口
                if (flag) {
                    elm.textContent = txt;
                } else {
                    elm.innerText = txt;
                }
            } catch(e) {
                console.log(e);
            }
            break;
        default:
            throw new Error('Error: wrong method, only accept "get" and "set".');
    }
};