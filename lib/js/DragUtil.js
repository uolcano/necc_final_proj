/**
 * [DragUtil 使用时必须激活元素定位，relative/absolute/fixed]
 * @type {Object}
 */
var DragUtil = {
	mousePosX : 0,
	mousePosY : 0,
	mouseMoving : !1,//判断是否禁用拖放的flag
	dragTarget : null,//记录拿起并准备拖动的元素节点
	// 拿起元素
	dragUp : function (event) {
		event = event || window.event;
		this.dragTarget = event.target || event.srcElement;
		this.mousePosX = event.clientX;
		this.mousePosY = event.clientY;
		this.mouseMoving = !0;
	},
	// 拖动元素
	dragMove : function (event) {
		// 禁用拖放
		if (!this.mouseMoving) {
			return;
		}
	    // 修改元素位置前，获取元素当前位置
		var tgStyle = this.dragTarget.style;
		var left = parseInt(tgStyle.left) || 0,
		    top = parseInt(tgStyle.top) || 0;
		// 获取鼠标当前位置
		event = event || window.event;
		var moveX = event.clientX,
		    moveY = event.clientY;
	    // 修正元素位置
		tgStyle.left = moveX - this.mousePosX + left + 'px';
		tgStyle.top = moveY - this.mousePosY + top + 'px';
		// 记录本次事件触发时鼠标的位置，以便下一次事件触发时计算
		this.mousePosX = moveX;
		this.mousePosY = moveY;
	},
	// 鼠标松开放下元素，禁用拖放
	dragDown : function (event) {
		this.mouseMoving = !1;
	},
	// 鼠标拖动元素过快而离开时禁用拖放
	dragMiss : function (event) {
		this.mouseMoving = !1;
	}
};