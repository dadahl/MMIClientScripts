/*Copyright (C) 2013 Deborah A. Dahl
 * MIT License
 */
var xmlHttp;
var timeout = 2000;
var t;
var counter = 0;
var maxTries = 6;
var gotResults = false;
var cloud = true;
//var localURL = "/ct.naturallanguage/rest/processmessage";
var localURL = "/proloquia-nlservice.rhcloud/rest/processmessage";
var cloudURL = "/rest/processmessage";
var inputNBest;

function checkServer() {
    if (document.location.hostname === "localhost") {
        cloud = false;
    }
}

/*Communicate with server-based MC using Ajax with polling*/
function getXmlHttpRequest() {
    try
    {
        // Firefox, Opera 8.0+, Safari
        xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = receiveResponse;
    }
    catch (e)
    {
        // Internet Explorer, IE does not seem to work
        try
        {
            return new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e)
        {
            try
            {
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e)
            {
                alert("Your browser does not support AJAX!");
                return null;
            }
        }
    }
}

function receiveResponse() {
    if (xmlHttp.readyState === 4) {
        if (xmlHttp.status === 200) {
            stringResult = xmlHttp.responseText;
            // five cases, empty, failure, StartResponse, PrepareResponse, or DoneNotification
            //stop polling after DoneNotification
            if (stringResult !== "") {
                var eventName = parseMMIEvent(stringResult);
                var d = new Date();
                document.getElementById("events").innerHTML += "Received " + d + " " + eventName + counter + String.fromCharCode(13);
                if (incomingStatus === "failure") {
                    document.getElementById("output").innerHTML = "failure: " + incomingStatusInfo;
                    clearTimeout(t); //stop polling
                }
                else if (eventName === "mmi:StartResponse") {
                    var textArea = document.getElementById('events');
                    textArea.scrollTop = textArea.scrollHeight;
                    addMessageGet();
                    t = setTimeout(addMessageGet, timeout); //send another message to poll for DoneNotification
                }
                else if (eventName === "mmi:PrepareResponse") {
                    var textArea = document.getElementById('events');
                    textArea.scrollTop = textArea.scrollHeight;
                    addMessageGet();
                    t = setTimeout(addMessageGet, timeout); //send another message to poll for DoneNotification
                }
                else if (eventName === "mmi:DoneNotification") {
                    //process the message, display the results
                    if (showXMLResult) {
                        var textArea = document.getElementById('events');
                        textArea.scrollTop = textArea.scrollHeight;
                        xmlWindow = window.open("", "", "width=450,height=550");

                        var prettifiedXML = vkbeautify.xml(stringResult, 3);
                        var escapedResult = escapeXML(prettifiedXML);
                        var finalPretty = vkbeautify.xml(escapedResult);
                        xmlWindow.document.write(finalPretty);
                    }
                    if (application === "customClassification") {
                        enableSendRequest();
                    }
                    var toDisplay = "";
                    toDisplay = displayResults();
                    document.getElementById("output").innerHTML = toDisplay;
                    clearTimeout(t); //stop polling
                }
            }
            else { //nothing, no response from the server yet
                document.getElementById("output").innerHTML += " nothing yet " + counter + String.fromCharCode(13);
                if (counter < maxTries) {
                    counter++;
                    t = setTimeout(addMessageGet, timeout); //send another message to poll for DoneNotification
                }
                else {
                    alert("No response from the server after " + counter + " tries, please submit your request again.");
                    counter = 0;
                    clearTimeout(t); //stop polling
                }
            }
        }
    }
}

function addMessageGet()
//polling message
{
    getXmlHttpRequest();
    if (cloud === false) {
        xmlHttp.open("GET", localURL + "?requestID=" + requestID, true);
    }
    else {
        xmlHttp.open("GET", cloudURL + "?requestID=" + requestID, true); //amazon
    }
    xmlHttp.setRequestHeader("Content-Type", "text/xml");
    xmlHttp.send();
}

