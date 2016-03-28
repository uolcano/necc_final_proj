/**
 * [closeMsgLsnr 关闭顶部信息条]
 */
function closeMsgLsnr(event) {
    setCookie('hiddenTopMsg', true, new Date((+new Date()).valueOf() + 86400000)); // 设置一天的失效时间
    topmsg.style.display = 'none';
}

/* 顶部信息条 */
var topmsg = document.querySelector('.j-topmsg'),
    msgcls = topmsg.querySelector('.j-msgcls');
if (getCookie('hiddenTopMsg')) {
    topmsg.style.display = 'none';
}
addHandler(msgcls, 'click', closeMsgLsnr);

/**
 * [openLogin 登录交互部分]
 * @param  {[type]} flwElm [设置关注的DOM节点]
 */
function openLogin(flwElm) {
    var _loginMod = document.querySelector('.j-mlogin'),
        // _flogin = _loginMod.querySelector('.j-flogin'),
        _usernmTxt = _loginMod.querySelector('.j-username'),
        _passwdTxt = _loginMod.querySelector('.j-password'),
        _errmsg = _loginMod.querySelector('.j-errmsg'),
        _btn = _loginMod.querySelector('.j-submit'),
        _close = _loginMod.querySelector('.j-cnclicon');

    // quick test code
    _usernmTxt.value = 'studyOnline';
    _passwdTxt.value = 'study.163.com';

    /**
     * [hiddenErr 隐藏]
     * @param  {[DOM node]} elm [用于展示错误提示的DOM节点]
     */
    function hiddenErr(elm) {
        elm.style.visibility = 'hidden';
    }

    /**
     * [showErr 显示登录模块的错误提示]
     * @param  {[DOM node]} elm [用于展示错误提示的DOM节点]
     * @param  {[string]}   text [错误提示文本]
     */
    function showErr(elm, text) {
        elm.style.visibility = 'visible';
        maniInnerText(elm, 'set', text);
    }

    /**
     * @description [设置登录成功后的禁用状态]
     * @param {[DOM node]}  [elem1, elem2] [对应表单的账户和密码输入框DOM节点对象，无顺序要求]
     * @param {[DOM node]}  [elem3]        [对应提交按钮的DOM节点对象]
     * @param {[bool]}      [disable]      [确定禁用表单元素还是解除禁用]
     */
    function disableAct(elem1, elem2, elem3, disable) {
        elem1.disabled = disable;
        elem2.disabled = disable;
        elem3.disabled = disable;
        elem3.classList[disable ? 'add' : 'remove']('disabled');
    }

    /**
     * [keyPressLsnr 当输入框中输入时，隐藏和输入错误提示placeholder]
     */
    function keyPressLsnr(event) {
        event = getEvent(event);
        var _target = getTarget(event);
        var _placeholder = _target.nextElementSibling;

        _target.style.borderColor = '';
        hiddenErr(_errmsg);
        _placeholder.style.display = 'none';
    }

    /**
     * [focusBlurLsnr 当输入框失去焦点时，验证输入信息并给出错误提示，验证是否显示placeholder]
     */
    function focusBlurLsnr(event) {
        event = getEvent(event);
        var _target = getTarget(event),
            _placeholder = _target.nextElementSibling,
            _value = '';
        /* 显示输入错误提示 */
        if (_target === _usernmTxt) {
            if (_target.value !== 'studyOnline') {
                _target.style.borderColor = 'red';
                showErr(_errmsg, '账户错误');
            } else {
                _target.style.borderColor = '';
                hiddenErr(_errmsg);
            }
        } else if (_target === _passwdTxt) {
            if (_target.value !== 'study.163.com') {
                _target.style.borderColor = 'red';
                showErr(_errmsg, '密码错误');
            } else {
                _target.style.borderColor = '';
                hiddenErr(_errmsg);
            }
        }
        /* 舍去空白符，验证是否显示placeholder */
        _value = _target.value.replace(/\s/g, '');
        _target.value = _value;
        if (!_value.length) {
            _placeholder.style.display = 'block';
        } else {
            _placeholder.style.display = 'none';
        }
    }

    /**
     * [addInputFrmLsnr 添加输入框事件]
     * @param {[Input node]} elm [输入框节点DOM对象]
     */
    function addInputFrmLsnr(elm) {
        addHandler(elm, 'keypress', keyPressLsnr);
        addHandler(elm, 'blur', focusBlurLsnr);
    }
    /**
     * [rmInputFrmLsnr 移除输入框事件]
     * @param  {[Input node]} elm [输入框节点DOM对象]
     */
    function rmInputFrmLsnr(elm) {
        removeHandler(elm, 'keypress', keyPressLsnr);
        removeHandler(elm, 'blur', focusBlurLsnr);
    }
    /**
     * [closeLoginLsnr 关闭登录框后，移除登陆模块的相关事件]
     */
    function closeLoginLsnr() {
        _loginMod.style.display = 'none';
        removeHandler(_close, 'click', closeLoginLsnr);
        removeHandler(_btn, 'click', submitLoginLsnr);
        rmInputFrmLsnr(_usernmTxt);
        rmInputFrmLsnr(_passwdTxt);
    }
    /**
     * [sendLogin 向服务器端发送登录信息]
     * @param  {[string]} res [响应主体的字符串形式]
     */
    function sendLogin(res) {
        disableAct(_usernmTxt, _passwdTxt, _btn, false); // 收到登录响应后，解除禁用
        res = JSON.parse(res);
        if (res === 1) {
            showErr(_errmsg, '登录成功');
            setCookie('loginSuc', true, new Date((+new Date()).valueOf() + 86400000));
            setCookie('followSuc', true, new Date((+new Date()).valueOf() + 86400000));
            loadFollow(flwElm); // 登录成功，修改关注样式
            closeLoginLsnr(); // 登录成功，关闭登录模块
        } else if (res === 2) {
            showErr(_errmsg, '登录失败');
        } else { // 处理服务器返回数据错误
            console.log('Unexpected login response!');
        }
    }

    /**
     * [errLogin 登录超时]
     * @param  {[XMLHttpRequest]} xhr [ajax对象，用于提取特定错误信息]
     */
    function errLogin(xhr) {
        var _errstr = 'Login timeout!' + xhr.status;
        disableAct(_usernmTxt, _passwdTxt, _btn, false); // 登录请求响应错误，解除禁用
        showErr(_errmsg, _errstr);
    }
    /* 按钮提交处理程序 */
    function submitLoginLsnr() {
        var _url = "http://study.163.com/webDev/login.htm",
            _queryOpt = {
                userName: md5(_usernmTxt.value),
                password: md5(_passwdTxt.value)
            };

        disableAct(_usernmTxt, _passwdTxt, _btn, true); // 提交登录后，禁用输入框和登录按钮
        queryDataSync(sendLogin, errLogin, _url, serialize(_queryOpt));
    }


    /* 显示登录模块并添加事件 */
    _loginMod.style.display = 'block';
    addInputFrmLsnr(_usernmTxt);
    addInputFrmLsnr(_passwdTxt);
    addHandler(_close, 'click', closeLoginLsnr);
    hiddenErr(_errmsg);
    // 添加登录事件
    addHandler(_btn, 'click', submitLoginLsnr);
}

