addHandler(window, 'load', function() {
    (function(doc) {
        /**
         * [createDomStruct 完成容器节点下的DOM节点构建，并返回作为DOM节点映射的“模板节点”对象]
         * @param  {[DOM node]} [tmpltElm] [包含模板的DOM节点]
         * @param  {[DOM node]} [baseNode] [接收节点插入的容器节点]
         * @param  {[integer]}  [childNum] [插入节点的数目]
         * @return {[object]}   [nodes]    [映射到待插入的单个DOM节点的节点模板对象]
         *          并且，HTML结构中的自闭合标签必须以“/>”结尾，否则会出错。
         * @dataStructure {[object]} tmpNode [txt是一个完整DOM节点的字符串形式，subTree是每个模板节点的子模板节点列表，模板节点只是对应DOM的一种映射关系]
         * --- {
         * ------ txt: '',
         * ------ subTree: [
         * --------- 0:{
         * ------------ txt: '',
         * ------------ subTree: [0:{txt: '', subTree: [...]}]
         * --------- },
         * --------- 1:{
         * ------------ txt: '',
         * ------------ subTree: [0:{txt: '', subTree: [...]), 1:{txt: '', subTree: [...]}]
         * --------- }
         * ------ ]
         * --- }
         * *! 注意：要求模板字符串中的${track.propName)中的propName与ajax响应数据项中的属性名相同，
         */
        function createDomStruct(tmpltElm, baseNode, childNum) {
            /**
             * [getTmpltTree 遍历模板字符串，转换成对应DOM节点层次的“模板节点”对象，作为以后创建出来的DOM节点的映射，方便插入ajax数据]
             * @param  {[string]}  [tmpltStr] [模板字符串]
             * @param  {[boolean]} [isOp]     [用于判断是否处理的是“模板节点”的根节点]
             * @return {[object]}             [“模板节点”对象]
             */
            function getTmpltTree(tmpltNode, isOp) {
                var _ptnOp = /^<[a-zA-Z0-9]+?.*?[^\/]>/, // 用于识别开标前
                    _ptnEd = /^<\/[a-zA-Z0-9]+?>/, // 用于识别闭标签
                    _ptnOpEd = /^<.+?\/>/, // 用于识别自闭合标签
                    _ptnTxt = /^[^>].+?(?=<)/; // 用于识别文本节点
                var _matches = null,
                    _flag = !0, // 模板结构错误时，不再继续遍历
                    _cnt = 100, // 防止意外的无限循环
                    _sub = null, // 对应DOM子节点的“模板子节点”对象
                    _self = arguments.callee; // 用于函数自调用
                while (_self.tmpltStr.length && _flag && _cnt) {
                    _self.tmpltStr = _self.tmpltStr.trim(); // 去掉前后的空白符
                    if ((_matches = _ptnEd.exec(_self.tmpltStr))) { // 匹配闭标签，并结束遍历
                        _self.tmpltStr = RegExp.rightContext;
                        tmpltNode.txt += _matches[0];
                        break;
                    } else if ((_matches = _ptnOp.exec(_self.tmpltStr))) { // 匹配开标签，深度匹配子节点
                        _self.tmpltStr = RegExp.rightContext;
                        if (isOp) { // 处理根“模板节点”
                            isOp = !1;
                            tmpltNode.txt = _matches[0];
                            _self(tmpltNode, isOp); // 递归遍历子节点
                        } else { // 设置“模板子节点”
                            _sub = {
                                txt: _matches[0],
                                subTree: []
                            };
                            tmpltNode.subTree.push(_sub); // 递归遍历子节点
                            _self(_sub, isOp);
                            _sub = null;
                        }
                    } else if ((_matches = _ptnOpEd.exec(_self.tmpltStr))) { // 匹配自闭合标签
                        _self.tmpltStr = RegExp.rightContext;
                        tmpltNode.subTree.push({ txt: _matches[0], subTree: [] });
                    } else if ((_matches = _ptnTxt.exec(_self.tmpltStr))) { // 匹配文本节点
                        _self.tmpltStr = RegExp.rightContext;
                        tmpltNode.txt += _matches[0];
                    } else { // 模板结构错误
                        _flag = !1;
                        console.log('Error: Invalid template structure!');
                    }
                    _cnt--;
                }
            }

            /**
             * [getNodeAttr 获取“初加工”的“模板子节点”的特性节点信息和标签名信息]
             * @param  {[object]} [tmpNode] [待处理的“模板子节点”对象]
             */
            function getNodeAttr(tmpltNode) {
                var _ptnTag = /^<([a-zA-Z0-9]+)(?=\s*)/, // 匹配并捕获标签名
                    _ptnAttr = /^([a-zA-Z\-]+)\s*=\s*[\'\"]\s*(.+?)\s*[\'\"]/, // 匹配HTML特性，并捕获特性键值对
                    _ptnData = /\$\{track\..+?\}/; // 匹配待接收ajax数据的特性
                var _txt = tmpltNode.txt,
                    _matches = null,
                    _kv = null; // 临时存储特性键值对
                tmpltNode.attrs = []; // 在“模板子节点”中存储对应的特性节点信息于attrs数组中
                while (_txt.length) { // 遍历“模板子节点”的整条
                    _txt = _txt.trim();
                    if ((_matches = _ptnTag.exec(_txt))) { // 匹配标签名
                        _txt = RegExp.rightContext;
                        tmpltNode.tagName = _matches[1];
                    } else if ((_matches = _ptnAttr.exec(_txt))) { // 匹配特性键值对
                        _txt = RegExp.rightContext;
                        _kv = {
                            name: _matches[1],
                            value: _matches[2]
                        };
                        if (_kv.name === 'class') {
                            _kv.name = 'className';
                        }
                        if (_ptnData.exec(_kv.value)) { // 不将需要填入ajax数据的特性值写入“模板子节点”的attrs属性中
                            _kv.value = '';
                        }
                        tmpltNode.attrs.push(_kv);
                        _kv = null;
                    } else {
                        break;
                    }
                }
            }
            /**
             * [deepProgNode 提取一个“模板节点”的所有“子节点”的特性节点和标签名信息]
             * @param  {[object]}  [tmpltNode] [待“深度加工”的“模板节点”对象]
             * @param  {Boolean}   [isOp]      [用于判断是否处理的是“模板节点”的根节点]
             */
            function deepProgNode(tmpltNode, isOp) {
                if (isOp) { // 处理根“模板节点”
                    isOp = !1;
                    getNodeAttr(tmpltNode);
                }
                for (var i = 0, len = tmpltNode.subTree.length; i < len; i++) { // 处理“模板子节点”
                    getNodeAttr(tmpltNode.subTree[i]);
                    arguments.callee(tmpltNode.subTree[i], isOp);
                }
            }

            var _htmlStr = tmpltElm.innerHTML; // 解析待转换的模板字符串
            var _nodes = { // 基础“模板节点”对象
                txt: '', // 存储当前“模板节点”对应DOM节点的完整字符串形式
                subTree: [] // 存储当前“模板节点”的子节点
            };
            getTmpltTree.tmpltStr = _htmlStr;
            getTmpltTree(_nodes, !0); // 将模板字符串转换为“模板节点”对象
            deepProgNode(_nodes, !0);
            var _inHtml = ''; // 写入容器节点innerHTML属性的字符串，减少innerHTML的调用
            for (var i = 0; i < childNum; i++) { // 生成childNum个数的DOM节点的字符串形式
                _inHtml += _htmlStr.replace(/\$\{track\..+?\}/g, '');
            }
            baseNode.innerHTML = _inHtml; // 写入容器节点
            return _nodes; // 返回“模板节点”对象
        }

        /**
         * [wtNodeAttr 参考“模板节点”对象，向对应的DOM节点的特性写入数据]
         * @param  {[type]} [tmpltNode] [“模板子节点”对象]
         * @param  {[type]} [domNode]   [对应的DOM节点]
         * @param  {[type]} [item]      [某个ajax数据项]
         * @param  {[type]} [mKv]       [在matchData函数中匹配到的键值对和待插入ajax数据项的属性名]
         */
        function wtNodeAttr(tmpltNode, domNode, item, mKv) {
            var _m = /^data-(.+)/.exec(mKv[0]), // dataset特性的匹配结果
                _tmp = '';
            if (_m) { // 处理dataset特性的信息
                mKv[0] = _m[1].replace(/-([a-zA-Z0-9])/g, function(m, p) {
                    return p.toUpperCase();
                });
                domNode.dataset[mKv[0]] = mKv[1].replace(/\$\{track\..+?\}/, item[mKv[2]]);
            } else {
                _tmp = mKv[1].replace(/\$\{track\..+?\}/, item[mKv[2]]);
                if (mKv[0] === 'style') {
                    while ((_m = /(.*?):(.*?);/.exec(_tmp))) {
                        domNode.style[_m[1]] = _m[2];
                        _tmp = RegExp.rightContext;
                    }
                } else {
                    domNode[mKv[0]] = _tmp;
                }
            }
        }

        /**
         * [matchData 用某个ajax数据项与“模板子节点”的字符串形式匹配，然后填入对应的DOM节点]
         * @param  {[type]} [tmpltNode] [“模板子节点”对象]
         * @param  {[type]} [domNode]   [对应的DOM节点]
         * @param  {[type]} [item]      [某个ajax数据项]
         */
        function matchData(tmpltNode, domNode, item) {
            var _ptnTxt = />\s*\$\{track\.(.+?)\}\s*</, // 匹配文本节点
                _ptnKv = /[a-zA-Z\-]+\s*=\s*[\'\"]\s*.*\$\{track\..+?\}.*\s*[\'\"]/,
                _ptnAttr = /([a-zA-Z\-]+)\s*=\s*[\'\"]\s*(.+?)\s*[\'\"]/,
                _ptnData = /\$\{track\.(.+?)\}/;
            var _matches = null,
                _mKv = new Array(3), // 存储匹配到的键值对和
                _inTxt = '', // 根据ajax数据项，待写入DOM节点的文本内容
                _txt = tmpltNode.txt;
            /* 向DOM节点下的文本节点插入ajax数据 */
            if ((_matches = _ptnTxt.exec(_txt))) {
                _inTxt = item[_matches[1]];
                if (!item[_matches[1]]) { // 如果ajax返回数据为空值
                    switch (_matches[1]) {
                        case 'name':
                        case 'categoryName':
                        case 'provider':
                        case 'description':
                            _inTxt = '暂无';
                            break;
                        case 'learnerCount':
                        case 'price':
                            _inTxt = '0';
                            break;
                        default:
                            _inTxt = 'undefined';
                            break;
                    }
                }
                // console.log(_inTxt);
                maniInnerText(domNode, 'set', _inTxt); // 将ajax数据项写入对应文本节点
            }
            /* 向DOM节点的特性插入ajax数据 */
            if (_ptnKv.exec(_txt)) { // 确定有需要插入ajax数据的特性键值对
                _matches = null;
                while ((_matches = _ptnAttr.exec(_txt))) {
                    _txt = RegExp.rightContext;
                    _mKv[0] = _matches[1];
                    _mKv[1] = _matches[2];
                    if ((_matches = _ptnData.exec(_matches[2]))) {
                        _mKv[2] = _matches[1];
                        wtNodeAttr(tmpltNode, domNode, item, _mKv);
                    }
                }
            }
        }
        /**
         * [dbNodeTravl 模板映射节点对象和DOM节点同步迭代，以ajax返回数据更新DOM节点的数据]
         * @param  {[type]} [tmpltNode] [“模板子节点”对象]
         * @param  {[type]} [domNode]   [对应的DOM节点]
         * @param  {[type]} [item]      [某个ajax数据项]
         */
        function dbNodeTravl(tmpltNode, domNode, item, isOp) {
            if (isOp) {
                isOp = !1;
                matchData(tmpltNode, domNode, item);
            }
            for (var i = 0, len = tmpltNode.subTree.length; i < len; i++) {
                matchData(tmpltNode.subTree[i], domNode.children[i], item);
                arguments.callee(tmpltNode.subTree[i], domNode.children[i], item);
            }
        }
        /**
         * [loadData 于基节点中插入多个以“模板节点”为原型的DOM节点]
         * @param  {[type]} [tmpltNode] [“模板节点”对象]
         * @param  {[type]} [baseNode]  [接收节点插入的容器节点]
         * @param  {[type]} [list]      [ajax数据列表]
         */
        function loadData(tmpltNode, baseNode, list) {
            for (var i = 0, len = list.length; i < len; i++) {
                dbNodeTravl(tmpltNode, baseNode.children[i], list[i], !0);
            }
        }

        /**
         * [ajaxErr 通用ajax错误提示]
         */
        function ajaxErr() {
            console.log('AjaxError: not yet get response.');
        }

        /**
         * [loadPgSelr 加载选页器]
         * @param  {[type]} [pgSelrElm] [选页器对应的DOM节点]
         * @param  {[type]} [response]  [ajax数据]
         */
        function loadPgSelr(pgSelrElm, response) {
            var _pages = pgSelrElm.children,
                _pageLen = _pages.length - 2,
                _pageIdx = response.pagination.DEFAULT_PAGE_INDEX,
                _totalPg = response.totalPage;
            for (var i = 1; i <= _pageLen; i++) {
                try {
                    _pages[i].classList.remove('tuz-crt');
                } catch (e) {
                    console.log(e);
                }
                if (i > _totalPg) {
                    _pages[i].style.display = 'none';
                } else {
                    _pages[i].dataset.pageNo = i;
                    maniInnerText(_pages[i], 'set', i);
                    if (i === _pageIdx) {
                        _pages[i].classList.add('tuz-crt');
                    }
                }
            }
        }
        /**
         * [loadCrs 加载课程介绍数据]
         * @param  {[object]}   [tmpltNode] [“模板节点”对象]
         * @param  {[DOM node]} [baseNode]  [接收节点插入的容器节点]
         * @param  {[integer]}  [pgSize]    [请求的每页卡片数]
         */
        function loadCrs(tmpltNode, baseNode, pgSize) {
            var _tabs = doc.querySelector('.tuj-tabs'),
                _seledTab = _tabs.querySelector('.tuz-crt'),
                _type = _seledTab.dataset.type,
                _pgSelr = doc.querySelector('.tuj-pgselr'),
                _seledPg = _pgSelr.querySelector('.tuz-crt'),
                _pageNo = _seledPg.dataset.pageNo,
                _preOpt = { // 查询参数对象
                    type: _type,
                    pageNo: _pageNo,
                    psize: pgSize
                };
            var _url = 'http://study.163.com/webDev/couresByCategory.htm';
            var _options = serialize(_preOpt);

            function getCrsData(res) {
                res = JSON.parse(res);
                var _list = res.list;
                if (loadPgSelr.isFirstLoad) {
                    loadPgSelr(_pgSelr, res); // 加载选页器
                    loadPgSelr.isFirstLoad = !1;
                    loadPgSelr.totalPage = res.totalPage;
                }
                loadData(tmpltNode, baseNode, _list); // 给cards容器节点下的DOM节点结构插入ajax数据
            }
            queryDataSync(getCrsData, ajaxErr, _url, _options);
        }

        /**
         * [loadRank 加载热门课程数据]
         * @param  {[object]}   [tmpltNode] [“模板节点”对象]
         * @param  {[DOM node]} [baseNode]  [接收节点插入的容器节点]
         */
        function loadRank(tmpltNode, baseNode) {
            var _url = 'http://study.163.com/webDev/hotcouresByCategory.htm';

            function getRankData(res) {
                loadData(tmpltNode, baseNode, JSON.parse(res));
            }
            queryDataAsync(getRankData, ajaxErr, _url);
        }

        /**
         * [clkTabLsnr 利用事件冒泡，监听tab切换事件，应用于所有tab的父元素上]
         */
        function clkTabLsnr(event) {
            event = getEvent(event);
            var _crtTarget = event.currentTarget,
                _target = getTarget(event),
                _parent = _target.parentNode,
                _crtTab = _parent.querySelector('.tuz-crt');
            if (_crtTarget !== _target) { // 事件目标不是事件处理程序所在对象
                if (_crtTab !== _target) {
                    _crtTab.classList.remove('tuz-crt');
                    _target.classList.add('tuz-crt');
                    loadCrs(tmpNodeObj[0], cards, queryCrsDtNum);
                }
            }
        }

        /**
         * [clkPageLsnr 利用事件冒泡，监听切换选页器事件，应用于选页器的容器元素上]
         */
        function clkPageLsnr(event) {
            event = getEvent(event);
            var _pgSelr = event.currentTarget,
                _target = getTarget(event),
                _pages = _pgSelr.children,
                _first = _pages[0],
                _last = _pages[_pages.length - 1],
                _crtPg = _pgSelr.querySelector('.tuz-crt');
            if (_target !== _pgSelr && _target !== _first && _target !== _last && _target !== _crtPg) {
                _crtPg.classList.remove('tuz-crt');
                _target.classList.add('tuz-crt');
                loadCrs(tmpNodeObj[0], cards, queryCrsDtNum);
            }
        }
        /**
         * [refreshPageSelr 前一页和后一页按钮]
         * @param  {[type]} [pgSelrElm] [翻页器DOM节点]
         * @param  {[type]} [forwards]  [表示向前翻页值为负数，向后翻页值为正数]
         */
        function refreshPageSelr(pgSelrElm, forwards) {
            var _pages = pgSelrElm.children,
                _len = _pages.length, // 0 ~ 9
                _totalPg = loadPgSelr.totalPage || (_len - 2),
                _lmt = 0;

            function switchPgSelr(fwds) {
                for (var i = 1; i < _len - 1; i++) { // just need 1 ~ 8
                    var tmp = _pages[i].dataset.pageNo - 1 + 1 + fwds + '';
                    _pages[i].dataset.pageNo = tmp;
                    if (_pages[i].dataset.pageNo !== tmp) { // 解决IE8下polyfill不能对dataset写入
                        _pages[i].setAttribute('data-page-no', tmp);
                    }
                    maniInnerText(_pages[i], 'set', tmp);
                }
            }
            if (forwards < 0) {
                _lmt = _pages[1].dataset.pageNo - 1 + 1;
                if (_lmt > 1) {
                    switchPgSelr(forwards);
                    loadCrs(tmpNodeObj[0], cards, queryCrsDtNum);
                }
            } else if (forwards > 0) {
                _lmt = _pages[_len - 2].dataset.pageNo - 1 + 1;
                if (_lmt < _totalPg) {
                    switchPgSelr(forwards);
                    loadCrs(tmpNodeObj[0], cards, queryCrsDtNum);
                }
            } else {
                console.log('not switch page selector');
            }
        }
        /**
         * [switchPageLsnr 利用事件冒泡，监听前一页和后一页事件，应用于选页器的容器元素上]
         */
        function switchPageLsnr(event) {
            event = getEvent(event);
            var _crtTarget = event.currentTarget,
                _target = getTarget(event),
                _prevBtn = _crtTarget.children[0], // 前一页按钮DOM节点
                _nextBtn = _crtTarget.children[_crtTarget.children.length - 1]; // 后一页按钮DOM节点
            if (_target === _prevBtn) {
                refreshPageSelr(_crtTarget, -1);
            } else if (_target === _nextBtn) {
                refreshPageSelr(_crtTarget, 1);
            } else {
                // console.log('not click the forward or back button');
            }
        }
        /**
         * [clkAnima 利用事件冒泡，监听模拟按键效果的事件，应用于被点击对象的容器元素上]
         * @param  {[DOM node]} [elm] [需要模拟“按键”效果的元素]
         */
        function clkAnima(elm) {
            function mouseDn(event) {
                event = getEvent(event);
                var _crtTarget = event.currentTarget,
                    _target = getTarget(event);
                if (_target !== _crtTarget) {
                    try {
                        _target.classList.remove('tuz-clked');
                    } catch (e) {
                        console.log(e);
                    }
                    _target.classList.add('tuz-clked');
                }
            }
            addHandler(elm, 'mousedown', mouseDn);

            function mouseUp(event) {
                var _target = getTarget(getEvent(event));
                try {
                    _target.classList.remove('tuz-clked');
                } catch (e) {
                    console.log(e);
                }
            }
            addHandler(elm, 'mouseup', mouseUp);
        }
        /**
         * [shiftHotRank 设置热门课程滚动]
         * @param  {[DOM node]} [htRkElm] [热门课程排行对应DOM容器节点]
         */
        function shiftHotRank(htRkElm) {
            var getStyle = VideoUtil.getComputedStyle,
                itmStyle = getStyle(htRkElm.children[0]),
                itmH = parseFloat(itmStyle.height) + parseFloat(itmStyle.marginTop) + parseFloat(itmStyle.marginBottom) + parseFloat(itmStyle.paddingTop) + parseFloat(itmStyle.paddingBottom); // 计算一个子项的总占用高度，用于确定单词最大移动位置的幅度
            var maxTime = 1000,
                steps = 10,
                tmIntvl = maxTime / steps,
                shiftMv = itmH / steps;
            var cnt = 0;

            htRkElm.style.position = 'relative';

            function shiftAnima() {
                var pos = parseFloat(getStyle(htRkElm).bottom) || 0;

                htRkElm.style.bottom = (pos + shiftMv + 'px');
                cnt--;
                if (cnt > 0) {
                    setTimeout(arguments.callee, tmIntvl);
                } else {
                    htRkElm.appendChild(htRkElm.children[0]);
                    htRkElm.style.bottom = 0 + 'px';
                }
            }

            function shiftRank() {
                cnt = steps;
                shiftAnima();
            }
            setInterval(shiftRank, 5000);
        }
        /**
         * [hiddenCards 窄屏时隐藏卡片，宽屏时恢复]
         * @param  {[DOM node]}[cardsElm] [课程卡片容器]
         * @param  {[boolean]} [isHdn]    [是否隐藏]
         */
        function hiddenCards(cardsElm, isHdn) {
            var _child = cardsElm.children,
                _len = _child.length,
                _display = isHdn ? 'none' : 'block';
            for (var i = _len - 1; i > _len - 1 - 5; i--) { // 5是宽屏和窄屏的卡片数之差
                _child[i].style.display = _display;
            }
        }
        /**
         * [winReSized 视口变化时调整显示的课程卡片数]
         */
        function winResized() {
            var _width = getWinWidth();
            if (_width >= 1612) {
                queryCrsDtNum = 20;
                hiddenCards(cards, !1);
            } else if (_width <= 1611) {
                queryCrsDtNum = 15;
                hiddenCards(cards, !0);
            }
            loadCrs(tmpNodeObj[0], cards, queryCrsDtNum); // 重新加载课程卡片区信息
        }

        var tmplts = doc.querySelectorAll('.tuj-tmplt'); // 多个包含模板的DOM节点
        var tmpNodeObj = []; // 存储多个“模板节点”对象的数组
        var dftCrsItmNum = 20; // 默认加载的课程卡片数
        var queryCrsDtNum = dftCrsItmNum; // 初次加载时请求课程卡片数等于加载的卡片节点数

        var cards = doc.querySelector('.tuj-cards'); // 获取课程信息区域的DOM容器节点
        var hotRank = doc.querySelector('.tuj-rank');
        var tabs = doc.querySelector('.tuj-tabs');
        var pgSelr = doc.querySelector('.tuj-pgselr');

        tmpNodeObj.push(createDomStruct(tmplts[0], cards, dftCrsItmNum)); // 获取课程信息区域的模板映射节点对象
        loadPgSelr.isFirstLoad = !0; // 加载页面时，首次默认加载选页器
        winResized(); // 根据页面加载时浏览器视口宽度，加载ajax数据

        tmpNodeObj.push(createDomStruct(tmplts[1], hotRank, 20)); // 默认获取20个热门课程列表项的模板映射节点对象
        loadRank(tmpNodeObj[1], hotRank);

        /* 添加tab切换和换页器控制 */
        addHandler(tabs, 'click', clkTabLsnr);
        addHandler(pgSelr, 'click', clkPageLsnr);
        addHandler(pgSelr, 'click', switchPageLsnr);
        /* 添加按键效果 */
        clkAnima(pgSelr);
        clkAnima(tabs);
        /* 添加热门课程滚动效果 */
        shiftHotRank(hotRank);
        /* 调整浏览器视口时，调整课程卡片的展示数目 */
        addHandler(window, 'resize', winResized);
    })(document);
});
