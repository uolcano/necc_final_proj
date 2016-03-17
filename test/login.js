window.addEventListener('load', function () {
});
var CompatUtil = {
	innerText: function (elem, flag, text) {
		var bool = (typeof elem.textContent === 'string');
		switch (flag) {
			case 'get':
				return bool ? elem.textContent : elem.innerText;
				break;
			case 'set':
				bool ? (elem.textContent = text) : (elem.innerText = text);
				break;
			default:
				throw new Error('Error: wrong flag, only accept "get" and "set".');
				break;
		}
	}
}
function showErr (elem ,err) {
	//显示错误信息
	elem.addEventListener('blur', function (event) {
		var value = elem.value,
		matches = value.match(/[^\w\d]/g);

		if (!value){
			CompatUtil.innerText(err, 'set', '不能为空');
			err.style.display = 'block';
			elem.style.borderColor = 'red';
		} else if (matches && elem.type !== 'password') { //只处理用户账户
			if (matches.length === 2 && matches[0] === '@' && matches[1] === '.') {
				;
			} else {
				CompatUtil.innerText(err, 'set', '非法字符：' + matches.join(','));
				err.style.display = 'block';
				elem.style.borderColor = 'red';
			}
		}
		//超时隐藏错误提示
		var stoid = setTimeout(function () {
			err.style.display = 'none';
			clearTimeout(stoid);
		}, 3000);
	});
	//隐藏错误提示
	elem.addEventListener('focus', function (event) {
		err.style.display = 'none';
		elem.style.borderColor = '';
	});
}
function submitListener (event) {
	 // body...  
}



var form = document.getElementById('login'),
ursnm = document.getElementById('usrname'),
pswd = document.getElementById('password'),
btn = document.getElementById('submit'),
mask = document.querySelector('.m-login'),
ursnmerr = document.querySelector('.m-login #usrname+.errmsg'),
pswderr = document.querySelector('.m-login #password+.errmsg'),
cncl = document.querySelector('.m-login .cnclicon');

ursnm.focus();
showErr(ursnm, ursnmerr);
showErr(pswd, pswderr);
form.addEventListener('submit', submitListener);
cncl.addEventListener('click', function (event) {
	mask.style.display = 'none';
});