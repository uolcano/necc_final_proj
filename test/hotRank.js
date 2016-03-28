function shiftHotRank(htRkElm) {
	var getStyle = VideoUtil.getComputedStyle;
    var itmStyle = getStyle(htRkElm.children[0]);
    var itmH = parseFloat(itmStyle.height) + parseFloat(itmStyle.marginTop) + parseFloat(itmStyle.marginBottom) + parseFloat(itmStyle.paddingTop) + parseFloat(itmStyle.paddingBottom);
    // console.log(itmH);
    var maxTime = 1000,
        steps = 10,
        tmIntvl = maxTime / steps,
        shiftMv = itmH / steps;
    var cnt = 0;
    htRkElm.style.position = 'relative';

    function shiftAnima() {
        var pos = parseFloat(getStyle(htRkElm).bottom) || 0;
        htRkElm.style.bottom = pos + shiftMv + 'px';
        // console.log(pos);
        cnt--;
        if (cnt > 0) {
            setTimeout(arguments.callee, tmIntvl);
        } else {
	        htRkElm.appendChild(htRkElm.children[0]);
	        pos = parseFloat(getStyle(htRkElm).bottom) || 0;
	        htRkElm.style.bottom = pos - itmH + 'px';
        }
    }

    function shiftRank() {
        cnt = steps;
        console.log('shift rank');
        shiftAnima();
    }
    setInterval(shiftRank, 5000);
}
shiftHotRank(hotRank);
