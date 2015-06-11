var haveRecoResult = false;
var currentConfidence = 1;
var startTime;
var endTime;
var recognizer;
var speechEngineName = "Web Speech API";
var finalTranscript = '';
var finalTranscriptList;
var numNBest = 0;
var language = "en-US";
var maxNbest = 1;


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
        recognizer.onresult = function (event) {
            var interim_transcript = '';
            final_span.innerHTML = '';
            final_transcript = '';
            var speechResults = event.results[0];
            numNBest = speechResults.length;
            if (speechResults.isFinal) {
                if (numNBest > 1) {
                    finalTranscriptList = speechResults;
                }
                finalTranscript = speechResults[0].transcript;
                transcription.value = finalTranscript;
                haveRecoResult = true;
                currentConfidence = speechResults[0].confidence;
                if (numNBest === 1) {
                    emmaNode = wrapEmma(finalTranscript, language);
                }
                else {
                    emmaNode = wrapEmmaList(finalTranscriptList, language);
                }
                haveRecoResult = false;
                turnOffRecognition();
                emmaString = getStringEmma(emmaNode);
                currentEmma = emmaNode;
                if (showXMLResult) {
                    showEmma(emmaString);
                }
                var toDisplay = "";
                toDisplay = displayResults();
                document.getElementById("output").innerHTML = toDisplay;
                final_span.innerHTML = final_transcript;
            }
            interim_transcript = speechResults[0].transcript;
            interim_span.innerHTML = interim_transcript;
        }
        ;
        recognizer.onspeechstart = function () {
            transcription.textContent = "";
            var d = new Date();
            startTime = d.getTime();
        };
        recognizer.onspeechend = function () {
            var d = new Date();
            endTime = d.getTime();
        };
        // Listen for errors
        recognizer.onerror = function (event) {
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
        if (document.getElementById("selectLanguage") !== null) {
            recognizer.lang = selectLanguage.value;
            language = recognizer.lang;
        }
        maxNbest = document.getElementById("maxNbest");
        recognizer.maxAlternatives = maxNbest.value;
        recognizer.start();
        document.getElementById("mic").style.display = "inline";
        events.innerHTML = events.innerHTML + String.fromCharCode(13) + 'Recognition started';
    } catch (ex) {
        events.innerHTML = events.innerHTML + String.fromCharCode(13) + 'Recognition error: ' + event.error;
    }
}
function showEmma(emma) {
    xmlWindow = window.open("", "", "width=450,height=550");
    xmlWindow.document.write(emma);
}