function addFlwLsnr(event) {
    var _target = getTarget(getEvent(event));
    var _url = 'http://study.163.com/webDev/attention.htm';
    var _loginSuc = '';

    function sendFlw(res) {
        res = JSON.parse(res);
        if (res === 1) {
            console.log(res);
            _loginSuc = getCookie('loginSuc');
            if (!_loginSuc) {
                openLogin(_target);
            } else {
                loadFollow(_target);
                setCookie('followSuc', true, new Date((+new Date()).valueOf() + 86400000)); // 设置cookie一天后失效
            }
        }
    }

    function errFlw(xhr) {
        console.log('Response error:', xhr.status);
    }
    queryDataSync(sendFlw, errFlw, _url);
}

/* 移除关注的事件处理程序 */
function rmFlwLsnr(event) {
    var _target = getTarget(getEvent(event)),
        _parent = _target.parentNode,
        _flw = _parent.previousElementSibling,
        _fans = _parent.nextElementSibling;
    unsetCookie('followSuc');
    _flw.style.display = 'inline-block';
    _parent.style.display = 'none';
    maniInnerText(_fans, 'set', maniInnerText(_fans, 'get') - 1);
}

/* 设置关注后的状态 */
function loadFollow(flwElm) {
    var _unflw = flwElm.nextElementSibling,
        _fans = _unflw.nextElementSibling;
    flwElm.style.display = 'none';
    _unflw.style.display = 'inline-block';
    maniInnerText(_fans, 'set', maniInnerText(_fans, 'get') - 1 + 2); // 修改粉丝数量
}

/* 关注触发部分 */
var flw = document.querySelector('.j-flw'),
    unflw = document.querySelector('.j-cncl');
var followSuc = getCookie('followSuc');
if (followSuc) {
    loadFollow(flw); // 加载关注状态
}
addHandler(flw, 'click', addFlwLsnr); // 添加关注
addHandler(unflw, 'click', rmFlwLsnr); // 取消关注


var bnr = document.querySelector('.j-bnr'),
    sld = bnr.querySelector('.j-slide');
var bnrIdx = 0; // 当前轮播图位置
var bnrCache = []; // 缓存轮播图的DOM节点

/**
 * [ptrCtrlBnr 滑块指示器控制轮播]
 * @param  {[DOM node]} elem    [整个轮播图DOM节点]
 * @param  {[Integer]}  index   [滑块指示器当前位置]
 * @param  {[Integer]}  reverse [非零整数，正数表示正向控制轮播图，负数表示反向控制轮播图]
 */
