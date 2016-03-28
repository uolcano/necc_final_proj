/**
 * [createDomStruct 完成容器节点下的节点构建]
 * @param  {[DOM node]} tmpltElm [模板节点]
 * @param  {[DOM node]} baseNode [接收节点插入的容器节点]
 * @param  {[integer]}  childNum [插入节点的数目]
 * @return {[object]}   nodes    [映射到待插入的单个DOM节点的节点模板对象]
 * *! 注意：要求模板字符串中的${track.propName)中的propName与ajax响应数据项中的属性名相同，
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
 */
function createDomStruct(tmpltElm, baseNode, childNum) {
    var timeCnt = +new Date();
    var htmlStr = maniInnerText(tmpltElm, 'get'); // the string to be converted
    var isOp = !0; // !0 for getting root tmpnode, this root tmpnode is a template object
    function treeWalker(node) {
        var ptnOp = /^<[a-zA-Z0-9]+?.*?[^\/]>/; // for open tag
        var ptnEd = /^<\/[a-zA-Z0-9]+?>/; // for close tag
        var ptnOpEd = /^<.+?\/>/; // for self closed tag
        var ptnTxt = /^[^>].+?(?=<)/; // for text node
        var matches = null;
        var flag = !0;
        var cnt = 30; // prevent the unexpected infinite iteration
        while (htmlStr.length && flag && cnt) {
            htmlStr = htmlStr.trim(); // throw away the blank characters at the open and end of the string to match
            if (matches = ptnEd.exec(htmlStr)) { // match the end tag, and terminate the iteration
                htmlStr = RegExp.rightContext;
                node.txt += matches[0];
                break;
            } else if (matches = ptnOp.exec(htmlStr)) { // match the open tag, and 
                htmlStr = RegExp.rightContext;
                if (isOp) { // set the root tmpnode
                    isOp = !1;
                    node.txt = matches[0];
                    arguments.callee(node);
                } else { // set the descendant nodes
                    var sub = { txt: matches[0], subTree: [] };
                    node.subTree.push(sub);
                    arguments.callee(sub);
                    sub = null;
                }
            } else if (matches = ptnOpEd.exec(htmlStr)) { //  match the self closed tag
                htmlStr = RegExp.rightContext;
                node.subTree.push({ txt: matches[0], subTree: [] });
            } else if (matches = ptnTxt.exec(htmlStr)) { // match the text node
                htmlStr = RegExp.rightContext;
                node.txt += matches[0];
            } else { // template structure error
                flag = !1;
                console.log('Error: Invalid template structure!');
            }
            cnt--;
        }
    }
    var nodes = { txt: '', subTree: [] };
    treeWalker(nodes);
    // console.log(nodes);

    function getNodeAttr(tmpNode) {
        var ptnTag = /^<([a-zA-Z0-9]+)(?=\s*)/; // capture the tag name
        var ptnAttr = /^([a-zA-Z\-]+)\s*=\s*[\'\"]\s*(.+?)\s*[\'\"]/; // capture the html attributes
        var ptnData = /\$\{track\.(.+?)\}/;
        var txt = tmpNode.txt;
        var matches = null;
        var subMatch = null;
        tmpNode.attrs = [];
        while (txt.length) {
            txt = txt.trim();
            if (matches = ptnTag.exec(txt)) { // get the tag name
                txt = RegExp.rightContext;
                tmpNode.tagName = matches[1];
            } else if (matches = ptnAttr.exec(txt)) { // get the attrs key/value pairs
                txt = RegExp.rightContext;
                var kv = { name: matches[1], value: matches[2] };
                if (kv.name === 'class') {
                    kv.name = 'className';
                }
                if (ptnData.exec(kv.value)) { // ignore the attrs' value, which need the ajax data to fill
                    kv.value = '';
                }
                tmpNode.attrs.push(kv);
                kv = null;
            } else {
                break;
            }
        }
    }
    isOp = !0; // mark the root tmpnode
    // extract a tmpnode's some key/value pairs as the attributes of the following generated real dom node
    function deepProgNode(tmpNode) {
        if (isOp) { // set the root tmpnode
            isOp = !1;
            getNodeAttr(tmpNode);
        }
        for (var i = 0, len = tmpNode.subTree.length; i < len; i++) { // the tree branch tmpNode
            getNodeAttr(tmpNode.subTree[i]);
            arguments.callee(tmpNode.subTree[i]);
        }
    }
    deepProgNode(nodes);
    // console.log(nodes);

    /**
     * 优化方案一：利用文档片段，逐个添加DOM结构节点
     */
    // function setNodeAttr (tmpNode, domNode) {
    //     var ptnDs = /^data-/;
    //     for (var i = 0, len = tmpNode.attrs.length; i < len; i++) {
    //         if (ptnDs.exec(tmpNode.attrs[i].name)) { // append dataset attribute
    //             var name = RegExp.rightContext;
    //             name = name.replace(/-([a-zA-Z0-9])/g, function (m, p) {
    //                  return p.toUpperCase();
    //             });
    //             domNode.dataset[name] = tmpNode.attrs[i].value;
    //         } else {
    //             domNode[tmpNode.attrs[i].name] = tmpNode.attrs[i].value;
    //         }
    //     }
    // }
    // // generate some real dom nodes, counted as childNum, and then append to the baseNode
    // function genDom (tmpNode, pNode) {// the document fragment node used to append into a base node
    //     var domNode = document.createElement(tmpNode.tagName);
    //     setNodeAttr(tmpNode, domNode);
    //     for (var i = 0; i < tmpNode.subTree.length; i++) {
    //         arguments.callee(tmpNode.subTree[i], domNode);
    //     }
    //     pNode.appendChild(domNode);
    // }
    // for (var i = 0; i < childNum; i++) {// generate some dom nodes of the childNum number
    //     var docFrag = document.createDocumentFragment();
    //     genDom(nodes, docFrag);
    //     baseNode.appendChild(docFrag);
    // }

    /**
     * 优化方案二：利用innerHTML，快速生成DOM子树
     */
    var inHtml = '';
    for (var i = 0; i < childNum; i++) { // generate some dom nodes of the childNum number
        inHtml += maniInnerText(tmpltElm, 'get').replace(/\$\{track\..+?\}/g, '');
    }
    baseNode.innerHTML = inHtml;
    // console.log('timepass:', +new Date() - timeCnt);
    return nodes; // return the template node object
}

function wtNodeAttr(tmpNode, domNode, item, matches) {
    for (var i = 0, len = tmpNode.attrs.length; i < len; i++) {
        if (tmpNode.attrs[i].name === matches[1]) {
            var m = null;
            if (m = /^data-(.+)/.exec(matches[1])) { // set the dataset attribute
                matches[1] = m[1].replace(/-([a-zA-Z0-9])/g, function(m, p) {
                    return p.toUpperCase();
                });
                domNode.dataset[matches[1]] = matches[2].replace(/\$\{track\.(.+?)\}/, item[matches[3]]);
            } else {
                domNode[matches[1]] = matches[2].replace(/\$\{track\.(.+?)\}/, item[matches[3]]);
            }
        }
    }
}

// matche the ajax data from tempNode, fill into the domNode
function matchData(tmpNode, domNode, item) {
    var matches = null;
    var txt = tmpNode.txt;
    if (matches = ptnTxt.exec(txt)) { // text setting
        var inTxt = item[matches[1]];
        if (!item[matches[1]]) { // 如果ajax返回数据为空值
            switch (matches[1]) {
                case 'name':
                case 'categoryName':
                case 'provider':
                case 'description':
                    inTxt = '暂无';
                    break;
                case 'learnerCount':
                case 'price':
                    inTxt = '0';
                    break;
                default:
                    inTxt = 'undefined';
                    break;
            }
        }
        maniInnerText(domNode, 'set', inTxt); // insert text node with the ajax data
    }
    if (matches = ptnKv.exec(txt)) { // attribute setting
        var prevM = matches[0];
        var nextM = '';
        while (matches = ptnKvSub.exec(prevM)) { // throw away the too long matched string, that not matched exactly
            var nextM = matches[0];
            var mKv = matches;
            if (prevM === nextM) break;
            prevM = nextM;
            txt = nextM.trim();
        }
        wtNodeAttr(tmpNode, domNode, item, mKv); // set the attributes filled with the ajax data
    }
}
// 模板映射节点对象和DOM节点同步迭代，以ajax返回数据更新DOM节点的数据
function dbNodeTravl(tmpNode, domNode, item) {
        matchData(tmpNode, domNode, item);
    // }
    for (var i = 0, len = tmpNode.subTree.length; i < len; i++) {
        matchData(tmpNode.subTree[i], domNode.children[i], item);
        arguments.callee(tmpNode.subTree[i], domNode.children[i], item);
    }
}

function loadData(tmpNode, baseNode, list) {
    for (var i = 0, len = list.length; i < len; i++) {
        dbNodeTravl(tmpNode, baseNode.children[i], list[i]);
    }
}

function throwExcept() {
    console.log('AjaxError: not yet get response.');
}

var tmplts = document.querySelectorAll('.tuj-tmplt');
var tmpNodeObj = [];
var dftCrsItmNum = 20; // 默认加载的课程卡片数

var queryCrsDtNum = dftCrsItmNum; // 初次加载时请求课程卡片数等于加载的卡片节点数
var cards = document.querySelector('.tuj-cards'); // 获取课程信息区域的DOM容器节点
tmpNodeObj.push(createDomStruct(tmplts[0], cards, dftCrsItmNum)); // 获取课程信息区域的模板映射节点对象
loadPgSelr.isFirstLoad = !0; // 加载页面时，首次默认加载选页器
loadCrs();

var hotRank = document.querySelector('.tuj-rank');
tmpNodeObj.push(createDomStruct(tmplts[1], hotRank, 20));// 默认获取20个热门课程列表项的模板映射节点对象
loadRank();


var ptnTxt = />\s*\$\{track\.(.+?)\}\s*</;
var ptnKv = /([a-zA-Z\-]+)\s*=\s*[\'\"].*\$\{track\.(.+?)\}.*[\'\"]/;
var ptnKvSub = /\s([a-zA-Z\-]+)\s*=\s*[\'\"](.*?\$\{track\.(.+?)\}.*?)[\'\"]/;

function loadRank() {
    var url = 'http://study.163.com/webDev/hotcouresByCategory.htm';

    function qryData(url, options) {
        var query = url + ((typeof options === 'string' && options.length > 0) ? ('?' + options) : '');
        var xhr = new XMLHttpRequest();
        try {
            xhr.open('get', query);
        } catch(e1) {
            try {
                xhr = new XDomainRequest();
                xhr.open('get', query);
                console.log('create a cross-origin request for IE');
            } catch(e2) {
                console.log('Error: create request unsuccessfully.', e2);
            }
        }
        xhr.onload = function(event) {
            loadData(tmpNodeObj[1], hotRank, JSON.parse(xhr.responseText));
        };
        xhr.open('get', query);
        xhr.send(null);
    }
    qryData(url);
    // setTimeout(loadRank, 5000);
}

function loadCrs() {
    var tabs = document.querySelector('.tuj-tabs');
    var seledTab = tabs.querySelector('.tuz-crt');
    var type = seledTab.dataset.type;
    var pgSelr = document.querySelector('.tuj-pgselr');
    var seledPg = pgSelr.querySelector('.tuz-crt');
    var pageNo = seledPg.dataset.pageNo;
    var preOpt = { type: type, pageNo: pageNo, psize: queryCrsDtNum };

    var url = 'http://study.163.com/webDev/couresByCategory.htm';
    var options = serialize(preOpt);
    // console.log(options);

    function getCrsData() {
        var res = getServerData.response;
        var list = res.list;
        // console.log('load course:',res);

        if (loadPgSelr.isFirstLoad) {
            loadPgSelr(pgSelr, res); // 加载选页器
            loadPgSelr.isFirstLoad = !1;
            loadPgSelr.totalPage = res.totalPage;
        }
        // 给cards容器节点下的DOM节点结构插入ajax数据
        loadData(tmpNodeObj[0], cards, list);
    }

    waitResponse(getCrsData, throwExcept, getServerData, url, options);
}

// tab切换
function clkTabLsnr(event) {
    var target = getTarget(getEvent(event));
    var parent = target.parentNode;
    var crtTab = parent.querySelector('.tuz-crt');
    if (this !== target) { // 事件目标不是事件处理程序所在对象
        if (crtTab !== target) {
            crtTab.classList.remove('tuz-crt');
            target.classList.add('tuz-crt');
            loadCrs();
        }
    }
}
var tabs = document.querySelector('.tuj-tabs');
addHandler(tabs, 'click', clkTabLsnr);

// 加载选页器
function loadPgSelr(pgSelrElm, response) {
    var pages = pgSelrElm.children;
    var pageLen = pages.length - 2;
    var pageIdx = response.pagination.DEFAULT_PAGE_INDEX;
    var totalPg = response.totalPage;
    for (var i = 1; i <= pageLen; i++) {
        try {
            pages[i].classList.remove('tuz-crt');
        } catch (e) {
            console.log(e);
        }
        if (i > totalPg) {
            pages[i].style.display = 'none';
        } else {
            pages[i].dataset.pageNo = i;
            maniInnerText(pages[i], 'set', i);
            if (i === pageIdx) {
                pages[i].classList.add('tuz-crt');
            }
        }
    }
}
// 切换选页器
function clkPageLsnr(event) {
    var target = getTarget(getEvent(event));
    var pgSelr = this;
    var pages = pgSelr.children;
    var first = pages[0];
    var last = pages[pages.length - 1];
    var crtPg = this.querySelector('.tuz-crt');
    if (target !== this && target !== first && target !== last && target !== crtPg) {
        crtPg.classList.remove('tuz-crt');
        target.classList.add('tuz-crt');
        loadCrs();
    }
}
var pgSelr = document.querySelector('.tuj-pgselr');
addHandler(pgSelr, 'click', clkPageLsnr);

// 前一页和后一页按钮
function refreshPageSelr(pgSelrElm, forwards) {
    var pages = pgSelrElm.children;
    var len = pages.length; // 0 ~ 9
    var totalPg = loadPgSelr.totalPage || (len - 2);

    function switchPgSelr(fwds) {
        for (var i = 1; i < len - 1; i++) { // just need 1 ~ 8
            var tmp = pages[i].dataset.pageNo - 1 + 1 + fwds;
            pages[i].dataset.pageNo = tmp;
            maniInnerText(pages[i], 'set', tmp);
        }
    }
    if (forwards < 0) {
        var lmt = pages[1].dataset.pageNo - 1 + 1;
        if (lmt > 1) {
            switchPgSelr(forwards);
            loadCrs();
        }
    } else if (forwards > 0) {
        lmt = pages[len - 2].dataset.pageNo - 1 + 1;
        if (lmt < totalPg) {
            switchPgSelr(forwards);
            loadCrs();
        }
    } else {
        console.log('not switch page selector');
    }
}

function switchPageLsnr(event) {
    var target = getTarget(getEvent(event));
    var prevBtn = this.children[0];
    var nextBtn = this.children[this.children.length - 1];
    if (target === prevBtn) {
        refreshPageSelr(this, -1);
    } else if (target === nextBtn) {
        refreshPageSelr(this, 1);
    } else {
        console.log('not click the forward or back button');
    }
}
addHandler(pgSelr, 'click', switchPageLsnr);

// 模拟按键效果
function clkAnima(elm) {
    function mouseDn(event) {
        var target = getTarget(getEvent(event));
        if (target !== this) {
            try {
                target.classList.remove('tuz-clked');
            } catch (e) {
                console.log(e);
            }
            target.classList.add('tuz-clked');
        }
    }
    addHandler(elm, 'mousedown', mouseDn);

    function mouseUp(event) {
        var target = getTarget(getEvent(event));
        try {
            target.classList.remove('tuz-clked');
        } catch (e) {
            console.log(e);
        }
    }
    addHandler(elm, 'mouseup', mouseUp);
}
clkAnima(pgSelr);
clkAnima(tabs);


// test snippet
// var arr = extractTmplt(tmplts[0]);
// for (var i = 0, len = arr.length; i < len; i++) {
//  // if (i % 2) {
//      console.log(arr[i]);
//  // }
// };

/**
 * 简单方案一：利用String.prototype.split()，先将模板字符串分隔，
 *             并替换上需要填充的内容在返回数据项中的属性名；
 *             在响应数据处理函数中，将数据替换上，
 *             然后通过Array.prototype.join()，中间插入空字符串，完成数据插入，
 *             最后写入DOM节点的innerHTML。
 * *! 注意：要求模板字符串中的${track.propName)中的propName与ajax响应数据项中的属性名相同
 * @dataStructure {[array]} tmpltArr [存储了模板字符串的每一段被分割的子串，偶数项是普通子串不需要被ajax数据替换，奇数项是提取子串处理后对应待填充的ajax数据的属性名称]
 * --- [
 * ------ 0: 'htmlStr',
 * ------ 1: 'propNameStr',
 * ------ 2: 'htmlStr',
 * ------ 3: 'propNameStr',
 * ------ ...
 * --- ]
 * 
 */
// function extractTmplt(tmpltElm) {// the template to be matched should not be opened or ended with a matcheable item
//  var timeCnt = +new Date();
//     var pattern = /\$\{track\.(.+?)\}/;
//     var matches = null;
//  var tmpltStr = tmpltElm.innerHTML;
//  var tmpltArr = [];
//  tmpltArr.tmpltStr = tmpltStr;
//     while (matches = pattern.exec(tmpltStr)) {
//      var arr = tmpltStr.split(matches[0]);
//      tmpltArr.push(arr[0]);
//      tmpltArr.push(matches[1]);
//      tmpltStr = arr[1];
//     }
//     tmpltArr.push(RegExp.rightContext);
//     // console.log('extractTmplt timepass:', +new Date() - timeCnt);
//     return tmpltArr;
// }
// var tmpltArr = extractTmplt(tmplts[0]);
// function getData () {
//  var res = getServerData.response;
//  var list = res.list;
//     var inHtml = '';
//  for (var i = 0, len = list.length; i < len; i++) {
//      var tmplt = [];
//      var idx = 0;
//      while (tmpltArr[idx]) {
//          tmplt.push((idx % 2) ? (typeof list[i][tmpltArr[idx]] === null ? '' : list[i][tmpltArr[idx]]) : tmpltArr[idx]);
//          idx++;
//      }
//      var tmpltStr = tmplt.join('');
//         inHtml += tmpltStr;
//     }
//  cards.innerHTML = inHtml;
// }
// function except () {
//  console.log('not get!');
// }
// waitResponse(getData, except, getServerData, url, options);

/**
 * 简单方案二：利用
 * 
 * *! 注意：要求模板字符串中的${track.propName)中的propName与ajax响应数据项中的属性名相同
 * @dataStructure {[array]} [存储待ajax数据替换的字符串及其对应的数据项的属性名的对象，组成的数组]
 * --- [
 * ------ 0:{match: 'htmlStr', propName: 'propNameStr'},
 * ------ 1:{match: 'htmlStr', propName: 'propNameStr'},
 * ------ 2:{match: 'htmlStr', propName: 'propNameStr'},
 * ------ ...
 * --- ]
 */
// function getTmplt(tmpltElm) {
//  var timeCnt = +new Date();
//     var tmpltStr = tmpltElm.innerHTML;
//     var tmpltArr = [];
//     var pattern = /\$\{track\.(.+?)\}/g;
//     var matches = null;
//     while (matches = pattern.exec(tmpltStr)) {
//         var obj = {match: matches[0], propName: matches[1]};
//         tmpltArr.push(obj);
//         obj = null;
//     }
//     tmpltArr.txt = tmpltStr;
//     // console.log('getTmplt timepass:', +new Date() - timeCnt);
//     return tmpltArr;
// }
// var tmpltArr = getTmplt(tmplts[0]);
// function getData () {
//  var res = getServerData.response;
//  var list = res.list;
//     var inHtml = '';
//  for (var i = 0, lstLen = list.length; i < lstLen; i++) {
//      var str = tmpltArr.txt;
//      for (var j = 0, tmpLen = tmpltArr.length; j < tmpLen; j++) {
//          str = str.replace(tmpltArr[j].match, list[i][tmpltArr[j].propName]);
//      }
//      inHtml += str;
//  }
//     cards.innerHTML = inHtml;
// }
// function except () {
//  console.log('not get!');
// }
// waitResponse(getData, except, getServerData, url, options);
