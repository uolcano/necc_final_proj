/**
 * 序列化查询参数
 * @param {[object]} [data] [待序列化的查询参数对象]
 * 
 */
function serialize(data) {
    if (!data) {
        return '';
    }
    var pairs = [];
    for (var name in data) {
        if (!data.hasOwnProperty(name)) {
            continue;
        }
        if (typeof data[name] === 'function') {
            continue;
        }
        var value = data[name].toString();
        name = encodeURIComponent(name);
        value = encodeURIComponent(value);
        pairs.push(name + '=' + value);
    }
    return pairs.join('&');
}

/**
 * 数据查询，发启ajax请求，获取服务器端数据
 * @param {[function]} [callback] [用于处理服务器响应数据的回调函数]
 * @param {[string]}   [url]      [查询服务器地址]
 * @param {[string]}   [options]  [序列化后的查询参数字符串]
 * 
 */
var queryData = function() {
    // cache用于缓存在上一次ajax请求时创建的xhr对象和对应load事件调用的处理程序，以便移除上一次创建的load事件和xhr对象
    var cache = { getData: null, throwExcept: null, xhr: null };
    return function(callback, url, options) {
        // 清除在上一次ajax请求时创建的load事件、error事件及其事件处理程序和xhr对象
        if (cache.getData instanceof Function && cache.throwExcept instanceof Function && (cache.xhr instanceof XMLHttpRequest || cache.xhr instanceof XDomainRequest)) {
            removeHandler(cache.xhr, 'load', cache.getData);
            removeHandler(cache.xhr, 'error', cache.throwExcept);
            cache.throwExcept = null;
            cache.getData = null;
            cache.xhr = null;
            delete callback.response; // 删除callback中存储响应报文的属性，为waitResponse模拟同步请求铺路
            // console.log('clear the xhr, load event and the previous response successfully.');
        }

        function getData(event) {
            callback(xhr.responseText);
        }

        function throwExcept(event) {
            console.log('Request unsuccessfully:' + xhr.status);
        }
        var queryOpt = url + ((typeof options === 'string' && options.length > 0) ? '?' + options : '');
        var xhr = new XMLHttpRequest();
        try {
            xhr.open('get', queryOpt);
        } catch (e1) {
            try {
                xhr = new XDomainRequest();
                xhr.open('get', queryOpt);
                console.log('create a cross-origin request for IE');
            } catch (e2) {
                console.log('Error: create request unsuccessfully.', e2);
            }
        }
        if (xhr) {
            addHandler(xhr, 'load', getData);
            addHandler(xhr, 'error', throwExcept);
            xhr.send(null);
        }
        // console.log(callback.response);

        // 将xhr对象和事件处理程序缓存到下一次ajax请求，以便移除
        cache.xhr = xhr;
        cache.getData = getData;
        cache.throwExcept = throwExcept;
    }
}();

/**
 * 获取ajax请求的callback函数
 * @description [接收请求的响应报文主体，并存储于函数的response属性中，以便处理]
 * @param {[XHR responseText]} [response] [接收字符串形式的ajax请求的响应报文主体]
 * 
 */
function getServerData(response) {
    arguments.callee.response = JSON.parse(response);
    // console.log(arguments.callee.response);
}

/**
 * 等待响应
 * @description [模拟同步请求]
 * @param {[function]} [execFunc] [正常执行的代码块]
 *        {[function]} [errFunc]  [响应超时的错误处理代码块]
 *        {[function]} [callback] [处理服务器响应数据的回调函数]
 *        {[string]}   [url]      [请求服务器地址]
 *        {[string]}   [options]  [请求参数，必须是经过序列化后的字符串，否则可能出现ajax错误]
 * 
 * @dependent queryData(callback, url, options)
 * 
 */
function waitResponse(execFunc, errFunc, callback, url, options) {
    var maxTimeout = 50;
    queryData(callback, url, options);

    function intervalTimeOut() {
        // console.log(callback.response);
        // queryData中删除callback.response有利于此处正确判断
        if (typeof callback.response !== 'undefined') {
            clearInterval(arguments.callee.intervalID);
            execFunc();
        } else if (maxTimeout <= 0) { // 请求超时
            clearInterval(arguments.callee.intervalID);
            errFunc();
            return;
        }
        maxTimeout--;
    }
    // 多次判断请求结果，应对较差网络环境
    intervalTimeOut.intervalID = setInterval(intervalTimeOut, 500);
}