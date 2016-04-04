/**
 * [closeMsgLsnr 关闭顶部信息条]
 */
function closeMsgLsnr(event) {
    var topmsg = document.querySelector('.j-topmsg');
    setCookie('hiddenTopMsg', true, new Date((+new Date()).valueOf() + 86400000)); // 设置一天的失效时间
    topmsg.style.display = 'none';
}

/**
 * [openLogin 登录交互部分]
 * @param  {[type]} [flwElm] [设置关注的DOM节点]
 */
function openLogin(flwElm) {
    var _loginMod = document.querySelector('.j-mlogin'),
        _usernmTxt = _loginMod.querySelector('.j-username'),
        _passwdTxt = _loginMod.querySelector('.j-password'),
        _errmsg = _loginMod.querySelector('.j-errmsg'),
        _btn = _loginMod.querySelector('.j-submit'),
        _close = _loginMod.querySelector('.j-cnclicon');

    // quick test code
    // _usernmTxt.value = 'studyOnline';
    // _passwdTxt.value = 'study.163.com';

    /**
     * [hiddenErr 隐藏错误提示]
     * @param  {[DOM node]} [elm] [用于展示错误提示的DOM节点]
     */
    function hiddenErr(elm) {
        elm.style.visibility = 'hidden';
    }

    /**
     * [showErr 显示登录模块的错误提示]
     * @param  {[DOM node]} [elm] [用于展示错误提示的DOM节点]
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
                showErr(_errmsg, '账户错误，请输入：studyOnline');
            } else {
                _target.style.borderColor = '';
                hiddenErr(_errmsg);
            }
        } else if (_target === _passwdTxt) {
            if (_target.value !== 'study.163.com') {
                _target.style.borderColor = 'red';
                showErr(_errmsg, '密码错误，请输入：study.163.com');
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
     * [addInputFrm 添加输入框事件]
     * @param {[Input node]} [elm] [输入框节点DOM对象]
     */
    function addInputFrm(elm) {
        addHandler(elm, 'keypress', keyPressLsnr);
        addHandler(elm, 'blur', focusBlurLsnr);
    }
    /**
     * [rmInputFrm 移除输入框事件]
     * @param  {[Input node]} [elm] [输入框节点DOM对象]
     */
    function rmInputFrm(elm) {
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
        rmInputFrm(_usernmTxt);
        rmInputFrm(_passwdTxt);
    }
    /**
     * [sendLogin 向服务器端发送登录信息]
     * @param  {[string]} [res] [响应主体的字符串形式]
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
     * @param  {[XMLHttpRequest]} [xhr] [ajax对象，用于提取特定错误信息]
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
    addInputFrm(_usernmTxt);
    addInputFrm(_passwdTxt);
    addHandler(_close, 'click', closeLoginLsnr);
    hiddenErr(_errmsg);
    addHandler(_btn, 'click', submitLoginLsnr); // 添加提交登录事件
}
/**
 * [addFlwLsnr 点击关注]
 */
function addFlwLsnr(event) {
    var _target = getTarget(getEvent(event));
    var _url = 'http://study.163.com/webDev/attention.htm';
    var _loginSuc = '';
    function sendFlw(res) {
        res = JSON.parse(res);
        if (res === 1) {
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

/* 移除关注 */
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

/**
 * [loadFollow 加载关注后的状态]
 * @param  {[DOM node]} [flwElm] [关注按钮对应的DOM节点]
 */
function loadFollow(flwElm) {
    var _unflw = flwElm.nextElementSibling,
        _fans = _unflw.nextElementSibling;
    flwElm.style.display = 'none';
    _unflw.style.display = 'inline-block';
    maniInnerText(_fans, 'set', maniInnerText(_fans, 'get') - 1 + 2); // 修改粉丝数量
}

/**
 * [openVdoWin 点击机构介绍的视频，打开视频窗口]
 */
function openVdoWin(event) {
    var _fxWin = document.querySelector('.j-fxwin'),
        _parent = _fxWin.parentNode,
        _clsBtn = _fxWin.querySelector('.j-clsvideo'),
        _video = _fxWin.querySelector('.vuj-vdosrc'),
        _playPic = _fxWin.querySelector('.j-playicon');

    // 显示前台视频窗口
    _parent.style.display = 'block';

    // 防止第二次打开前台视频窗口时，播放大图标显示不正确
    _playPic.style.display = _video.paused ? 'block' : 'none';

    /* 点击播放大图标播放视频 */
    function clkPlayEv(event) {
        _video.play();
        _playPic.style.display = 'none';
    }
    addHandler(_playPic, 'click', clkPlayEv);

    /* 监听播放和暂停事件，来同步改变播放大图标的显示和隐藏 */
    function playLsnr(event) {
        _playPic.style.display = 'none';
    }

    function pauseLsnr(event) {
        _playPic.style.display = 'block';
    }
    addHandler(_video, 'play', playLsnr);
    addHandler(_video, 'pause', pauseLsnr);

    /**
     * [clsVdoWin 关闭视频窗口]
     */
    function clsVdoWin(event) {
        try { // 防止IE不支持video而无法关闭视频窗口
            _video.pause();
        } catch (e) {
            maniInnerText(_video, 'set', '您的浏览器版本太低，不支持播放此视频。');
            console.log('IE unsupport the video');
        }
        _parent.style.display = 'none';
        removeHandler(_playPic, 'click', clkPlayEv);
        removeHandler(_video, 'play', playLsnr);
        removeHandler(_video, 'pause', pauseLsnr);
        removeHandler(_clsBtn, 'click', clsVdoWin);
        _playPic = null;
        _video = null;
        _clsBtn = null;
        _parent = null;
        _fxWin = null;
    }
    addHandler(_clsBtn, 'click', clsVdoWin);
}

addHandler(window, 'load', function() {
    /* 顶部信息条 */
    var topmsg = document.querySelector('.j-topmsg'),
        msgcls = topmsg.querySelector('.j-msgcls');
    if (getCookie('hiddenTopMsg')) {
        topmsg.style.display = 'none';
    }
    addHandler(msgcls, 'click', closeMsgLsnr);

    /* 关注触发部分 */
    var flw = document.querySelector('.j-flw'),
        unflw = document.querySelector('.j-cncl');
    var followSuc = getCookie('followSuc');
    if (followSuc) {
        loadFollow(flw); // 加载关注状态
    }
    addHandler(flw, 'click', addFlwLsnr); // 添加关注
    addHandler(unflw, 'click', rmFlwLsnr); // 取消关注

    /* 机构介绍视频 */
    var poster = document.querySelector('.j-poster');
    poster.addEventListener('click', openVdoWin);
});
