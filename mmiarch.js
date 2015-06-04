/*Copyright (C) 2015 Deborah A. Dahl, MIT license
 */
var contextIDPrefix = "nlClient"; //use a prefix of your choice here for the contextID
var contextIDNumber = 0;
var contextID;
var source = "ctNLClient"; //this should be an identifier for the client
var target = "ctNLServer"; //this should be an identifier for a server-based Modality Component
var requestIDPrefix = "requestID";
var requestIDNumber = 0;
var requestID;
var mmiNamespace = "http://www.w3.org/2008/04/mmi-arch";
var incomingSource;
var incomingTarget;
var incomingRequestID;
var incomingContextID;
var incomingStatus;
var incomingStatusInfo;
var outGoingDataNode;
var outGoingEventDoc;
var currentEmma;
var witAccessToken = "Bearer <your token>";

//MMIEvent object
function createEvent(name, input, functionName) {
    if (document.implementation.createDocument &&
            document.implementation.createDocumentType)
    {
        outGoingEventDoc = document.implementation.createDocument(mmiNamespace, "mmi:mmi", null);
        var mmiNode = outGoingEventDoc.createElementNS(mmiNamespace, "mmi:mmi");
        mmiNode.setAttribute("version", "1.0");
        var eventNode = outGoingEventDoc.createElementNS(mmiNamespace, "mmi:" + name);
        buildBasicFields(eventNode);
        //add other fields as needed for the event
        //this client only implements the Interaction Manager, so it only needs to generate the IM events
        switch (name) {
            case "StartRequest":
                //functionNode isn't part of the standard, but useful in sending events to 
                //MC's that can perform multiple functions. 
                //It can be included under the "Data" element
                var functionNode = outGoingEventDoc.createElement("function");
                var functionNameNode = outGoingEventDoc.createTextNode(functionName);
                functionNode.appendChild(functionNameNode);
                outGoingDataNode = outGoingEventDoc.createElementNS(mmiNamespace, "mmi:Data");
                outGoingDataNode.appendChild(functionNode);
                if (application === "customUnderstanding") { //todo, move to app.js
                    var idNode = outGoingEventDoc.createElement("witAccessToken");
                    var elementExists = document.getElementById("textID");
                    var idValueNode;
                    if (typeof (elementExists) !== 'undefined' && elementExists !== null) {
                        var idValue = document.getElementById("textID").value;
                        var idValueText = idValue.valueOf();
                        idValueNode = outGoingEventDoc.createTextNode(idValueText);
                    }
                    else {
                        idValueNode = outGoingEventDoc.createTextNode(witAccessToken);   
                    }
                    idNode.appendChild(idValueNode);
                    outGoingDataNode.appendChild(idNode);
                }
                eventNode.appendChild(outGoingDataNode);
                //the emmaNode isn't part of the standard for StartRequest, 
                //but is application-specific for this application
                var emmaNode;
                if (document.getElementById("selectLanguage") !== null) {
                    emmaNode = wrapEmma(input, selectLanguage.value);
                }
                else {
                    emmaNode = wrapEmma(input, "en-US");
                }
                outGoingDataNode.appendChild(emmaNode);
                break;
            case "PrepareRequest":
                var functionNode = outGoingEventDoc.createElement("function");
                var functionNameNode = outGoingEventDoc.createTextNode(functionName);
                functionNode.appendChild(functionNameNode);
                outGoingDataNode = outGoingEventDoc.createElementNS(mmiNamespace, "mmi:Data");
                // for PrepareRequest, information for preparing can be added here, for example, training data, or a link to training data
                var dataContentsNode = outGoingEventDoc.createElement("dataContents");
                var dataContents = outGoingEventDoc.createTextNode(input);
                dataContentsNode.appendChild(dataContents);
                outGoingDataNode.appendChild(functionNode);
                outGoingDataNode.appendChild(dataContentsNode);
                eventNode.appendChild(outGoingDataNode);
                break;
                // add any application-specific data to events here as needed
            case "PauseRequest":
                //normally just the basic fields are needed
                break;
            case "ResumeRequest":
                //normally just the basic fields are needed
                break;
            case "ExtensionNotification":
                break;
            case "CancelRequest":
                //normally just the basic fields are needed
                break;
            case "StatusRequest":
                //normally just the basic fields are needed
                break;
            case "ClearContextRequest":
                //different functions can have different requirements for clearing contexts
                var functionNode = outGoingEventDoc.createElement("function");
                var functionNameNode = outGoingEventDoc.createTextNode(functionName);
                functionNode.appendChild(functionNameNode);
                outGoingDataNode = outGoingEventDoc.createElementNS(mmiNamespace, "mmi:Data");
                // for PrepareRequest, information for preparing can be added here, for example, training data, or a link to training data
                //var dataContentsNode = outGoingEventDoc.createElement("dataContents");
                // var dataContents = outGoingEventDoc.createTextNode(input);
                // dataContentsNode.appendChild(dataContents);
                outGoingDataNode.appendChild(functionNode);
                //  outGoingDataNode.appendChild(dataContentsNode);
                eventNode.appendChild(outGoingDataNode);
                break;
        }
        var serializer = new XMLSerializer();
        return (serializer.serializeToString(eventNode));
    }
}

