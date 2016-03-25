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
                case 'dynamic':
                    tmpWidth = (this.ptrPosX - moveToX + width) / grpWidth;
                    tmpHeight = (this.ptrPosY - moveToY + height) / grpHeight;
                    if (tmpWidth >= 0 && tmpWidth <= 1) style.width = tmpWidth * 100 + '%';
                    if (tmpHeight >= 0 && tmpHeight <= 1) style.height = tmpHeight * 100 + '%';
                    break;
                default:
                    console.log('Error: need for the flag of "w" or "h".');
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
    ctrlBarHidden: function(evObj) {
        var target = this.getTarget(this.getEvent(evObj));
        try {
            target.classList.remove('vuz-hidden');
        } catch (e) {
            console.log('message: not yet add the className of "vuz-hidden"');
        }
    },
    ctrlBarShow: function(evObj) {
        var target = this.getTarget(this.getEvent(evObj));
        try {
            target.classList.add('vuz-hidden');
        } catch (e) {
            console.log('Error: need for the className of "vuz-hidden"');
        }
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
        } catch(e) {
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
