'use strict'


var videoElement = document.querySelector('video');


function getStream(stream) {
	videoElement.srcObject = stream;
}

function handleError(err) {
	console.log(err.name + " : " + err.message);
}

window.addEventListener("load", function () {
	if (!navigator.mediaDevices ||
		!navigator.mediaDevices.getDisplayMedia) {
		console.log('webrtc is not supported!');
		alert("webrtc is not supported!");
		return;
	}

	var displayConstraints = { video: { width: 640 }, audio: false };
	navigator.mediaDevices.getDisplayMedia(displayConstraints)
		.then(getStream)
		.catch(handleError);
}, false);

// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getSupportedConstraints#Result
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia