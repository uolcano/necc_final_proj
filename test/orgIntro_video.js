addHandler(window, 'load', function () {
var poster = document.querySelector('.j-poster');
	function openVdoWin (event) {
		var fxWin = document.querySelector('.j-fxwin'),
		parent = fxWin.parentNode,
		clsBtn = fxWin.querySelector('.j-clsvideo'),
		video = fxWin.querySelector('.vuj-vdosrc'),
		playPic = fxWin.querySelector('.j-playicon');

		// 显示前台视频窗口
		parent.style.display = 'block';

		// 防止第二次打开前台视频窗口时，播放大图标显示不正确
		playPic.style.display = video.paused ? 'block' : 'none';

		// 点击播放大图标播放视频
		function clkPlayEv (event) {
			video.play();
			playPic.style.display = 'none';
		}
		addHandler(playPic, 'click', clkPlayEv);

		// 监听播放和暂停事件，来同步改变播放大图标的显示和隐藏
		function playLsnr (event) {
			playPic.style.display = 'none';
		}
		function pauseLsnr (event) {
			playPic.style.display = 'block';
		}
		addHandler(video, 'play', playLsnr);
		addHandler(video, 'pause', pauseLsnr);

		function clsVdoWin (event) {
			try {// 防止IE不支持video而无法关闭视频窗口
				video.pause();
			} catch(e) {
				maniInnerText(video, 'set', '您的浏览器版本太低，不支持播放此视频。');
				console.log('IE unsupport the video');
			}
			parent.style.display = 'none';
			removeHandler(playPic, 'click', clkPlayEv);
			removeHandler(video, 'play', playLsnr);
			removeHandler(video, 'pause', pauseLsnr);
			removeHandler(clsBtn, 'click', clsVdoWin);
			playPic = null;
			video = null;
			clsBtn = null;
			parent = null;
			fxWin = null;
		}
		addHandler(clsBtn, 'click', clsVdoWin);
	}
	poster.addEventListener('click', openVdoWin);
});