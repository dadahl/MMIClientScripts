/*Copyright (C) 2015 Deborah A. Dahl, MIT license
 */
var interpretationNum = 1;
var interpretationPrefix = "initial";
var emmaNamespace = "http://www.w3.org/2003/04/emma";

//create an EMMA document from text or speech input

function wrapEmma(message,language) {
    //wrap EMMA around text
    if (document.implementation.createDocument &&
            document.implementation.createDocumentType)
    {
        var emmaDoc = document.implementation.createDocument(emmaNamespace, "emma:emma", null);
        var emmaNode = emmaDoc.createElementNS(emmaNamespace, "emma:emma");
        emmaNode.setAttribute("version", "1.1");
        var interpretationNode = emmaDoc.createElementNS(emmaNamespace, "emma:interpretation");
        var idAttribute = getId();
        interpretationNode.setAttribute("id", idAttribute);
         interpretationNode.setAttribute("emma:function", application);
        if (haveRecoResult === false) {
            interpretationNode.setAttribute("emma:medium", "tactile");
            interpretationNode.setAttribute("emma:mode", "keys");
            interpretationNode.setAttribute("emma:verbal", "true");
            interpretationNode.setAttribute("emma:device-type", "keyboard");
            var d = new Date();
            var dateInMillis = d.getTime();
            interpretationNode.setAttribute("emma:end", dateInMillis);
            interpretationNode.setAttribute("emma:lang",language);
        }
        else{
            interpretationNode.setAttribute("emma:medium", "acoustic");
            interpretationNode.setAttribute("emma:mode", "voice");
            interpretationNode.setAttribute("emma:verbal", "true");
            interpretationNode.setAttribute("emma:device-type", "microphone");
            interpretationNode.setAttribute("emma:process",speechEngineName);
            interpretationNode.setAttribute("emma:confidence", currentConfidence);
            interpretationNode.setAttribute("emma:start",startTime);
            interpretationNode.setAttribute("emma:end",endTime);
            interpretationNode.setAttribute("emma:lang",language);
        }
        interpretationNode.setAttribute("emma:expressed-through", "language");
        emmaNode.appendChild(interpretationNode);
        var literalNode = emmaDoc.createElementNS(emmaNamespace, "emma:literal");
        interpretationNode.appendChild(literalNode);
        var messageNode = emmaDoc.createTextNode(message);
        literalNode.appendChild(messageNode);
        return (emmaNode);
    }
    else {
        alert("Your browser does not support this example");
    }
}

/*
 * Parsing returned EMMA
 Other functions could be added to get additional EMMA information
 */
function getId() {
    id = interpretationPrefix + interpretationNum;
    interpretationNum++;
    return id;
}

function getEmmaTokens() {
    var tokens = "";
    var oneOfs = currentEmma.getElementsByTagName("emma:one-of");
    var interpretations = getEmmaInterpretations(currentEmma);
    if (oneOfs.length === 0) {
        tokens = interpretations[0].getAttribute("emma:tokens");
    }
    else {
        tokens = oneOfs[0].getAttribute("emma:tokens");
    }
    return tokens;
}

function getEmmaInterpretations() {
    var childInterpretations = currentEmma.getElementsByTagName("emma:interpretation");
    if (childInterpretations.length === 0) {
        childInterpretations = currentEmma.getElementsByTagName("interpretation");
    }
    return childInterpretations;
}

function getApplicationSemanticsTagValues(tagName) {
    var emmaChildren = currentEmma.getElementsByTagName(tagName);
    return emmaChildren;
}

function getApplicationSemanticsTagChildValue(element, target) {
    var tagChildren = element.childNodes;
    var targetValue = "";
    var entities = tagChildren[0].getElementsByTagName(target);
    targetValue = entities[0].textContent;
    return targetValue;
}

