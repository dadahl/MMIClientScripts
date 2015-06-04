/*Copyright (C) 2015 Deborah A. Dahl, MIT license
 */
var currentEmotion;

//extract the emotion component from an emma result
function getEmotion(){
    currentEmotion = currentEmma.getElementsByTagName("emotion"); 
}