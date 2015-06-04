var haveRecoResult = false;
var currentConfidence = 1;
var startTime;
var endTime;
var recognizer;
var speechEngineName = "Web Speech API";

// Test browser support
function initializeReco() {
    // check that your browser supports the API
    if (!('webkitSpeechRecognition' in window)) {
        alert("Your browser does not support the Web Speech API");
        //disable "start speaking" and "stop speaking" buttons
        document.getElementById('startReco').disabled = true;
        document.getElementById('stopReco').disabled = true;
    }
    else {
        recognizer = new webkitSpeechRecognition();
        // Recogniser doesn't stop listening even if the user pauses
        recognizer.continuous = true;
        recognizer.interimResults = true;
        final_transcript = '';
        //enable "start speaking" and "stop speaking" buttons
        document.getElementById('startReco').disabled = false;
        document.getElementById('stopReco').disabled = false;
        final_span.innerHTML = '';
        interim_span.innerHTML = '';
        transcription = document.getElementById('messageTextPost');
        // result event handler
        recognizer.onresult = function(event) {
            var interim_transcript = '';
            final_span.innerHTML = '';
            final_transcript = '';
            for (var i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    final_transcript = event.results[i][0].transcript;
                    //transcription.textContent = event.results[i][0].transcript;
                    transcription.value = event.results[i][0].transcript;
                    haveRecoResult = true;
                    currentConfidence = event.results[i][0].confidence;
                    // extract emma if current recognizer supports emma
                    // currentEmma = event.results[i][0].emma;
                    addMessagePost();
                    haveRecoResult = false;
                    turnOffRecognition();
                } else {
                    interim_transcript = event.results[i][0].transcript;
                    //transcription.textContent += event.results[i][0].transcript;
                }
            }
            final_span.innerHTML = final_transcript;
            interim_span.innerHTML = interim_transcript;
        };
        recognizer.onspeechstart = function() {
            transcription.textContent = "";
            var d = new Date();
            startTime = d.getTime();
        };
        recognizer.onspeechend = function() {
            var d = new Date();
            endTime = d.getTime();
        };
        // Listen for errors
        recognizer.onerror = function(event) {
            haveRecoResult = false;
            events.innerHTML = events.innerHTML + String.fromCharCode(13) + 'Recognition error: ' + event.error;
            turnOffRecognition();
        };
    }
}

function turnOffRecognition() {
    recognizer.stop();
    document.getElementById("mic").style.display = "none";
    events.innerHTML = events.innerHTML + String.fromCharCode(13) + 'Recognition stopped';
}

function turnOnRecognition() {
    try {
        if(document.getElementById("setLanguage") !== null){
            recognizer.lang = setLanguage.value;
        }
        recognizer.start();
        document.getElementById("mic").style.display = "inline";
        events.innerHTML = events.innerHTML + String.fromCharCode(13) + 'Recognition started';
    } catch (ex) {
        events.innerHTML = events.innerHTML + String.fromCharCode(13) + 'Recognition error: ' + event.error;
    }
}



