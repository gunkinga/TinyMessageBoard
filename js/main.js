"use strict";

function disPlayTextBox(){
    document.getElementById("text-box").style.setProperty("display","block");
}

function getTextOfBox(){
    const element = document.getElementById("text-box");
    const cssObj = window.getComputedStyle(element,null);
    let testDisplay = cssObj.getPropertyValue("display");

    if(testDisplay === "none")
    {
        window.alert("error none text");
        return -1;
    }
    let textValue = Date() + " " + String(element.value);
    window.alert("保存成功");
    document.getElementById("text-box").style.setProperty("display","none");
}

function seveText(text){
    
}

