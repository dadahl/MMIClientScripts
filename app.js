/*Copyright (C) 2013 Deborah A. Dahl
 MIT license
 */

/*
 * This file contains application-specific functions
 */

function displayResults() {
    if (currentEmma !== null) {
        return displayEmmaResults();
    }
    else
        return "";
}

function displayEmmaResults() {
    var interpretations = getEmmaInterpretations();
    var tokens = getEmmaTokens();
    var output = "";
    if (application === "emotionClassification") {
        for (var i = 0; i < interpretations.length; i++) {
            var emotion = interpretations[i].getElementsByTagName("emotion");
            if (emotion.length > 0) {
                var emotionCategory = emotion[0].getElementsByTagName("category");
                outputName = emotionCategory[0].getAttribute("name");
                outputConfidence = emotionCategory[0].getAttribute("confidence");
                output = output + outputName + " " + outputConfidence + String.fromCharCode(13);
                if (i === 0) {
                    displayCategory(outputName);
                }
            }
        }
        if (output.length === 0) {
            output = "I can't find an emotion for  " + "\"" + tokens + "\"";
        }
    }
    else if (application === "customClassification") {
        for (var i = 0; i < interpretations.length; i++) {
            var classificationCategory = interpretations[i].getElementsByTagName("category");
            if (classificationCategory.length > 0) { //otherwise not a category node
                var textNode = classificationCategory[0];
                var outputNode = textNode.childNodes[0];
                var outputName = outputNode.nodeValue;
                var outputConfidence = interpretations[i].getAttribute("emma:confidence");
                output = output + outputName + " " + outputConfidence + String.fromCharCode(13);
            }
        }
        if (output.length === 0) {
            output = "I can't classify  " + "\"" + tokens + "\"";
        }
    }
    else if (application === "partOfSpeechTag") {
        output = output + "Tagged Words" + String.fromCharCode(13);
        var tagNode = interpretations[0];
        var tags = tagNode.getElementsByTagName("partOfSpeechTags");
        for (var i = 0; i < tags.length; i++) {
            var taggedTokens = tags[i].getElementsByTagName("token");
            for (var j = 0; j < taggedTokens.length; j++) {
                var tokenNode = taggedTokens[j];
                var tokenWord = tokenNode.firstChild.nodeValue;
                var posTag = tokenNode.getAttribute("tag");
                output = output + tokenWord + " " + posTag + String.fromCharCode(13);
            }
        }
        if (output.length === 0) {
            output = "I can't find part of speech tags for  " + "\"" + tokens + "\"";
        }
    }
    else if (application === "understanding" || application === "customUnderstanding") { //"intent" and "entities" are specific to the wit.ai format
        var intents = getApplicationSemanticsTagValues("intent");
        var heading = intents[0].textContent;
        var entities = getApplicationSemanticsTagValues("entities");
        var nameValues = "";
        for (var i = 0; i < entities.length; i++) {
            var children = entities[i].childNodes;
            for (var j = 0; j < children.length; j++) {
                var name = children[j].nodeName;
                var value = getApplicationSemanticsTagChildValue(children[j], "value");
                nameValues = nameValues + String.fromCharCode(13) + name + ": " + value;
            }
        }
        output = heading + String.fromCharCode(13) + nameValues;
        //also display in the separate shopping list window
        if (application === "understanding") {
            shoppingListWindowOutput = nameValues + "<br/>";
            shoppingListWindow.document.write(shoppingListWindowOutput);
        }
        if (output.length === 0) {
            output = "I can't understand " + "\"" + tokens + "\"";
        }
    }
    else if (application === "lightControl") { //"intent" and "entities" are specific to the wit.ai format
        var intents = getApplicationSemanticsTagValues("intent");
        var heading = intents[0].textContent;
        var entities = getApplicationSemanticsTagValues("entities");
        var nameValues = "";
        for (var i = 0; i < entities.length; i++) {
            var children = entities[i].childNodes;
            for (var j = 0; j < children.length; j++) {
                var name = children[j].nodeName;
                var value = getApplicationSemanticsTagChildValue(children[j], "value");
                nameValues = nameValues + String.fromCharCode(13) + name + ": " + value;
            }
        }
        output = heading + String.fromCharCode(13) + nameValues;
        //also display in the separate shopping list window
        if (output.length === 0) {
            output = "I can't understand " + "\"" + tokens + "\"";
        }
        //change the light
        controlLight(intents[0].getTextContent, entities);
    }
    else if (application === "audioBooks") { //"intent" and "entities" are specific to the wit.ai format
        var intents = getApplicationSemanticsTagValues("intent");
        var heading = intents[0].textContent;
        var entities = getApplicationSemanticsTagValues("entities");
        var nameValues = "";
        for (var i = 0; i < entities.length; i++) {
            var children = entities[i].childNodes;
            for (var j = 0; j < children.length; j++) {
                var name = children[j].nodeName;
                var value = getApplicationSemanticsTagChildValue(children[j], "value");
                nameValues = nameValues + String.fromCharCode(13) + name + ": " + value;
            }
        }
        output = heading + String.fromCharCode(13) + nameValues;
        //also display in the separate shopping list window
        if (output.length === 0) {
            output = "I can't understand " + "\"" + tokens + "\"";
        }
        //control the audio
        manageAudio(heading, entities);
    }
    if (application === "speechDemo") {
        output = "Results and confidence" + String.fromCharCode(13);
        for (var i = 0; i < interpretations.length; i++) {
            var result = interpretations[i].getAttribute("emma:tokens");
            var confidence = interpretations[i].getAttribute("emma:confidence");
            var numberOfNbest = i+1;
            output = output + numberOfNbest + ".  " + result + " " + confidence + String.fromCharCode(13);
        }
        if (output.length === 0) {
            output = "No results";
        }
    }
    return output;
}

function setID() {
    //set wit Access Token
}

function displayCategory(category) {
    var imageElement = document.getElementById("feedback");
    var imageDirectory = "images/";
    switch (category)
    {
        case "angry":
            imageElement.src = imageDirectory + "angry.jpg";
            break;
        case "afraid":
            imageElement.src = imageDirectory + "afraid.jpg";
            break;
        case "happy":
            imageElement.src = imageDirectory + "happy.jpg";
            break;
        case "sad":
            imageElement.src = imageDirectory + "sad.jpg";
            break;
        case "amused":
            imageElement.src = imageDirectory + "amused.jpg";
            break;
        case "bored":
            imageElement.src = imageDirectory + "bored.jpg";
            break;
        case "confident":
            imageElement.src = imageDirectory + "confident.jpg";
            break;
        case "excited":
            imageElement.src = imageDirectory + "excited.jpg";
            break;
        case "interested":
            imageElement.src = imageDirectory + "interested.jpg";
            break;
        case "loving":
            imageElement.src = imageDirectory + "loving.jpg";
            break;
        case "affectionate":
            imageElement.src = imageDirectory + "loving.jpg";
            break;
        case "worried":
            imageElement.src = imageDirectory + "worried.jpg";
            break;
        case "relaxed":
            imageElement.src = imageDirectory + "relaxed.jpg";
            break;
        case "disgusted":
            imageElement.src = imageDirectory + "disgusted.jpg";
            break;
        default:
            imageElement.alt = "I don't have a picture for " + category;
    }
}

function openShoppingListWindow() {
    shoppingListWindow = window.open("", "", "width=250,height=300,menubar=yes");
    shoppingListWindow.document.write("<h2>Shopping List</h2>");

}