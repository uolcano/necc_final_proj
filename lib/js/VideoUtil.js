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
            var parent = this.mvTgtParent,
                style = parent.style;
            var grandpa = parent.parentNode,
                grpStyle = this.getComputedStyle(grandpa);

            evObj = this.getEvent(evObj);

            var width = parseFloat(style.width || 0), // 控制指示器父容器的宽度
                height = parseFloat(style.height || 0),
                grpWidth = parseFloat(grpStyle.width), // 不能超出父容器的父容器的宽度
                grpHeight = parseFloat(grpStyle.height),
                moveToX = evObj.clientX, // 获取当前鼠标位置
                moveToY = evObj.clientY;
            switch (flag) {
                case 'fixed':
                    var tmpWidth = moveToX - this.ptrPosX + width; // 获取计算后的指示器父容器宽度，并限制在容器的父容器内
                    var tmpHeight = this.ptrPosY - moveToY + height;
                    if (tmpWidth >= 0 && tmpWidth <= grpWidth) style.width = tmpWidth + 'px';
                    if (tmpHeight >= 0 && tmpHeight <= grpHeight) style.height = tmpHeight + 'px';
                    break;
                case 'dynamic': // 用于指示器的容器槽有增长动画的情况，必须使用百分比
                    tmpWidth = (this.ptrPosX - moveToX + width) / grpWidth;
                    tmpHeight = (this.ptrPosY - moveToY + height) / grpHeight;
                    if (tmpWidth >= 0 && tmpWidth <= 1) style.width = tmpWidth * 100 + '%';
                    if (tmpHeight >= 0 && tmpHeight <= 1) style.height = tmpHeight * 100 + '%';
                    break;
                default:
                    console.log('Error: need for the flag of "fixed" or "dynamic".');
                    break;
            }
            // 记录当前鼠标位置，以备下次事件触发时使用
            this.ptrPosX = moveToX;
            this.ptrPosY = moveToY;
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
    getComputedStyle: function(elm) {
        return elm.currentStyle ? elm.currentStyle : document.defaultView.getComputedStyle(elm);
    },
    getEvent: function(event) {
        return event || window.event;
    },
    getTarget: function(event) {
        return event.target || event.srcElements;
    },
    panelHidden: function(evObj) {
        var target = this.getTarget(this.getEvent(evObj));
        try {
            target.classList.add('vuz-hidden');
        } catch (e) {
            console.log('Error: need for the className of "vuz-hidden"');
        }

        function fadeFunc() {
            target.style.opacity = '0';
        }
        setTimeout(fadeFunc, 8000); // 跟CSS的kf-showpanel的动画时间有强耦合
    },
    panelShow: function(evObj) {
        var target = this.getTarget(this.getEvent(evObj));
        try {
            target.classList.remove('vuz-hidden');
        } catch (e) {
            console.log('message: not yet add the className of "vuz-hidden"');
        }
        target.style = '';
    },
    getElmOffset: function(elm) {
        var offset = { x: 0, y: 0 },
            parent = elm.offsetParent;
        offset.x += elm.offsetLeft;
        offset.y += elm.offsetTop;
        while (parent) {
            offset.x += parent.offsetLeft + parseFloat(this.getComputedStyle(parent).borderLeftWidth); // 算上参考容器的边框宽
            offset.y += parent.offsetTop + parseFloat(this.getComputedStyle(parent).borderTopWidth);
            parent = parent.offsetParent;
            // console.log(offset);
        }
        return offset;
    },
    getCrtCache: function(vdoElm) {
        var crtTime = vdoElm.currentTime,
            cacheArr = vdoElm.buffered;
        var crtCache = { start: 0, end: 0 },
            crtCacheIdx = 0;
        for (var i = 0, len = cacheArr.length; i < len; i++) {
            if (cacheArr.start(i) <= crtTime && cacheArr.end(i) >= crtTime) {
                crtCacheIdx = i;
                break;
            }
        }
        crtCache.start = cacheArr.start(crtCacheIdx);
        crtCache.end = cacheArr.end(crtCacheIdx);
        // console.log('bufferNo:', crtCacheIdx, 'cacheStart:', crtCache.start, ', cacheEnd:', crtCache.end, 'crtTime:', crtTime);
        return crtCache;
    },
    loadStart: function(vdoElm) {
        var reloadCnt = 0;

        function reloadVideo() {
            reloadCnt++;
            if (vdoElm.networkState > 0 || reloadCnt > 50) {
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
    setFullWin: function() {
        var vdoWin = null;
        try {
            vdoWin = document.querySelector('.vuj-vdowin.vuz-fulled');
            vdoWin.classList.remove('vuz-fulled');
            // console.log('zoom in');
        } catch (e) {
            vdoWin = document.querySelector('.vuj-vdowin');
            vdoWin.classList.add('vuz-fulled');
            // console.log('zoom out');
        }
    },
    formatTime: function(second) {
        var sec = Math.floor(second);
        var hour = Math.floor((sec / 3600));
        var min = Math.floor((sec %= 3600) / 60);
        sec %= 60;
        return (hour ? hour + ':' : '') + (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
    },
    playVideo: function(vdoElm, playElm) {
        var playIcon = playElm.children[0];
        // console.log(playElm, playIcon);
        if (!vdoElm.paused) {
            try {
                playIcon.classList.remove('vuz-paused');
                playIcon.classList.add('vuz-running');
            } catch (e) {
                console.log(e);
            }
        } else {
            try {
                playIcon.classList.remove('vuz-running');
                playIcon.classList.add('vuz-paused');
            } catch (e) {
                console.log(e);
            }
        }
    },
    sndMuted: function(vdoElm, sndElm) {
        var vlm = vdoElm.volume;
        if (vlm > 0) {
            var sndIcon = sndElm.querySelector('.vuj-sndicon');
            var classNm = 'vuz-vlm' + (vlm > 0.5 ? 2 : 1);
            // console.log(vlm, vdoElm.muted,'to muted:', vdoElm, sndIcon);
            if (vdoElm.muted) {
                try {
                    sndIcon.classList.remove('vuz-muted');
                    sndIcon.classList.add(classNm);
                    vdoElm.muted = false;
                } catch (e) {
                    console.log(e);
                }
            } else {
                try {
                    sndIcon.classList.remove(classNm);
                    sndIcon.classList.add('vuz-muted');
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
        // try {
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

        var vdo = vdoWin.querySelector('.vuj-vdosrc');
        // } catch(e) {
        // console.log(e);
        // }
        vdo.src = 'http://mov.bn.netease.com/open-movie/nos/mp4/2014/12/30/SADQ86F5S_shd.mp4';
        VideoUtil.loadStart(vdo);

        // 初始化视频及控件状态
        function readyMetaData(event) {
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
        try {
            addHandler(vdo, 'loadedmetadata', readyMetaData);
        } catch (e) {
            // statements
            console.log('HTMLStructureError: video miss');
        }

        // 部分数据加载完成，可以开始开始播放
        function readyPlay(event) {
            var cnt = 0;
            // 更新缓存条
            function progrsCache(event) {
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
            addHandler(vdo, 'progress', progrsCache);
            // console.log('canplay');
        }
        addHandler(vdo, 'canplay', readyPlay);

        // 网络错误提示
        addHandler(vdo, 'error', function(e) {
            maniInnerText(netwkInfoTxt, 'set', 'disconnect');
        });

        // 更新播放进度条
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

        try {
            // 暂停时停止更新进度条
            addHandler(vdo, 'play', function(e) {
                // console.log('video played');
                VideoUtil.playVideo(vdo, playCtrl);
                readyPlay.check = !0; // 阻止状态信息加载为loading
                maniInnerText(netwkInfoTxt, 'set', 'playing');
                updateStatus.intvlId = setInterval(updateStatus, 500);
            });
            addHandler(vdo, 'pause', function(e) {
                // console.log('video paused');
                clearInterval(updateStatus.intvlId);
                maniInnerText(netwkInfoTxt, 'set', 'paused');
                VideoUtil.playVideo(vdo, playCtrl);
            });
        } catch (e) {
            console.log('HTMLStructureError: video or play button miss');
        }

        // 拖动进度条
        function seekProgrsEd(event) {
            updateStatus.clked = !0; // 进度条更新方式为“写入”
            vdo.pause(); // 开始拖动进度条时，停止视频播放
        }

        function seekProgrsSt(event) {
            event = getEvent(event);
            var crtProgrs = parseFloat(VideoUtil.getComputedStyle(progrsBar).width);
            var maxWidth = parseFloat(VideoUtil.getComputedStyle(ctrlBar).width);
            var tmpWidth = event.clientX - VideoUtil.getElmOffset(progrsBar).x;
            tmpWidth = tmpWidth >= 0 ? tmpWidth : (Math.abs(tmpWidth) + crtProgrs); // 考虑进度条从右向左增长的情况
            if (tmpWidth <= maxWidth) progrsBar.style.width = tmpWidth + 'px';
            vdo.play();
        }
        try {
            addHandler(ctrlBar, 'mousedown', seekProgrsEd);
            addHandler(ctrlBar, 'mouseup', seekProgrsSt);
        } catch (e) {
            console.log('HTMLStructureError: control bar or progress bar miss');
        }

        // 拖动进度条指示器
        function dragCtrlPtrUp(event) {
            VideoUtil.movePtrStart(event);
        }

        function dragCtrlPtrMv(event) {
            var parent = getTarget(getEvent(event)).parentNode;
            var tmpH = VideoUtil.getComputedStyle(parent).height;
            VideoUtil.movePtrDuring(event, 'fixed'); // 以固定宽度的方式设置进度条
            parent.style.height = tmpH; // 禁止上下移动
        }

        function dragCtrlPtrDn(event) {
            var crtTime = 0;
            VideoUtil.movePtrEnd(event);
        }

        function dragCtrlPtrMs(event) {
            VideoUtil.movePtrMiss(event);
        }
        try {
            addHandler(ctrlPtr, 'mousedown', dragCtrlPtrUp);
            addHandler(ctrlPtr, 'mousemove', dragCtrlPtrMv);
            addHandler(ctrlPtr, 'mouseup', dragCtrlPtrDn);
            addHandler(ctrlPtr, 'mouseleave', dragCtrlPtrMs);
        } catch (e) {
            console.log('HTMLStructureError: progress control pointer miss');
        }

        // 隐藏和显示控制条
        function panelHid(event) {
            VideoUtil.panelHidden(event);
        }

        function panelShw(event) {
            VideoUtil.panelShow(event);
        }
        try {
            addHandler(ctrlBar.parentNode, 'mouseleave', panelHid);
            addHandler(ctrlBar.parentNode, 'mouseenter', panelShw);
        } catch (e) {
            cconsole.log('HTMLStructureError: control bar miss');
        }

        // 音量指示器控制
        function dragSndPtrUp(event) {
            VideoUtil.movePtrStart(event);
        }

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

        function dragSndPtrDn(event) {
            VideoUtil.movePtrEnd(event);
        }

        function dragSndPtrMs(event) {
            VideoUtil.movePtrMiss(event);
        }
        try {
            addHandler(sndPtr, 'mousedown', dragSndPtrUp);
            addHandler(sndPtr, 'mousemove', dragSndPtrMv);
            addHandler(sndPtr, 'mouseup', dragSndPtrDn);
            addHandler(sndPtr, 'mouseleave', dragSndPtrMs);
        } catch (e) {
            console.log('HTMLStructureError: sound pointer miss');
        }

        // 静音控制
        function clkSnd(event) {
            event = getEvent(event);
            var target = getTarget(event),
                clazzNm = target.classList[0];
            var crtTarget = this; // this替代event.currentTarget，兼容IE
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
        try {
            addHandler(sndVlm, 'click', clkSnd); // *!利用事件冒泡，处理静音点击事件
        } catch (e) {
            console.log('HTMLStructureError: sound button miss');
        }

        try {
            // 激活全屏
            addHandler(fullWinBtn, 'click', VideoUtil.setFullWin);
        } catch (e) {
            console.log('HTMLStructureError: fullwindow button miss');
        }

        // 播放按钮
        function clickPlay(event) {
            var crtTarget = this;
            vdo.paused ? vdo.play() : vdo.pause();
        }
        try {
            addHandler(playCtrl, 'click', clickPlay); // *!事件冒泡
        } catch (e) {
            console.log('HTMLStructureError: play button miss');
        }
    })(document);
});
