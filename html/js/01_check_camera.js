'use strict'

var audioInput = document.querySelector("select#audioInput");
var audioOutput = document.querySelector("select#audioOutput");
var videoInput = document.querySelector("select#videoInput");
var videoElement = document.querySelector('video');

var txtVideoContraints = document.querySelector('textarea#videoContraints');
var txtAudioContraints = document.querySelector('textarea#audioContraints');
var txtSupportedContraints = document.querySelector('textarea#supportedContraints');

function getStream(stream) {
	videoElement.srcObject = stream;

	var videoTrack = stream.getVideoTracks()[0];
	var videoConstraints = videoTrack.getSettings();
	txtVideoContraints.textContent = JSON.stringify(videoConstraints, null, 4);

	var audioTrack = stream.getAudioTracks()[0];
	var audioConstraints = audioTrack.getSettings();
	txtAudioContraints.textContent = JSON.stringify(audioConstraints, null, 4);

	var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
	txtSupportedContraints.textContent = JSON.stringify(supportedConstraints, null, 4);

	//列举所有可用的多媒体设备
	return navigator.mediaDevices.enumerateDevices();
}

function handleError(err) {
	console.log(err.name + " : " + err.message);
}

function getDevices(deviceInfos) {
	//控制台打印所有设备信息
	deviceInfos.forEach(function (deviceInfo) {
		console.log("kind:" + deviceInfo.kind + " , label:" + deviceInfo.label
			+ " , id:" + deviceInfo.deviceId + " , groupId:" + deviceInfo.groupId);

		//将设备列表填充到下拉框
		var option = document.createElement('option');
		//注：只有当前站点，用户授权同意访问多媒体设备后，才能拿到label
		option.text = deviceInfo.label;
		option.value = deviceInfo.deviceId;
		if (deviceInfo.kind === 'audioinput') {
			audioInput.appendChild(option);
		} else if (deviceInfo.kind === 'audiooutput') {
			audioOutput.appendChild(option);
		} else if (deviceInfo.kind === 'videoinput') {
			videoInput.appendChild(option);
		}
	});

}

window.addEventListener("load", function () {
	if (!navigator.mediaDevices ||
		!navigator.mediaDevices.getUserMedia) {
		console.log('webrtc is not supported!');
		alert("webrtc is not supported!");
		return;
	}

	var constraints = {
		video: {
			width: 320,
			frameRate: {
				min: 15,
				max: 60
			}
		},
		audio: {
			echoCancellation: true,
			noiseSuppression: true,
			volume: 0.1
		}
		// audio: false
	}

	navigator.mediaDevices.getUserMedia(constraints)
		.then(getStream)
		.then(getDevices)
		.catch(handleError);
}, false);


// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getSupportedConstraints#Result