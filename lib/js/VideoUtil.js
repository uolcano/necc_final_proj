var VideoUtil = {
    mouseMoving: !1,
    ptrPosX: 0,
    ptrPosY: 0,
    moveTarget: null, // 指示器父节点，进度条对应的DOM节点对象
    mvTgtParent: null, // 进度条的父节点，进度条总槽
    movePtrStart: function(evObj) { // evObj是指示器对应DOM节点对象的事件对象
        evObj = this.getEvent(evObj);
        this.moveTarget = this.getTarget(evObj);
        this.mvTgtParent = this.moveTarget.parentNode;
        this.ptrPosX = evObj.clientX;
        this.ptrPosY = evObj.clientY;
        this.mouseMoving = !0;
        try {
            this.moveTarget.classList.add('vuz-draged');
        } catch (e) {
            console.log('Error: need for the className of "vuz-draged"');
        }
    },
    movePtrDuring: function(evObj, flag) {
        if (this.mouseMoving) {
            var _parent = this.mvTgtParent,
                _style = _parent.style;
            var _grandpa = _parent.parentNode,
                _grpStyle = this.getComputedStyle(_grandpa);

            evObj = this.getEvent(evObj);

            var _width = parseFloat(_style.width || 0), // 控制指示器父容器的宽度
                _height = parseFloat(_style.height || 0),
                _grpWidth = parseFloat(_grpStyle.width), // 不能超出父容器的父容器的宽度
                _grpHeight = parseFloat(_grpStyle.height),
                _moveToX = evObj.clientX, // 获取当前鼠标位置
                _moveToY = evObj.clientY;
            switch (flag) {
                case 'fixed':
                    var _tmpWidth = _moveToX - this.ptrPosX + _width; // 获取计算后的指示器父容器宽度，并限制在容器的父容器内
                    var _tmpHeight = this.ptrPosY - _moveToY + _height;
                    if (_tmpWidth >= 0 && _tmpWidth <= _grpWidth) _style.width = _tmpWidth + 'px';
                    if (_tmpHeight >= 0 && _tmpHeight <= _grpHeight) _style.height = _tmpHeight + 'px';
                    break;
                case 'dynamic': // 用于指示器的容器槽有增长动画的情况，必须使用百分比
                    _tmpWidth = (this.ptrPosX - _moveToX + _width) / _grpWidth;
                    _tmpHeight = (this.ptrPosY - _moveToY + _height) / _grpHeight;
                    if (_tmpWidth >= 0 && _tmpWidth <= 1) _style.width = _tmpWidth * 100 + '%';
                    if (_tmpHeight >= 0 && _tmpHeight <= 1) _style.height = _tmpHeight * 100 + '%';
                    break;
                default:
                    console.log('Error: need for the flag of "fixed" or "dynamic".');
                    break;
            }
            // 记录当前鼠标位置，以备下次事件触发时使用
            this.ptrPosX = _moveToX;
            this.ptrPosY = _moveToY;
        }
    },
    movePtrEnd: function(evObj) {
        this.mouseMoving = !1;
        try {
            this.moveTarget.classList.remove('vuz-draged');
        } catch (e) {
            // console.log('message: not yet get pointer');
        }
    },
    movePtrMiss: function(evObj) {
        this.mouseMoving = !1;
        try {
            this.moveTarget.classList.remove('vuz-draged');
        } catch (e) {
            // console.log('message: not yet get pointer');
        }
    },
    /**
     * [getComputedStyle 获取当前元素的样式计算值]
     * @param  {[DOM node]} [elm] [当前元素的DOM节点]
     * @return {[style list]}     [样式计算值]
     */
    getComputedStyle: function(elm) {
        return elm.currentStyle ? elm.currentStyle : document.defaultView.getComputedStyle(elm);
    },
    getEvent: function(event) {
        return event || window.event;
    },
    getTarget: function(event) {
        return event.target || event.srcElements;
    },
    timeoutId: 0, // 用于显示/隐藏控制面板时，清除/恢复超时调用
    /**
     * [panelHidden 隐藏控制面板]
     */
    panelHidden: function(evObj) {
        var _target = this.getTarget(this.getEvent(evObj));
        try {
            _target.classList.add('vuz-hidden'); // *!与HTML和CSS高度耦合
        } catch (e) {
            console.log('Error: need for the className of "vuz-hidden"');
        }

        function fadeFunc() {
            _target.style.opacity = '0';
        }
        this.timeoutId = setTimeout(fadeFunc, 8000); // 跟CSS的kf-showpanel的动画时间有强耦合
    },
    /**
     * [panelShow 显示控制面板]
     */
    panelShow: function(evObj) {
        var _target = this.getTarget(this.getEvent(evObj));
        clearTimeout(this.timeoutId);
        try {
            _target.classList.remove('vuz-hidden');
        } catch (e) {
            console.log('message: not yet add the className of "vuz-hidden"');
        }
        _target.style.opacity = '';
    },
    /**
     * [getElmOffset 获取元素相对于浏览器视口的偏移量]
     * @param  {[DOM node]} [elm] [某个指定的元素对应的DOM节点]
     * @return {[object]}         [存储了元素偏移量的对象]
     */
    getElmOffset: function(elm) {
        var _offset = { x: 0, y: 0 },
            _parent = elm.offsetParent;
        _offset.x += elm.offsetLeft;
        _offset.y += elm.offsetTop;
        while (_parent) {
            _offset.x += _parent.offsetLeft + parseFloat(this.getComputedStyle(_parent).borderLeftWidth); // 算上参考容器的边框宽
            _offset.y += _parent.offsetTop + parseFloat(this.getComputedStyle(_parent).borderTopWidth);
            _parent = _parent.offsetParent;
            // console.log(offset);
        }
        return _offset;
    },
    /**
     * [getCrtCache 获取当前缓存的开始与结束位置]
     * @param  {[DOM node]} [vdoElm] [视频对应DOM节点]
     * @return {[object]}          [当前缓存的位置]
     */
    getCrtCache: function(vdoElm) {
        var _crtTime = vdoElm.currentTime,
            _cacheArr = vdoElm.buffered;
        var _crtCache = {
                start: 0,
                end: 0
            },
            _crtCacheIdx = 0;
        for (var i = 0, len = _cacheArr.length; i < len; i++) {
            if (_cacheArr.start(i) <= _crtTime && _cacheArr.end(i) >= _crtTime) {
                _crtCacheIdx = i;
                break;
            }
        }
        _crtCache.start = _cacheArr.start(_crtCacheIdx);
        _crtCache.end = _cacheArr.end(_crtCacheIdx);
        // console.log('bufferNo:', _crtCacheIdx, 'cacheStart:', _crtCache.start, ', cacheEnd:', _crtCache.end, 'crtTime:', crtTime);
        return _crtCache;
    },
    /**
     * [loadStart 加载视频资源，直至网络良好并成功加载完成]
     * @param  {[DOM node]} [vdoElm] [视频对应DOM节点]
     */
    loadStart: function(vdoElm) {
        var _reloadCnt = 0;

        function reloadVideo() {
            _reloadCnt++;
            if (vdoElm.networkState > 0 || _reloadCnt > 50) {
                clearInterval(arguments.callee.intvlId);
            } else if (!vdoElm.readyState) {
                console.log('bad network, load video again. readyState:', vdoElm.readyState);
                vdoElm.load();
            }
        }
        try {
            vdoElm.load();
        } catch (e) {
            console.log('IE unsupport the video');
        }
        // console.log('status:', vdoElm.readyState, vdoElm.networkState);
        reloadVideo.intvlId = setInterval(reloadVideo, 5000);
    },
    /**
     * [setFullWin 激活/关闭全屏]
     */
    setFullWin: function() {
        var _vdoWin = null;
        try {
            _vdoWin = document.querySelector('.vuj-vdowin.vuz-fulled');
            _vdoWin.classList.remove('vuz-fulled');
            // console.log('zoom in');
        } catch (e) {
            _vdoWin = document.querySelector('.vuj-vdowin');
            _vdoWin.classList.add('vuz-fulled');
            // console.log('zoom out');
        }
    },
    /**
     * [formatTime 格式化时间]
     * @param  {[integer]} [second] [秒钟数]
     * @return {[string]}           [字符串形式的时间]
     */
    formatTime: function(second) {
        var _sec = Math.floor(second);
        var _hour = Math.floor((_sec / 3600));
        var _min = Math.floor((_sec %= 3600) / 60);
        _sec %= 60;
        return (_hour ? _hour + ':' : '') + (_min < 10 ? '0' + _min : _min) + ':' + (_sec < 10 ? '0' + _sec : _sec);
    },
    /**
     * [playVideo 播放/暂停控制]
     * @param  {[DOM node]} [vdoElm]  [视频对应DOM节点]
     * @param  {[DOM node]} [playElm] [音量按钮对应DOM节点]
     */
    playVideo: function(vdoElm, playElm) {
        var _playIcon = playElm.children[0];
        // console.log(playElm, _playIcon);
        if (!vdoElm.paused) {
            try {
                _playIcon.classList.remove('vuz-paused');
                _playIcon.classList.add('vuz-running');
            } catch (e) {
                console.log(e);
            }
        } else {
            try {
                _playIcon.classList.remove('vuz-running');
                _playIcon.classList.add('vuz-paused');
            } catch (e) {
                console.log(e);
            }
        }
    },
    /**
     * [sndMuted 静音控制]
     * @param  {[DOM node]} [vdoElm] [视频对应DOM节点]
     * @param  {[DOM node]} [sndElm] [音量按钮对应DOM节点]
     */
    sndMuted: function(vdoElm, sndElm) {
        var _vlm = vdoElm.volume;
        if (_vlm > 0) {
            var _sndIcon = sndElm.querySelector('.vuj-sndicon');
            var _classNm = 'vuz-vlm' + (_vlm > 0.5 ? 2 : 1);
            // console.log(_vlm, vdoElm.muted,'to muted:', vdoElm, _sndIcon);
            if (vdoElm.muted) {
                try {
                    _sndIcon.classList.remove('vuz-muted');
                    _sndIcon.classList.add(_classNm);
                    vdoElm.muted = false;
                } catch (e) {
                    console.log(e);
                }
            } else {
                try {
                    _sndIcon.classList.remove(_classNm);
                    _sndIcon.classList.add('vuz-muted');
                    vdoElm.muted = true;
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }
};

addHandler(window, 'load', function() {
    (function(doc) {
        var vdoWin = doc.querySelector('.vuj-vdowin');
        var netwkInfoTxt = vdoWin.querySelector('.vuj-netwkinfo'),
            fullWinBtn = vdoWin.querySelector('.vuj-fullwin');
        // time pass module
        var crtTmTxt = vdoWin.querySelector('.vuj-crttime'),
            durTmTxt = vdoWin.querySelector('.vuj-duration');
        // sound control module
        var sndVlm = vdoWin.querySelector('.vuj-sndvlm'),
            sndIcon = sndVlm.querySelector('.vuj-sndicon'),
            sndBar = sndVlm.querySelector('.vuj-sndbar'),
            vlmBar = sndVlm.querySelector('.vuj-volume'),
            sndPtr = sndVlm.querySelector('.vuj-ptr');
        // control bar module
        var ctrlBar = vdoWin.querySelector('.vuj-ctrlbar'),
            cacheBar = ctrlBar.querySelector('.vuj-cache'),
            progrsBar = ctrlBar.querySelector('.vuj-progrs'),
            ctrlPtr = progrsBar.querySelector('.vuj-ptr');
        var playCtrl = vdoWin.querySelector('.vuj-playctrl');
        var vdo = null;

        try {
            vdo = vdoWin.querySelector('.vuj-vdosrc');
            vdo.src = 'http://mov.bn.netease.com/open-movie/nos/mp4/2014/12/30/SADQ86F5S_shd.mp4';
            VideoUtil.loadStart(vdo);
        } catch (e) {
            console.log(e);
        }
        if (typeof vdo.play === 'function') {
            /* 初始化视频及控件 */
            addHandler(vdo, 'loadedmetadata', readyMetaDataLsnr);
            /* 准备播放 */
            addHandler(vdo, 'canplay', readyPlayLsnr);

            /* 网络错误提示 */
            addHandler(vdo, 'error', function(e) {
                maniInnerText(netwkInfoTxt, 'set', 'disconnect');
            });
            /* 暂停时停止更新进度条，播放时恢复 */
            addHandler(vdo, 'play', function(e) {
                // console.log('video played');
                VideoUtil.playVideo(vdo, playCtrl);
                readyPlayLsnr.check = !0; // 阻止状态信息加载为loading
                maniInnerText(netwkInfoTxt, 'set', 'playing');
                updateStatus.intvlId = setInterval(updateStatus, 500);
            });
            addHandler(vdo, 'pause', function(e) {
                // console.log('video paused');
                clearInterval(updateStatus.intvlId);
                maniInnerText(netwkInfoTxt, 'set', 'paused');
                VideoUtil.playVideo(vdo, playCtrl);
            });
            /* 拖动进度条 */
            addHandler(ctrlBar, 'mousedown', seekProgrsStLsnr);
            addHandler(ctrlBar, 'mouseup', seekProgrsEdLsnr);
            /* 拖动进度控制指示器 */
            addHandler(ctrlPtr, 'mousedown', dragCtrlPtrUp);
            addHandler(ctrlPtr, 'mousemove', dragCtrlPtrMv);
            addHandler(ctrlPtr, 'mouseup', dragCtrlPtrDn);
            addHandler(ctrlPtr, 'mouseleave', dragCtrlPtrMs);
            /* 隐藏/显示控制面板 */
            addHandler(ctrlBar.parentNode, 'mouseleave', panelHid);
            addHandler(ctrlBar.parentNode, 'mouseenter', panelShw);
            /* 拖动音量控制指示器 */
            addHandler(sndPtr, 'mousedown', dragSndPtrUp);
            addHandler(sndPtr, 'mousemove', dragSndPtrMv);
            addHandler(sndPtr, 'mouseup', dragSndPtrDn);
            addHandler(sndPtr, 'mouseleave', dragSndPtrMs);
            /* 点击按钮静音 */
            addHandler(sndVlm, 'click', clkSnd); // *!事件冒泡
            /* 激活/关闭全屏 */
            addHandler(fullWinBtn, 'click', VideoUtil.setFullWin);
            /* 播放/暂停控制按钮 */
            addHandler(playCtrl, 'click', clickPlay); // *!事件冒泡
        }

        /**
         * [readyMetaDataLsnr 初始化视频及控件状态]
         */
        function readyMetaDataLsnr(event) {
            // console.log('ready meta data');
            var crtTime = vdo.currentTime,
                durTime = vdo.duration;
            maniInnerText(durTmTxt, 'set', VideoUtil.formatTime(durTime));
            maniInnerText(crtTmTxt, 'set', VideoUtil.formatTime(crtTime));
            if (vdo.volume > 0) {
                sndIcon.classList.add('vuz-vlm' + (vdo.volume > 0.5 ? 2 : 1)); // volume默认是1
            } else {
                sndIcon.classList.add('vuz-muted');
            }
            vlmBar.style.height = 100 * vdo.volume + '%'; // 初始化音量条
        }

        /**
         * [readyPlayLsnr 部分数据加载完成，可以开始开始播放]
         */
        function readyPlayLsnr(event) {
            var cnt = 0;
            /**
             * [progrsCacheLsnr 更新缓存条]
             */
            function progrsCacheLsnr(event) {
                var totalCache = parseFloat(VideoUtil.getComputedStyle(ctrlBar).width);
                var crtCache = VideoUtil.getCrtCache(vdo);
                var crtStartCache = Math.floor(totalCache * crtCache.start / vdo.duration);
                var crtEndCache = Math.floor(totalCache * crtCache.end / vdo.duration);
                cacheBar.style.left = crtStartCache + 'px';
                cacheBar.style.width = crtEndCache - crtStartCache + 'px';
                if (!arguments.callee.check) { // 
                    if (vdo.networkState === 2) { // 显示加载状态提示
                        cnt++;
                        var dotsNum = cnt % 4,
                            dots = '';
                        for (var i = 0; i < dotsNum; i++) {
                            dots += '.';
                        }
                        maniInnerText(netwkInfoTxt, 'set', 'loading' + dots);
                    } else {
                        maniInnerText(netwkInfoTxt, 'set', 'can play');
                    }
                }
                // console.log(vdo.networkState, vdo.readyState);
            }
            addHandler(vdo, 'progress', progrsCacheLsnr);
            // console.log('canplay');
        }

        /**
         * [updateStatus 更新播放进度条]
         */
        function updateStatus() {
            var totalProgrs = parseFloat(VideoUtil.getComputedStyle(ctrlBar).width); // 只能进行水平进度条的控制，垂直的无效
            var crtProgrs = 0;
            if (arguments.callee.clked) { // 判断是“读取”进度还是“写入”进度
                crtProgrs = parseFloat(VideoUtil.getComputedStyle(progrsBar).width);
                vdo.currentTime = vdo.duration * crtProgrs / totalProgrs;
            } else {
                crtProgrs = Math.floor(totalProgrs * vdo.currentTime / vdo.duration);
                maniInnerText(crtTmTxt, 'set', VideoUtil.formatTime(vdo.currentTime));
                progrsBar.style.width = crtProgrs + 'px';

            }
            arguments.callee.clked = !1;
            // console.log('updated');
        }

        /**
         * [seekProgrsStLsnr 开始拖动进度条]
         */
        function seekProgrsStLsnr(event) {
            updateStatus.clked = !0; // 进度条更新方式为“写入”
            vdo.pause(); // 开始拖动进度条时，停止视频播放
        }

        /**
         * [seekProgrsEdLsnr 结束拖动进度条]
         */
        function seekProgrsEdLsnr(event) {
            event = getEvent(event);
            var crtProgrs = parseFloat(VideoUtil.getComputedStyle(progrsBar).width);
            var maxWidth = parseFloat(VideoUtil.getComputedStyle(ctrlBar).width);
            var tmpWidth = event.clientX - VideoUtil.getElmOffset(progrsBar).x;
            tmpWidth = tmpWidth >= 0 ? tmpWidth : (Math.abs(tmpWidth) + crtProgrs); // 考虑进度条从右向左增长的情况
            if (tmpWidth <= maxWidth) progrsBar.style.width = tmpWidth + 'px';
            vdo.play();
        }

        /**
         * [dragCtrlPtrUp 拽起进度条指示器]
         */
        function dragCtrlPtrUp(event) {
            VideoUtil.movePtrStart(event);
        }

        /**
         * [dragCtrlPtrMv 移动进度条指示器]
         */
        function dragCtrlPtrMv(event) {
            var parent = getTarget(getEvent(event)).parentNode;
            var tmpH = VideoUtil.getComputedStyle(parent).height;
            VideoUtil.movePtrDuring(event, 'fixed'); // 以固定宽度的方式设置进度条
            parent.style.height = tmpH; // 禁止上下移动
        }

        /**
         * [dragCtrlPtrDn 放下进度条指示器]
         */
        function dragCtrlPtrDn(event) {
            var crtTime = 0;
            VideoUtil.movePtrEnd(event);
        }

        /**
         * [dragCtrlPtrMs 丢失进度条指示器]
         */
        function dragCtrlPtrMs(event) {
            VideoUtil.movePtrMiss(event);
        }

        /**
         * [panelHid  隐藏控制条]
         */
        function panelHid(event) {
            VideoUtil.panelHidden(event);
        }

        /**
         * [panelShw  显示控制条]
         */
        function panelShw(event) {
            VideoUtil.panelShow(event);
        }

        /**
         * [dragSndPtrUp 拽起音量控制指示器]
         */
        function dragSndPtrUp(event) {
            VideoUtil.movePtrStart(event);
        }

        /**
         * [dragSndPtrMv 移动音量控制指示器]
         */
        function dragSndPtrMv(event) {
            var parent = getTarget(getEvent(event)).parentNode;
            var tmpW = VideoUtil.getComputedStyle(parent).width;
            var list = sndIcon.classList,
                arr = ['vuz-muted', 'vuz-vlm1', 'vuz-vlm2'],
                idx = 0;
            VideoUtil.movePtrDuring(event, 'dynamic'); // 以动态高度的方式，控制音量指示器移动
            parent.style.width = tmpW; // 禁止左右移动
            if (VideoUtil.mouseMoving) { // 未拖动指示器时，不操作
                vdo.volume = parseFloat(VideoUtil.getComputedStyle(parent).height) / 100;
                if (vdo.volume > 0.5) {
                    idx = 2;
                } else if (vdo.volume > 0) {
                    idx = 1;
                } else {
                    idx = 0;
                }
                for (var i = 0, len = list.length; i < len; i++) {
                    switch (list[i]) { // 移除其他音量图标，并设置当前音量图标，如果已有当前音量图标则不设置
                        case arr[idx]:
                            break;
                        case arr[(idx + 2) % 3]:
                            list.remove(arr[(idx + 2) % 3]);
                        case arr[(idx + 1) % 3]:
                            list.remove(arr[(idx + 1) % 3]);
                        default:
                            list.add(arr[idx]);
                            break;
                    }
                }
                vdo.muted = !idx; // 关闭/开启静音，防止音量条调整了还是静音的情况
            }
            // console.log(parseFloat(VideoUtil.getComputedStyle(parent).height) / 100);
        }

        /**
         * [dragSndPtrDn 放下音量控制指示器]
         */
        function dragSndPtrDn(event) {
            VideoUtil.movePtrEnd(event);
        }

        /**
         * [dragSndPtrMs 丢失音量控制指示器]
         */
        function dragSndPtrMs(event) {
            VideoUtil.movePtrMiss(event);
        }

        /**
         * [clkSnd 静音控制]
         */
        function clkSnd(event) {
            event = getEvent(event);
            var target = getTarget(event),
                clazzNm = target.classList[0]; // *!跟HTML中的class排序有强耦合
            var crtTarget = this;
            switch (clazzNm) {
                case 'vuj-sndbar':
                case 'vuj-volume':
                case 'vuj-ptr':
                    break;
                default:
                    VideoUtil.sndMuted(vdo, crtTarget);
                    break;
            }
        }

        /**
         * [clickPlay 点击播放/暂停按钮]
         */
        function clickPlay(event) {
            var crtTarget = this;
            vdo.paused ? vdo.play() : vdo.pause();
        }
    })(document);
});
