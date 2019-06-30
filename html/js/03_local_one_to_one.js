'use strict'

var btnOpen = document.querySelector("button#btnOpen");
var btnClose = document.querySelector("button#btnClose");
var btnCall = document.querySelector("button#btnCall");
var btnStop = document.querySelector("button#btnStop");
var localVideo = document.querySelector("video#localVideo");
var remoteVideo = document.querySelector("video#remoteVideo");
var txtLocalSDP = document.querySelector("textarea#txtLocalSDP");
var txtRemoteSDP = document.querySelector("textarea#txtRemoteSDP");

var localPeerConn;
var remotePeerConn;

function getStream(stream) {
	// 其它地方也要引用stream对象，所以放在window上变成全局，方便其它函数使用
	window.stream = stream;
	// 将video元素与stream关联
	localVideo.srcObject = stream;
}

function handleError(err) {
	console.log(err.name + " : " + err.message);
}

window.addEventListener("load", function () {
	if (!navigator.mediaDevices ||
		!navigator.mediaDevices.getUserMedia) {
		console.log('webrtc is not supported!');
		alert("webrtc is not supported!");
		return;
	}

	//打开摄像头
	btnOpen.onclick = () => {
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

	//关闭摄像头
	btnClose.onclick = () => {
		window.stream.getTracks().forEach(element => {
			element.stop();
		});
	};

	//停止视频传输
	btnStop.onclick = () => {
		localPeerConn.close();
		remotePeerConn.close();
		localPeerConn = remotePeerConn = null;
	};

	// 发起视频传输
	btnCall.onclick = () => {
		localPeerConn = new RTCPeerConnection();
		localPeerConn.onicecandidate = (e) => {
			//注：本机模拟，省去跟stun/turn服务器的交互
			remotePeerConn.addIceCandidate(e.candidate)
				.catch(handleError);
			console.log('localPeerConn ICE candidate:', e.candidate);
		}

		localPeerConn.iceconnectionstatechange = (e) => {
			console.log(`localPeerConn ICE state: ${localPeerConn.iceConnectionState}`);
			console.log('ICE state change event: ', e);
		}

		remotePeerConn = new RTCPeerConnection();
		remotePeerConn.onicecandidate = (e) => {
			//注：本机模拟，省去跟stun/turn服务器的交互
			localPeerConn.addIceCandidate(e.candidate)
				.catch(handleError);
			console.log('remotePeerConn ICE candidate:', e.candidate);
		}

		remotePeerConn.iceconnectionstatechange = (e) => {
			console.log(`remotePeerConn ICE state: ${remotePeerConn.iceConnectionState}`);
			console.log('ICE state change event: ', e);
		}

		remotePeerConn.ontrack = (e) => {
			if (remoteVideo.srcObject !== e.streams[0]) {
				remoteVideo.srcObject = e.streams[0];
			}
		};

		window.stream.getTracks().forEach((track) => {
			localPeerConn.addTrack(track, window.stream);
		});

		var offerOptions = {
			//不收音频(本机会有回音嚣叫，先关掉)
			offerToReceiveAudio: 0,
			//接收视频
			offerToReceiveVideo: 1
		};

		localPeerConn.createOffer(offerOptions)
			.then(function (localDesc) {
				//取得local的SDP信息
				txtLocalSDP.textContent = localDesc.sdp;
				localPeerConn.setLocalDescription(localDesc);
				//本机省去跟信令服务器交互的过程
				remotePeerConn.setRemoteDescription(localDesc);
				remotePeerConn.createAnswer().then(function (remoteDesc) {
					//remote的SDP信息
					txtRemoteSDP.textContent = remoteDesc.sdp;
					remotePeerConn.setLocalDescription(remoteDesc);
					//本机省去跟信令服务器交互的过程
					localPeerConn.setRemoteDescription(remoteDesc);
				})
					.catch(handleError);
			})
			.catch(handleError);

	}

}, false);

// https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getSupportedConstraints#Result
// https://www.html.cn/html5-demo/-webkit-filter/index.html
// https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/adapter.js