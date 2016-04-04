/**
 * [serialize 序列化查询参数]
 * @param  {[object]} data [待序列化的查询参数的对象形式]
 * @return {[string]}      [序列化处理完成的查询参数字符串]
 */
function serialize(data) {
    if (!data) {
        return '';
    }
    var _pairs = [];
    for (var _name in data) {
        if (!data.hasOwnProperty(_name)) {
            continue;
        }
        if (typeof data[_name] === 'function') {
            continue;
        }
        var _value = data[_name].toString();
        _name = encodeURIComponent(_name);
        _value = encodeURIComponent(_value);
        _pairs.push(_name + '=' + _value);
    }
    return _pairs.join('&');
}

/**
 * [queryDataSync 用于多次查询数据的同步请求，防止网络环境差时，用户重复操作后，响应数据爆发式返回]
 * @param {[function]} callback [处理请求数据的回调函数]
 * @param {[string]}   url      [响应请求的服务器地址]
 * @param {[string]}   options  [查询参数的字符串形式]
 */
var queryDataSync = function() {
    var _cache = { // cache用于缓存在上一次ajax请求时创建的xhr对象和对应load事件调用的处理程序，以便移除上一次创建的load事件和xhr对象
        getData: null,
        throwExcept: null,
        _xhr: null
    };
    return function(callback, errCallback, url, options) {
        /* 清除在上一次ajax请求时创建的load事件、error事件及其事件处理程序和xhr对象 */
        if (_cache.getData instanceof Function && _cache.throwExcept instanceof Function && (_cache.xhr instanceof XMLHttpRequest || _cache.xhr instanceof XDomainRequest)) {
            removeHandler(_cache.xhr, 'load', _cache.getData);
            removeHandler(_cache.xhr, 'error', _cache.throwExcept);
            _cache.throwExcept = null;
            _cache.getData = null;
            _cache.xhr = null;
            delete callback.response; // 删除callback中存储响应报文的属性，为waitResponse模拟同步请求铺路
        }
        var _query = url + ((typeof options === 'string' && options.length > 0) ? '?' + options : '');
        var _xhr = new XMLHttpRequest();
        try {
            _xhr.open('get', _query);
        } catch (e1) { // *!兼容IE8的跨域方案
            try {
                _xhr = new XDomainRequest();
                _xhr.open('get', _query);
                // console.log('create a cross-origin request for IE');
            } catch (e2) {
                console.log('Error: create request unsuccessfully.', e2.message);
            }
        }
        if (_xhr) {
            addHandler(_xhr, 'load', getData);
            addHandler(_xhr, 'error', throwExcept);
            _xhr.send(null);
        }

        function getData(event) {
            callback(_xhr.responseText);
        }

        function throwExcept(event) {
            errCallback(_xhr);
        }
        /* 将xhr对象和事件处理程序缓存到下一次ajax请求，以便移除 */
        _cache.xhr = _xhr;
        _cache.getData = getData;
        _cache.throwExcept = throwExcept;
    };
}();

/**
 * [queryDataAsync 获取异步数据]
 * @param  {Function}   callback [处理响应数据的回调函数]
 * @param  {[string]}   url      [响应请求的服务器地址]
 * @param  {[string]}   options  [查询参数的字符串形式]
 */
function queryDataAsync(callback, errCallback, url, options) {
    var _query = url + ((typeof options === 'string' && options.length > 0) ? ('?' + options) : '');
    var _xhr = new XMLHttpRequest();
    try {
        _xhr.open('get', _query);
    } catch (e1) {
        try {
            _xhr = new XDomainRequest();
            _xhr.open('get', _query);
            // console.log('create a cross-origin request for IE');
        } catch (e2) {
            console.log('Error: create request unsuccessfully.', e2.message);
        }
    }
    if (_xhr) {
        addHandler(_xhr, 'load', getData);
        addHandler(_xhr, 'error', throwExcept);
        _xhr.send(null);
    }

    function getData(event) {
        callback(_xhr.responseText);
    }

    function throwExcept(event) {
        errCallback(_xhr);
    }
}

/**
 * [getCookie 取得本地cookie]
 * @param  {[string]}  name [cookie名]
 * @return {[integer]}      [cookie名的值]
 */
function getCookie(name) {
    var _cookieName = encodeURIComponent(name) + "=",
        _cookieStart = document.cookie.indexOf(_cookieName),
        _cookieValue = null,
        _cookieEnd;
    if (_cookieStart > -1) {
        _cookieEnd = document.cookie.indexOf(";", _cookieStart);
        if (_cookieEnd == -1) {
            _cookieEnd = document.cookie.length;
        }
        _cookieValue = decodeURIComponent(document.cookie.substring(_cookieStart + _cookieName.length, _cookieEnd));
    }
    return _cookieValue;
}

/**
 * [setCookie 设置本地cookie]
 * @param {[string]} name    [cookie名]
 * @param {[string]} value   [cookie值]
 * @param {[date]}   expires [失效时间]
 * @param {[string]} path    [服务器路径]
 * @param {[string]} domain  [服务器域]
 * @param {[string]} secure  [安全策略]
 */
function setCookie(name, value, expires, path, domain, secure) {
    var _cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);
    if (expires instanceof Date) {
        _cookieText += "; expires=" + expires.toGMTString();
    }
    if (path) {
        _cookieText += "; path=" + path;
    }
    if (domain) {
        _cookieText += "; domain=" + domain;
    }
    if (secure) {
        _cookieText += "; secure";
    }
    document.cookie = _cookieText;
}

/**
 * [unsetCookie 移除本地cookie，只需要将失效时间设为当前或0]
 */
function unsetCookie(name, path, domain, secure) {
    setCookie(name, "", new Date(0), path, domain, secure);
}
