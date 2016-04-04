addHandler(window, 'load', function() {
    (function(doc) {
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
         * @param  {[Integer]}  steps       [淡入的渐进步数]
         */
        function fadeIn(elem, maxFadeTime, steps) {
            var _aTime = maxFadeTime / steps,
                _value = 0; // 计算渐进次数

            function timoutFunc() {
                _value++;
                setOpacity(elem, _value);
                if (steps > _value) {
                    setTimeout(arguments.callee, _aTime);
                } else {
                    // console.log('fade done');
                }
            }
            setTimeout(timoutFunc, _aTime);
        }

        /**
         * [ptrCtrlBnr 滑块指示器控制轮播]
         * @param  {[DOM node]} elem    [整个轮播图DOM节点]
         * @param  {[Integer]}  index   [滑块指示器当前位置]
         * @param  {[Integer]}  reverse [非零整数，正数表示正向控制轮播图，负数表示反向控制轮播图]
         */
        function ptrCtrlBnr(elem, index, reverse) {
            setOpacity(elem[index], 0); // 先设为全透明图，配合淡入效果
            elem[(index + 2 * (reverse > 0 ? 1 : -1) + 3) % 3].style.zIndex = -1;
            elem[(index + 1 * (reverse > 0 ? 1 : -1) + 3) % 3].style.zIndex = -2;
            elem[index].style.zIndex = 1;
            fadeIn(elem[index], 500, 10);
        }

        /* 轮播间歇调用处理函数 */
        function intvlSwitchBnr() {
            sld.parentNode.querySelector('.suz-crt').classList.remove('suz-crt');
            bnrIdx = (bnrIdx + 1) % 3; // 计算下一个轮播图的位置
            sld.children[bnrIdx].classList.add('suz-crt');
            ptrCtrlBnr(bnrCache, bnrIdx, 1); // 指示器控制轮播
        }
        /* 鼠标移入停止循环播放轮播 */
        function msEnterLsnr(event) {
            clearInterval(intvlSwitchBnr.intervalID);
        }
        /* 鼠标移出轮播图时的开始轮播*/
        function msLeaveLsnr(event) {
            intvlSwitchBnr.intervalID = setInterval(intvlSwitchBnr, 5000);
        }
        /* 鼠标悬停于滑块指示器上时控制轮播 */
        function msOverLsnr(event) {
            var _target = getTarget(getEvent(event));
            clearInterval(intvlSwitchBnr.intervalID);
            if (_target.classList.item(0) === 'sldptr') { // 冒泡事件，只处理滑块的指示器，*!与class名顺序强耦合
                var _ptrIdx = _target.classList.item(1).slice(3) - 1; // 通过.sld1, .sld2, .sld3获取当前指示器位置，*!强耦合
                if (_ptrIdx - bnrIdx) { // 相等时不播放轮播
                    ptrCtrlBnr(bnrCache, _ptrIdx, _ptrIdx - bnrIdx);
                }
                bnrIdx = _ptrIdx; // 同步当前轮播图位置为当前滑块指示器位置
                _target.parentNode.querySelector('.suz-crt').classList.remove('suz-crt');
                _target.classList.add('suz-crt');
            }
        }

        var bnr = doc.querySelector('.suj-slide'),
            sld = bnr.querySelector('.suj-sldptrs');
        var bnrIdx = 0; // 当前轮播图位置
        var bnrCache = []; // 缓存轮播图的DOM节点
        for (var i = 0; i < 3; i++) {
            bnrCache.push(bnr.children[i]); // *!与HTML页面中轮播图DOM节点结构有强耦合
        }

        intvlSwitchBnr.intervalID = setInterval(intvlSwitchBnr, 5000); // 设置初始自动轮播
        addHandler(bnr, 'mouseenter', msEnterLsnr);
        addHandler(bnr, 'mouseleave', msLeaveLsnr);
        addHandler(sld, 'mouseover', msOverLsnr); // 利用事件冒泡，控制滑块指示器悬停时间

        /**
         * [switchBnr 自动轮播，无事件控制，测试用]
         * @param  {[DOM node]} bnrElem     [整个轮播图的DOM节点]
         * @param  {[DOM node]} sldElem     [整个滑块指示器的DOM节点]
         * @param  {[Integer]}  intvlTime   [轮播间歇时间]
         * @param  {[Integer]}  maxFadeTime [最大淡入时间]
         * @param  {[Integer]}  steps       [淡入的渐进幅度]
         */
        // function switchBnr(bnrElem, sldElem, intvlTime, maxFadeTime, steps) {
        //     var index = 0;
        //     var maxTimes = 5;

        //     function timeoutFunc() {
        //         sldElem.children[index].classList.remove('suz-crt');
        //         index = (index + 1) % 3;
        //         sldElem.children[index].classList.add('suz-crt');
        //         setOpacity(bnrElem.children[index], 0);
        //         bnrElem.children[(index + 2) % 3].style.zIndex = -1;
        //         bnrElem.children[(index + 1) % 3].style.zIndex = -2;
        //         bnrElem.children[index].style.zIndex = 1;
        //         fadeIn(bnrElem.children[index], maxFadeTime, steps);
        //         maxTimes--;
        //         if (maxTimes) {
        //             setTimeout(timeoutFunc, intvlTime);
        //         }
        //     }
        //     setTimeout(timeoutFunc, intvlTime);
        // }
    })(document);
});
