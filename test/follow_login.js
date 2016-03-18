window.addEventListener('load', function () {
	var flw = document.querySelector('.j-flw'),
	unflw = document.querySelector('.j-cncl');
	var followSuc = CookieUtil.get('followSuc');

	if (followSuc) {
		loadFollow(flw);// 加载关注状态
	}
	flw.addEventListener('click', addFollow);// 添加关注
	unflw.addEventListener('click', removeFollow);// 取消关注

	/**
	 * @description [打开登录模块，并设置登陆模块中的事件]
	 * 
	 */
	function openLogin () {
		var loginMod = document.getElementById('login'),
		flogin = loginMod.querySelector('.j-flogin'),
		usernmTxt = loginMod.querySelector('.j-username'),
		passwdTxt = loginMod.querySelector('.j-password'),
		errmsg = loginMod.querySelector('.j-errmsg'),
		btn = loginMod.querySelector('.j-submit'),
		close = loginMod.querySelector('.j-cnclicon');

		// quick test code
		// usernmTxt.value = 'studyOnline';
		// passwdTxt.value = 'study.163.com';

		/**
		 * @description [登录模块的错误提示]
		 */
		// 隐藏输入错误提示
		function hiddenErr (elem) {
			elem.style.visibility = 'hidden';
		}
		// 显示输入错误提示
		function showErr (elem, text) {
			elem.style.visibility = 'visible';
			CompatUtil.innerText(elem, 'set', text);
		}

		/**
		 * @description [设置登录成功后的禁用状态]
		 * @param {[DOM node]}  [elem1, elem2] [对应表单的账户和密码输入框DOM节点对象，无顺序要求]
		 * @param {[DOM node]}  [elem3]        [对应提交按钮的DOM节点对象]
		 * @param {[bool]}      [disable]      [确定禁用表单元素还是解除禁用]
		 */
		function disableAct (elem1, elem2, elem3, disable) {
			elem1.disabled = disable;
			elem2.disabled = disable;
			elem3.disabled = disable;
			elem3.classList[disable ? 'add' : 'remove']('disabled');
		}

		/**
		 * @description [关闭登录框后，移除登陆模块的相关事件]
		 */
		// 添加输入框事件
		function addEvent (elem) {
			elem.addEventListener('keypress', keyPress);
			elem.addEventListener('blur', focusBlur);
		}
		// 移除输入框事件
		function removeEvent (elem) {
			elem.removeEventListener('keypress', keyPress);
			elem.removeEventListener('blur', focusBlur);
		}
		// 关闭登录模块
		function closeLogin () {
			loginMod.style.display = 'none';
			close.removeEventListener('click', closeLogin);
			btn.removeEventListener('click', submitLogin);
			removeEvent(usernmTxt);
			removeEvent(passwdTxt);
		}

		/**
		 * @description [登陆模块的输入框相关事件：输入验证以及placeholder的显示/隐藏]
		 */
		// 当输入框中输入时，隐藏和输入错误提示placeholder
		function keyPress (event) {
			event = EventUtil.getEvent(event);
			var target = EventUtil.getTarget(event);

			// 隐藏输入错误提示
			target.style.borderColor = '';
			hiddenErr(errmsg);

			// 隐藏placeholder
			var placeholder = target.nextElementSibling;
			placeholder.style.display = 'none';
		}
		// 当输入框失去焦点时，验证输入信息并给出错误提示，验证是否显示placeholder
		function focusBlur (event) {
			event = EventUtil.getEvent(event);
			var target = EventUtil.getTarget(event);

			// 显示输入错误提示
			if (target === usernmTxt) {
				if (target.value !== 'studyOnline') {
					target.style.borderColor = 'red';
					showErr(errmsg, '账户错误');
				} else {
					target.style.borderColor = '';
					hiddenErr(errmsg);
				}
			} else if (target === passwdTxt) {
				if (target.value !== 'study.163.com') {
					target.style.borderColor = 'red';
					showErr(errmsg, '密码错误');
				} else {
					target.style.borderColor = '';
					hiddenErr(errmsg);
				}
			}

			// 舍去空白符，验证是否显示placeholder
			var placeholder = target.nextElementSibling;
			var value = target.value.replace(/\s/g, '');
			target.value = value;
			if (!value.length) {
				placeholder.style.display = 'block';
			} else {
				placeholder.style.display = 'none';
			}
		}
		// 按钮提交处理程序
		function submitLogin () {
			var url = "http://study.163.com/webDev/login.htm",
			queryOpt = {userName: md5(usernmTxt.value), password: md5(passwdTxt.value)};
			// 
			function execFunc () {
				// console.log(getServerData.response);
				disableAct(usernmTxt, passwdTxt, btn, false);// 收到登录响应后，解除禁用
				if (getServerData.response === 1) {
					showErr(errmsg, '登录成功');
					CookieUtil.set('loginSuc', true, new Date((+new Date()).valueOf() + 86400000));
					CookieUtil.set('followSuc', true, new Date((+new Date()).valueOf() + 86400000));
					loadFollow(flw);// 加载关注状态
					closeLogin();// 登录成功，关闭登录模块
				} else if (getServerData.response === 2) {
					showErr(errmsg, '登录失败');
				} else {// 处理服务器返回数据错误
					console.log('Unexpected login response!');
				}
			}
			function errFunc () {
				disableAct(usernmTxt, passwdTxt, btn, false);// 登录请求超时时，解除禁用
				var errstr = 'Login timeout!';
				console.log(errstr);
				showErr(errmsg, errstr);
			}

			disableAct(usernmTxt, passwdTxt, btn, true);// 提交登录后，禁用输入框和登录按钮
			waitResponse(execFunc, errFunc, getServerData, url, serialize(queryOpt));// 等待服务器响应后，才进入下一步操作
		}

		
		// 显示登录模块并添加事件
		loginMod.style.display = 'block';
		addEvent(usernmTxt);
		addEvent(passwdTxt);
		close.addEventListener('click', closeLogin);
		hiddenErr(errmsg);
		// 添加登录事件
		btn.addEventListener('click', submitLogin);
	}

	/**
	 * @description [关注模块相关处理函数]
	 */
	// 添加关注的事件处理程序
	function addFollow (event) {
		var url = 'http://study.163.com/webDev/attention.htm';
		function execFunc () {
			if (getServerData.response === 1) {
				var loginSuc = CookieUtil.get('loginSuc');
				if (!loginSuc) {
					openLogin();
				} else {
					loadFollow(flw);
					CookieUtil.set('followSuc', true, new Date((+new Date()).valueOf() + 86400000));
				}
			}
		}
		function errFunc () {
			console.log('Request timeout!'); 
		}
		waitResponse(execFunc, errFunc, getServerData, url);
	}

	// 移除关注的事件处理程序
	function removeFollow (event) {
		// CookieUtil.unset('loginSuc');
		CookieUtil.unset('followSuc');
		flw.style.display = 'inline-block';
		var parent = flw.parentNode;
		var textFunc = CompatUtil.innerText;
		parent.children[1].style.display = 'none';
		textFunc(parent.children[2], 'set', textFunc(parent.children[2], 'get') - 1);
	}

	// 设置关注后的状态
	function loadFollow (elem) {
		elem.style.display = 'none';
		var parent = elem.parentNode;
		var textFunc = CompatUtil.innerText;
		parent.children[1].style.display = 'inline-block';
		textFunc(parent.children[2], 'set', textFunc(parent.children[2], 'get') - 1 + 2);
	}
	
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
	var queryData = function () {
		// cach用于缓存在上一次ajax请求时创建的xhr对象和对应load事件调用的处理程序，以便移除上一次创建的load事件和xhr对象
		var cach = {getData:null, throwExcept:null, xhr:null};
		return function(callback, url, options) {
			// 清除在上一次ajax请求时创建的load事件、error事件及其事件处理程序和xhr对象
			if (cach.getData instanceof Function && cach.throwExcept instanceof Function && (cach.xhr instanceof XMLHttpRequest || cach.xhr instanceof XDomainRequest)) {
				EventUtil.removeHandler(cach.xhr, 'load', cach.getData);
				EventUtil.removeHandler(cach.xhr, 'error', cach.throwExcept);
				cach.throwExcept = null;
				cach.getData = null;
				cach.xhr = null;
				delete callback.response;// 删除callback中存储响应报文的属性，为waitResponse模拟同步请求铺路
				console.log('clear the xhr, load event and the previous response successfully.');
			}
			function getData (event) {
				callback(xhr.responseText);
			}
			function throwExcept (event) {
				console.log('Request unsuccessfully:' + xhr.status);
			}
			var queryOpt = url + ((typeof options === 'string' && options.length > 0) ? '?' + options : '');
			var xhr = CompatUtil.createCORSRequest('get', queryOpt);// IE8的XMLHttpRequest不支持跨域，只能用XDomainRequest
			if (xhr) {
				EventUtil.addHandler(xhr, 'load', getData);
				EventUtil.addHandler(xhr, 'error', throwExcept);
				xhr.send(null);
			}
			// console.log(callback.response);

			// 将xhr对象和事件处理程序缓存到下一次ajax请求，以便移除
			cach.xhr = xhr;
			cach.getData = getData;
			cach.throwExcept = throwExcept;
		}
	}();

	/**
	 * 获取ajax请求的callback函数
	 * @description [接收请求的响应报文主体，并存储于函数的response属性中，以便处理]
	 * @param {[XHR responseText]} [response] [接收字符串形式的ajax请求的响应报文主体]
	 * 
	 */
	function getServerData (response) {
		arguments.callee.response = JSON.parse(response);
		// console.log(response);
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
	function waitResponse (execFunc, errFunc, callback, url, options) {
		var maxTimeout = 50;
		queryData(callback, url, options);

		function intervalTimeOut () {
			// console.log(callback.response);
			// queryData中删除callback.response有利于此处正确判断
			if (typeof callback.response !== 'undefined') {
				clearInterval(arguments.callee.intervalID);
				execFunc();
			} else if (maxTimeout <= 0) {// 请求超时
				clearInterval(arguments.callee.intervalID);
				errFunc();
				return ;
			}
			maxTimeout--;
		}
		// 多次判断请求结果，应对较差网络环境
		intervalTimeOut.intervalID = setInterval(intervalTimeOut, 500);
	}
});


/*
// 获取服务器端数据
var queryData = function () {
	// cach用于缓存在上一次ajax请求时创建的xhr对象和对应load事件调用的处理程序，以便移除上一次创建的load事件和xhr对象
	var cach = {getData:null, xhr:null};
	return function(callback, url, options) {
		// 清除在上一次ajax请求时创建的load事件和xhr对象
		if (getType(cach.getData) === 'function' && getType(cach.xhr) === 'xmlhttprequest') {
			EventUtil.removeHandler(cach.xhr, 'load', cach.getData);
			// cach.xhr.removeEventListener('load', cach.getData);
			cach.getData = null;
			cach.xhr = null;
			console.log('clear xhr and load event');
		}
		var xhr = CompatUtil.createXHR(),
		queryOpt = url + ((typeof options === 'string' && options.length > 0) ? '?' + options : '');
		function getData (event) {
			if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
				callback(xhr.responseText);
			} else {
				console.log('Request unsuccessfully:' + xhr.status);
				return ;
			}
		}
		xhr.open('get', queryOpt, true);
		xhr.send(null);
		// xhr.addEventListener('load', getData);
		EventUtil.addHandler(xhr, 'load', getData);
		// console.log(callback.response);
		// 将xhr对象和事件处理程序缓存到下一次ajax请求，以便移除
		cach.xhr = xhr;
		cach.getData = getData;
	}
}();
// var url = 'http://study.163.com/webDev/couresByCategory.htm',
// queryOpt = serialize({pageNo:2,psize:10, type:10});
// var url = 'http://study.163.com/webDev/attention.htm';
// queryData(getServerData, url, queryOpt);
// queryData(getServerData, url);
*/



// (function () {
// 	var xhr = CompatUtil.createXHR();
// 	var url = 'http://study.163.com/webDev/attention.htm';
// 	xhr.open('get', url, true);
// 	xhr.send(null);
// 	// xhr.addEventListener('load', getCookie);
// 	EventUtil.addHandler(xhr, 'load', getCookie);
// 	function getCookie (event) {
// 		console.log(xhr.responseText);
// 	}
// })();
// var obj = '';
// (function () {
// 	var url = 'http://study.163.com/webDev/couresByCategory.htm',
// 	queryOpt = serialize({pageNo:2,psize:1, type:10});
// 	var xhr = CompatUtil.createXHR();
// 	xhr.open('get',url+'?'+queryOpt);
// 	xhr.send(null);
// 	xhr.addEventListener('load', getData);
// 	function getData (event) {
// 		obj = JSON.parse(xhr.responseText);
// 	}
// })();


// (function () {
// 	var loginMod = document.getElementById('login'),
// 	flogin = loginMod.querySelector('.j-flogin'),
// 	usernmTxt = loginMod.querySelector('.j-username'),
// 	passwdTxt = loginMod.querySelector('.j-password'),
// 	errmsg = loginMod.querySelector('.j-errmsg'),
// 	btn = loginMod.querySelector('.j-submit'),
// 	close = loginMod.querySelector('.j-cnclicon');
// 	var url1 = "http://study.163.com/webDev/login.htm",
// 	url2 = 'http://study.163.com/webDev/attention.htm',
// 	queryOpt = {userName: md5('studyOnline'), password: md5('study.163.com')};
// 	var xhr = CompatUtil.createXHR(),
// 	queryOpt = url1 + '?' + serialize(queryOpt);
// 	console.log('query option:' + queryOpt);
// 	xhr.onload = function (event) {
// 		if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
// 			getServerData(xhr.responseText);
// 		} else {
// 			console.log('Request unsuccessfully:' + xhr.status);
// 			return ;
// 		}
// 	}
// 	xhr.open('get', queryOpt);
// 	// xhr.setRequestHeader('Access-Control-Allow-Origin', url1);
// 	xhr.send(null);
// 	setTimeout(function () {
// 		console.log(getServerData.response);
// 	}, 5000);
// })();


// 简化版数据查询，不兼容IE的跨域
// function queryData (callback, url, options) {
// 	var xhr = CompatUtil.createXHR(),
// 	query = url + ((typeof options === 'string' && options.length > 0) ? ('?' + options) : '');
// 	xhr.onload = function (event) {
// 		callback(xhr.responseText);
// 	}
// 	xhr.open('get', query);
// 	xhr.send(null);
// }