var bnr = document.querySelector('.j-bnr'),
sld = bnr.querySelector('.j-slide');
window.addEventListener('load', function () {
	var bnrIdx = 0;// 当前轮播图位置
	var bnrCache = [];// 缓存轮播图的DOM节点

	/**
	 * [ptrCtrlBnr 滑块指示器控制轮播]
	 * @param  {[DOM node]} elem    [整个轮播图DOM节点]
	 * @param  {[Integer]}  index   [滑块指示器当前位置]
	 * @param  {[Integer]}  reverse [非零整数，正数表示正向控制轮播图，负数表示反向控制轮播图]
	 */
	function ptrCtrlBnr (elem, index, reverse) {
		// console.log('ptrCtrlBnr');
		setOpacity(elem[index], 0);// 先设为全透明图，配合淡入效果
		elem[(index + 2*(reverse > 0 ? 1 : -1) + 3) % 3].style.zIndex = -1;
		elem[(index + 1*(reverse > 0 ? 1 : -1) + 3) % 3].style.zIndex = -2;
		elem[index].style.zIndex = 1;
		fadeIn(elem[index], 500, 10);
	}

	/**
	 * [intvlSwitchBnr 设置轮播图自动间歇切换]
	 */
	function intvlSwitchBnr () {
		sld.parentNode.querySelector('.z-crt').classList.remove('z-crt');
		bnrIdx = (bnrIdx + 1) % 3;// 计算下一个轮播图的位置
		sld.children[bnrIdx].classList.add('z-crt');
		ptrCtrlBnr(bnrCache, bnrIdx, 1);
	}

	/**
	 * @description [事件处理程序集合]
	 */
	// 鼠标移入轮播图时的事件处理程序
	function msEnter (event) {
		// console.log('banner switch paused');
		clearInterval(intervalID);
	}
	// 鼠标移出轮播图时的事件处理程序
	function msLeave (event) {
		// console.log('banner switch running');
		intervalID = setInterval(intvlSwitchBnr, 5000);
	}
	// 鼠标悬停于滑块指示器上时的事件处理程序
	function msOver (event) {
		event = EventUtil.getEvent(event);
		var target = EventUtil.getTarget(event);
		if (target.classList.item(0) === 'sldptr') {// 冒泡事件，只处理滑块的指示器，*!与.sldptr强耦合
			var ptrIdx = target.classList.item(1).slice(3) - 1;// 通过.sld1, .sld2, .sld3获取当前指示器位置，*!强耦合
			// console.log('bnrIdx:'+bnrIdx+', ptrIdx:'+ptrIdx);// 此处bnrIdx为当前未修改的轮播图位置
			if (ptrIdx - bnrIdx) {// 相等时不播放轮播
				ptrCtrlBnr(bnrCache, ptrIdx, ptrIdx - bnrIdx);
			}
			bnrIdx = ptrIdx;// 同步当前轮播图位置为当前滑块指示器位置
			target.parentNode.querySelector('.z-crt').classList.remove('z-crt');
			target.classList.add('z-crt');
		}
	}

	for (var i = 0; i < 3; i++) {
		bnrCache.push(bnr.children[i]);// *!与HTML页面中轮播图DOM节点结构有强耦合
		// console.log('bnr'+i+':'+bnrCache[i]);
	}

	var intervalID = setInterval(intvlSwitchBnr, 5000);// 设置初始自动轮播
	bnr.addEventListener('mouseenter', msEnter);
	bnr.addEventListener('mouseleave', msLeave);
	sld.addEventListener('mouseover', msOver);// 利用事件冒泡，控制滑块指示器悬停时间
});

/**
 * [setOpacity 设置DOM节点的透明度]
 * @param {[DOM node]} elem  [需要设置透明度的DOM节点]
 * @param {[Integer]}  value [透明度，以0~10表示]
 */
function setOpacity (elem, value) {
	(typeof elem.style.opacity === 'string') ? (elem.style.opacity = value/10.0 + '') : (elem.style.filter = 'alpha(opacity=' + (value*10) + ')');
}

/**
 * [fadeIn 图片淡入]
 * @param  {[DOM node]} elem        [准备淡入的DOM节点]
 * @param  {[Integer]}  maxFadeTime [最大淡入时间]
 * @param  {[Integer]}  steps       [淡入的渐进幅度]
 */
function fadeIn (elem, maxFadeTime, steps) {
	var aTime = maxFadeTime/steps,
	value = 0;
	function timoutFunc () {
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
function switchBnr (bnrElem, sldElem, intvlTime, maxFadeTime, steps) {
	var index = 0;
	var maxTimes = 5;
	function timeoutFunc () {
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

// switchBnr (bnr, sld, 5000, 500, 10);
// console.log(sld.children[0].classList.item(0), sld.children[0].classList.item(1), sld.children[0].classList.item(2));
// console.log(sld.children[1].classList.item(0), sld.children[1].classList.item(1), sld.children[1].classList.item(2));
// console.log(sld.children[2].classList.item(0), sld.children[2].classList.item(1), sld.children[2].classList.item(2));

// var test = document.querySelector('.j-test');
// console.log(test);
// test.style.filter = "alpha(opacity=10)";
// fadeIn(test, 5000, 10);

