window.addEventListener('load', function () {
	var topmsg = document.querySelector('.j-topmsg'),
	msgcls = topmsg.querySelector('.j-msgcls');

	function closeMsg (event) {
		CookieUtil.set('hiddenTopMsg', true, new Date((+new Date()).valueOf() + 86400000));// 设置一天的失效时间
		topmsg.style.display = 'none';
	}

	if (CookieUtil.get('hiddenTopMsg')) {
		topmsg.style.display = 'none';
	}

	msgcls.addEventListener('click', closeMsg);
});