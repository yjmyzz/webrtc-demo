'use strict'


var videoElement = document.querySelector('video#video');
var videoRecord = document.querySelector("video#videoRecord");
var selCssFilter = document.querySelector("select#selFilter");
var btnSnap = document.querySelector("button#btnSnap");
var btnClear = document.querySelector("button#btnClear");
var tdPic = document.querySelector("td#tdPic");
var btnRecord = document.querySelector("button#btnRecord")
var btnPlayRecord = document.querySelector("button#btnPlayRecord");
var btnDownload = document.querySelector("button#btnDownload");
var btnStart = document.querySelector("button#btnStart");

var mediaRecorder;
var buffer;
var recording = false;

function getStream(stream) {
	// 其它地方也要引用stream对象，所以放在window上变成全局，方便其它函数使用
	window.stream = stream;
	// 将video元素与stream关联
	videoElement.srcObject = stream;
	btnStop.disabled = btnSnap.disabled = btnClear.disabled = btnRecord.disabled = false;
}

function handleError(err) {
	console.log(err.name + " : " + err.message);
}

window.addEventListener("load", function () {
	if (!navigator.mediaDevices ||
		!navigator.mediaDevices.getUserMedia) {
		console.log('webrtc is not supported!');
		btnStart.disabled = btnStop.disabled = btnSnap.disabled = btnClear.disabled = btnRecord.disabled = true;
		alert("webrtc is not supported!");
		return;
	}

	btnStart.onclick = () => {
		var constraints = {
			video: {
				width: 320,
				frameRate: {
					min: 15,
					max: 60
				}
			},
			audio: false
		}

		//打开摄像头设备
		navigator.mediaDevices.getUserMedia(constraints)
			.then(getStream)
			.catch(handleError);
	}


	//切换css特效滤镜
	selCssFilter.onchange = function () {
		videoElement.className = selCssFilter.value;
	};

	//视频截图
	btnSnap.onclick = function () {
		var canvas = document.createElement("canvas");
		canvas.className = selCssFilter.value + " pic";
		canvas.getContext('2d').drawImage(videoElement, 0, 0, canvas.width, canvas.height);
		tdPic.appendChild(canvas);
	};

	//清空截图
	btnClear.onclick = () => {
		tdPic.innerHTML = "";
	};

	//开始/停止视频录制
	btnRecord.onclick = () => {
		if (!recording) {
			buffer = [];

			var options = {
				mimeType: 'video/webm;codecs=vp8'
			}

			if (!MediaRecorder.isTypeSupported(options.mimeType)) {
				console.error(`${options.mimeType} is not supported!`);
				return;
			}

			try {
				mediaRecorder = new MediaRecorder(window.stream, options);
			} catch (e) {
				console.error('Failed to create MediaRecorder:', e);
				return;
			}

			mediaRecorder.ondataavailable = (e) => {
				if (e && e.data && e.data.size > 0) {
					buffer.push(e.data);
				}
			};
			mediaRecorder.start(10);

			btnRecord.textContent = "停止录制";
			btnPlayRecord.disabled = true;
			btnDownload.disabled = true;
			recording = true;
		}
		else {
			if (mediaRecorder != undefined) {
				mediaRecorder.stop();
			}
			recording = false;
			btnPlayRecord.disabled = false;
			btnDownload.disabled = false;
			btnRecord.textContent = "开始录制";
		}
	}

	// 播放录制的视频
	btnPlayRecord.onclick = () => {
		videoRecord.src = null;
		var blob = new Blob(buffer, { type: 'video/webm' });
		videoRecord.src = window.URL.createObjectURL(blob);
		videoRecord.srcObject = null;
		videoRecord.controls = true;
		videoRecord.play();
	};

	// 下载录制的视频
	btnDownload.onclick = () => {
		var blob = new Blob(buffer, { type: 'video/webm' });
		var url = window.URL.createObjectURL(blob);
		var a = document.createElement('a');
		a.href = url;
		a.style.display = 'none';
		a.download = 'download.webm';
		a.click();
	}

	//关闭摄像头
	btnStop.onclick = () => {
		window.stream.getTracks().forEach(element => {
			element.stop();
			btnStop.disabled = btnSnap.disabled = btnClear.disabled = btnRecord.disabled = btnPlayRecord.disabled = btnDownload.disabled = true;
			btnStart.disabled = false;
		});
	}

}, false);

// https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getSupportedConstraints#Result
// https://www.html.cn/html5-demo/-webkit-filter/index.html