function createData(name, value) {
    var dataTagNode = outGoingEventDoc.createElement(name);
    var nameNode = outGoingEventDoc.createTextNode(value);
    dataTagNode.appendChild(nameNode);
    return dataTagNode;
}

function buildBasicFields(eventNode) {
    var requestID = generateNewRequestID();
    eventNode.setAttribute("mmi:Context", contextID);
    eventNode.setAttribute("mmi:RequestID", requestID);
    eventNode.setAttribute("mmi:Source", source);
    eventNode.setAttribute("mmi:Target", target);
}

function generateNewContextID() {
    var randomNumber = Math.floor(Math.random() * 1001);
    contextID = contextIDPrefix + contextIDNumber + randomNumber;
    contextIDNumber++;
    return contextID;
}

function generateNewRequestID() {
    var randomNumber = Math.floor(Math.random() * 1001);
    requestID = requestIDPrefix + requestIDNumber + randomNumber;
    requestIDNumber++;
    return requestID;
}

//handle an incoming MMI event from the MC
function parseMMIEvent(input) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(input, "text/xml");
    var documentElement = xmlDoc.documentElement;
    var children = documentElement.childNodes;
    var eventNode = children.item(0);
    eventName = eventNode.nodeName;
    incomingContextID = eventNode.getAttribute("mmi:Context");
    incomingSource = eventNode.getAttribute("mmi:Source");
    incomingTarget = eventNode.getAttribute("mmi:Target");
    incomingRequestID = eventNode.getAttribute("mmi:RequestID");
    incomingStatus = eventNode.getAttribute("mmi:Status");
    if (incomingStatus === "failure") {
        //get error message if any
        eventChildren = eventNode.getElementsByTagName("mmi:StatusInfo");
        if (eventChildren !== null) {
            test = eventChildren.item(0);
            incomingStatusInfo = eventChildren.item(0).getTextContent;
        }
    }
    //do any application-specific processing for incoming events, for example, pull out EMMA
    switch (eventName) {
        case "mmi:StartResponse":
            break;
        case "mmi:PauseResponse":
            break;
        case "mmi:CancelResponse":
            break;
        case "mmi:ResumeResponse":
            break;
        case "mmi:ClearContextResponse":
            break;
        case "mmi:StatusResponse":
            break;
        case "mmi:PauseResponse":
            break;
        case "mmi:ExtensionNotification":
            break;
        case "mmi:DoneNotification":
            //get  full EMMA if any
            getEmma(documentElement);
            break;
    }
    return eventName;
}

//get an EMMA document from an incoming MMI Architecture event
function getEmma(documentElement) {
    currentEmma = null;
    var emma;
    emma = documentElement.getElementsByTagName("emma:emma");
    if (emma.length === 0) {
        emma = documentElement.getElementsByTagName("emma");
    }
    if (emma.length !== 0) {
        currentEmma = emma[0];
    }
}

//utility for displaying XML
function escapeXML(string) {
    var start = "<pre>";
    var end = "</pre";
    var escaped =
            string.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    return start + escaped + end;
}