function addMessagePost()
//send actual data to the server
{
    counter = 0;
    currentEmma = null; //remove previous EMMA
    document.getElementById("output").innerHTML = "";
    getXmlHttpRequest();
    input = document.analyzePost.messageTextPost.value;
    if (input === "") {
        document.getElementById("events").innerHTML += String.fromCharCode(13) + "nothing to analyze";
    }
    else {
        var mmiEvent = createEvent("StartRequest", input, application);
        //log sending of event
        var d = new Date();
        document.getElementById("events").innerHTML += "Sent " + d + " " + "StartRequest" + counter + String.fromCharCode(13);
        var textArea = document.getElementById('events');
        textArea.scrollTop = textArea.scrollHeight;
        if (cloud === false) {
            xmlHttp.open("POST", localURL, true);
        }
        else {
            xmlHttp.open("POST", cloudURL, true); //cloud server
        }
        xmlHttp.setRequestHeader("Content-Type", "text/xml");
        xmlHttp.send(mmiEvent);
    }
}

function addMessagePostAudioControl(input)
//send actual data to the server
{
    counter = 0;
    currentEmma = null; //remove previous EMMA
    getXmlHttpRequest();
    var mmiEvent = createEvent("StartRequest", input, application);
    if (cloud === false) {
        xmlHttp.open("POST", localURL, true);
    }
    else {
        xmlHttp.open("POST", cloudURL, true); //cloud server
    }
    xmlHttp.setRequestHeader("Content-Type", "text/xml");
    xmlHttp.send(mmiEvent);

}

function sendTrainingDataToServer() {
    counter = 0;
    getXmlHttpRequest();
    input = document.getElementById("trainingData").value;
    var mmiEvent = createEvent("PrepareRequest", input, "trainingData");
    //log sending of event
    var d = new Date();
    document.getElementById("events").innerHTML += "Sent " + d + " " + "PrepareRequest" + counter + String.fromCharCode(13);
    var textArea = document.getElementById('events');
    textArea.scrollTop = textArea.scrollHeight;
    if (cloud === false) {
        xmlHttp.open("POST", localURL, true);
    }
    else {
        xmlHttp.open("POST", cloudURL, true); //cloud server
    }
    xmlHttp.setRequestHeader("Content-Type", "text/xml");
    xmlHttp.send(mmiEvent);
}

function posTag()
{
    counter = 0;
    document.getElementById("output").innerHTML = "";
    getXmlHttpRequest();
    input = document.analyzePost.tagText.value;
    var mmiEvent = createEvent("StartRequest", input, "partOfSpeechTag");
    //log sending of event
    var d = new Date();
    document.getElementById("events").innerHTML += "Sent " + d + " " + "StartRequest" + counter + String.fromCharCode(13);
    var textArea = document.getElementById('events');
    textArea.scrollTop = textArea.scrollHeight;
    if (cloud === false) {
        xmlHttp.open("POST", localURL, true);
    }
    else {
        xmlHttp.open("POST", cloudURL, true); //amazon
    }
    xmlHttp.setRequestHeader("Content-Type", "text/xml");
    xmlHttp.send(mmiEvent);
}

function sendClearContext() //clearContext when leaving the page
{
    counter = 0;
    document.getElementById("output").innerHTML = "";
    getXmlHttpRequest();
    input = document.analyzePost.messageTextPost.value;
    var mmiEvent = createEvent("ClearContextRequest", input, application);
    //log sending of event
    var d = new Date();
    document.getElementById("events").innerHTML += "Sent " + d + " " + "ClearContextRequest" + counter + String.fromCharCode(13);
    var textArea = document.getElementById('events');
    textArea.scrollTop = textArea.scrollHeight;
    if (cloud === false) {
        xmlHttp.open("POST", localURL, true);
    }
    else {
        xmlHttp.open("POST", cloudURL, true); //amazon
    }
    xmlHttp.setRequestHeader("Content-Type", "text/xml");
    xmlHttp.send(mmiEvent);
}
function understand()
{
    counter = 0;
    document.getElementById("output").innerHTML = "";
    getXmlHttpRequest();
    input = document.analyzePost.tagText.value;
    var mmiEvent = createEvent("StartRequest", input, "understanding");
    //log sending of event
    var d = new Date();
    document.getElementById("events").innerHTML += "Sent " + d + " " + "StartRequest" + counter + String.fromCharCode(13);
    var textArea = document.getElementById('events');
    textArea.scrollTop = textArea.scrollHeight;
    if (cloud === false) {
        xmlHttp.open("POST", localURL, true);
    }
    else {
        xmlHttp.open("POST", cloudURL, true); //cloud
    }
    xmlHttp.setRequestHeader("Content-Type", "text/xml");
    xmlHttp.send(mmiEvent);
}

