addHandler(window, 'load', function() {
    (function(doc) {
        var sheets = doc.styleSheets;
        var len = sheets.length;
        var inSheets = null;
        for (var i = len - 1; i >= 0; i--) {
            if ((sheets[i].title = 'IEresponsive')) {
                inSheets = sheets[i];
                break;
            }
        }

        /* 用于修改IE下的布局样式 */
        function winResized() {
            var _rules = getRules(inSheets), // #!与空的内部样式表有强耦合
                _width = getWinWidth(),
                _style = null;
            for (var i = 0, len = _rules.length; i < len; i++) {
                if (_rules[i].selectorText === '.f-center') {
                    _style = _rules[i].style;
                    if (_width >= 1612) {
                        _style.display = 'table';
                        _style.minWidth = '';
                        _style.width = '1205px';
                        _style.marginRight = 'auto';
                        _style.marginLeft = 'auto';
                    } else if (_width >= 1383) {
                        _style.display = '';
                        _style.minWidth = '960px';
                        _style.width = '';
                        _style.marginRight = '203px';
                        _style.marginLeft = '203px';
                    } else {
                        _style.display = 'table';
                        _style.minWidth = '';
                        _style.width = '960px';
                        _style.marginRight = 'auto';
                        _style.marginLeft = 'auto';
                    }
                } else if (_rules[i].selectorText === '.g-main') {
                    _style = _rules[i].style;
                    if (_width >= 1612) {
                        _style.width = '980px';
                    } else {
                        _style.width = '735px';
                    }
                } else {
                    console.log('Error: wrong StyleSheets');
                }
            }
        }
        winResized(); // 页面加载完毕修改一次CSS样式表的规则
        addHandler(window, 'resize', winResized); // 每当浏览器窗口调整，修改CSS样式表的规则
    })(document);
});