function ptrCtrlBnr(elem, index, reverse) {
    // console.log('ptrCtrlBnr');
    setOpacity(elem[index], 0); // 先设为全透明图，配合淡入效果
    elem[(index + 2 * (reverse > 0 ? 1 : -1) + 3) % 3].style.zIndex = -1;
    elem[(index + 1 * (reverse > 0 ? 1 : -1) + 3) % 3].style.zIndex = -2;
    elem[index].style.zIndex = 1;
    fadeIn(elem[index], 500, 10);
}

function intvlSwitchBnr() {
    sld.parentNode.querySelector('.z-crt').classList.remove('z-crt');
    bnrIdx = (bnrIdx + 1) % 3; // 计算下一个轮播图的位置
    sld.children[bnrIdx].classList.add('z-crt');
    ptrCtrlBnr(bnrCache, bnrIdx, 1);
}

function msEnter(event) {
    // console.log('banner switch paused');
    clearInterval(intervalID);
}
// 鼠标移出轮播图时的事件处理程序
function msLeave(event) {
    // console.log('banner switch running');
    intervalID = setInterval(intvlSwitchBnr, 5000);
}
// 鼠标悬停于滑块指示器上时的事件处理程序
function msOver(event) {
    var target = getTarget(getEvent(event));
    if (target.classList.item(0) === 'sldptr') { // 冒泡事件，只处理滑块的指示器，*!与.sldptr强耦合
        var ptrIdx = target.classList.item(1).slice(3) - 1; // 通过.sld1, .sld2, .sld3获取当前指示器位置，*!强耦合
        // console.log('bnrIdx:'+bnrIdx+', ptrIdx:'+ptrIdx);// 此处bnrIdx为当前未修改的轮播图位置
        if (ptrIdx - bnrIdx) { // 相等时不播放轮播
            ptrCtrlBnr(bnrCache, ptrIdx, ptrIdx - bnrIdx);
        }
        bnrIdx = ptrIdx; // 同步当前轮播图位置为当前滑块指示器位置
        target.parentNode.querySelector('.z-crt').classList.remove('z-crt');
        target.classList.add('z-crt');
    }
}

for (var i = 0; i < 3; i++) {
    bnrCache.push(bnr.children[i]); // *!与HTML页面中轮播图DOM节点结构有强耦合
    // console.log('bnr'+i+':'+bnrCache[i]);
}

var intervalID = setInterval(intvlSwitchBnr, 5000); // 设置初始自动轮播
bnr.addEventListener('mouseenter', msEnter);
bnr.addEventListener('mouseleave', msLeave);
sld.addEventListener('mouseover', msOver); // 利用事件冒泡，控制滑块指示器悬停时间

/**
 * [setOpacity 设置DOM节点的透明度]
 * @param {[DOM node]} elem  [需要设置透明度的DOM节点]
 * @param {[Integer]}  value [透明度，以0~10表示]
 */
function setOpacity(elem, value) {
    if (typeof elem.style.opacity === 'string') {
        elem.style.opacity = value / 10.0 + '';
    } else {
        elem.style.filter = 'alpha(opacity=' + (value * 10) + ')';
    }
}

/**
 * [fadeIn 图片淡入]
 * @param  {[DOM node]} elem        [准备淡入的DOM节点]
 * @param  {[Integer]}  maxFadeTime [最大淡入时间]
 * @param  {[Integer]}  steps       [淡入的渐进幅度]
 */
function fadeIn(elem, maxFadeTime, steps) {
    var aTime = maxFadeTime / steps,
        value = 0;

    function timoutFunc() {
        // console.log('step: '+value);
        value++;
        setOpacity(elem, value);
        if (steps > value) {
            setTimeout(arguments.callee, aTime);
        } else {
            // console.log('fade done');
        }
    }
    setTimeout(timoutFunc, aTime);
}

/**
 * [switchBnr 自动轮播，无事件控制，测试用]
 * @param  {[DOM node]} bnrElem     [整个轮播图的DOM节点]
 * @param  {[DOM node]} sldElem     [整个滑块指示器的DOM节点]
 * @param  {[Integer]}  intvlTime   [轮播间歇时间]
 * @param  {[Integer]}  maxFadeTime [最大淡入时间]
 * @param  {[Integer]}  steps       [淡入的渐进幅度]
 */
function switchBnr(bnrElem, sldElem, intvlTime, maxFadeTime, steps) {
    var index = 0;
    var maxTimes = 5;

    function timeoutFunc() {
        sldElem.children[index].classList.remove('z-crt');
        index = (index + 1) % 3;
        sldElem.children[index].classList.add('z-crt');
        setOpacity(bnrElem.children[index], 0);
        bnrElem.children[(index + 2) % 3].style.zIndex = -1;
        bnrElem.children[(index + 1) % 3].style.zIndex = -2;
        bnrElem.children[index].style.zIndex = 1;
        fadeIn(bnrElem.children[index], maxFadeTime, steps);
        maxTimes--;
        if (maxTimes) {
            setTimeout(timeoutFunc, intvlTime);
        }
    }
    setTimeout(timeoutFunc, intvlTime);
}
