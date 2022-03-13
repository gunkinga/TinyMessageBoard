/*
*全局变量
*获得侦听时间中的元素
*/
var ELEMENT_VALUE = undefined;
//初始化操作
function iniAllText(){
    getDataFromDBAll().then((list)=>{
        if(list.length > 0){
            list.sort((a,b)=>{
                const timeA = Date.parse(a.time);
                const timeB = Date.parse(b.time);
                
                if(timeA < timeB){
                    return -1;
                }
                if(timeA > timeB){
                    return 1;
                }
                return 0;
            })
            for(let i = 0;i < list.length;i++){
                addLiElement(list[i].title,i);
            }
        }
    });
}
function setEventToLi(elementName){
    document.getElementById(elementName).addEventListener('click',displayText);
}
//操作database的基本功能
function openDB(dbName, version = 1){
    return new Promise((resolve,reject) =>{
        if(!window.indexedDB){
            console.log("Your browser doesn\'t support IndexedDB");
            return;
        };

        let db;
        const request = indexedDB.open(dbName,version);

        request.onerror = (event) =>{
            console.error("Database open error:",event.target.errorCode);
        };

        request.onsuccess = (event) =>{
            console.log("Database open success");
            db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) =>{
            console.log("Database updata");
            db = event.target.result;
            var objStore = db.createObjectStore('article',{keyPath: 'articleID'});
            objStore.createIndex('articleID','articleID',{unique: true});
            objStore.createIndex('title','title',{unique: true});
            objStore.createIndex('time','time',{unique: false});
            objStore.createIndex('text','text',{unique: false});
        };

    });
}

function addData(db,storeName,data){
    let request = db.transaction([storeName],'readwrite').objectStore(storeName).add(data);

    request.onsuccess = (event) =>{
        console.log("data write success");
    };
    request.onerror = (event) =>{
        alert("titel repeat");
    };
}

function getDataByKey(db,storeName,key){
    return new Promise((resolve,reject) =>{
        let request = db.transaction([storeName],'readwrite').objectStore(storeName).get(key);
    
        request.onerror = (event) =>{
            console.log("get data by key error");
        };
    
        request.onsuccess = (event) =>{
            //console.log("find data:",event.target.result);
            resolve(event.target.result);
        };
    });

}

function getDataByIndex(db,storeName,indexKey,indexValue){
    return new Promise((resolve,reject) =>{
        let request = db.transaction([storeName],'readwrite').objectStore(storeName).index(indexKey).get(indexValue);

        request.onerror = (event) =>{
            console.log('get data by index error');
        }
    
        request.onsuccess = (event) =>{
            //console.log("find data:",event.target.result);
            resolve(event.target.result);
        }
    });
}

function getAllDataByCursor(db,storeName){
    return new Promise((resolve,reject) =>{
        let request = db.transaction([storeName],'readwrite').objectStore(storeName).openCursor();
        let list = [];
        request.onerror = (event) =>{
            console.log("open cursor error");
        };
    
        request.onsuccess = (event) =>{
            let cursor = event.target.result;
            if(cursor){
                //console.log("database value:",cursor.value);
                list.push(cursor.value);
                cursor.continue();
            }else{
                resolve(list);
            }
        };
    }); 
}

function updataData(db,storeName,data){
    let request = db.transaction([storeName],'readwrite').objectStore(storeName).put(data);

    request.onerror = (event) =>{
        console.log("updata error");
    };
    request.onsuccess =(event) =>{
        console.log("updata success");
    };
}

function deleteData(db,storeName,key){
    let request = db.transaction([storeName],'readwrite').objectStore(storeName).delete(key);

    request.onerror = (event) =>{
        console.log("delete data error");
    };

    request.onsuccess = (event) =>{
        console.log("delete data success");
    };

}

function closeDB(db,storeName){
    db.transaction([storeName],'readwrite').oncomplete = () =>{
        db.close();
        console.log("database close...");
    }
    
}

function dataStyle(title,text){
    return {
        title: title,
        articleID: Math.floor(Math.random() * 500),
        time: Date(),
        text: text
    };
}

//封装上面的函数 方便使用
function addDataToDb(data){
    openDB('UTM').then(
        (db) =>{
            addData(db,'article',data);       
            closeDB(db,'article');
        }
    );
}

function updataDataToDb(text){
    openDB('UTM').then(
        (db) =>{
            getDataByIndex(db,'article','title',ELEMENT_VALUE.innerHTML).then((value) =>{
                let data = {
                    title:ELEMENT_VALUE.innerHTML,
                    time:value.time,
                    articleID:value.articleID,
                    text:text
                };
                updataData(db,'article',data);
                ELEMENT_VALUE = undefined;
                displayAllText();
                closeDB(db,'article');
            });
        }
    );
    
}

function delDataOfDb(){ 
    openDB('UTM').then(
        (db) =>{
            getDataFromDbByIndex('title',ELEMENT_VALUE.innerHTML).then((value) =>{
                deleteData(db,'article',value.articleID);
                displayAllText();       
                closeDB(db,'article');
            });
        }
    );
}

function getDataFromDbByKey(key){
    return new Promise((resolve,reject) =>{
        openDB('UTM').then(
            (db) =>{
                getDataByKey(db,'article',key).then(
                    (value) =>{
                        console.log(value);
                        resolve(value);
                        closeDB(db,'article');
                });      
            });
    });
}

function getDataFromDbByIndex(indexName,indexValue){
    return new Promise((resolve,reject) =>{
        openDB('UTM').then(
            (db) =>{
                getDataByIndex(db,'article',indexName,indexValue).then(
                    (value) =>{
                        //console.log(value);
                        resolve(value);
                        closeDB(db,'article');
                });      
            });
    });
}

function getDataFromDBAll(){
    return new Promise((resolve,reject) =>{
        openDB('UTM').then(
            (db) =>{
                getAllDataByCursor(db,'article').then(
                    (value) =>{
                        console.log(value);
                        resolve(value);
                        closeDB(db,'article');
                });      
            });
    });
}

//元素操作
function addLiElement(title,number){
    let ul = document.getElementById("list");
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(title));
    li.setAttribute("id", String('element' + number)); // added line
    ul.appendChild(li);
    setEventToLi(String('element' + number));
}
function removeAllLiElement(){
    let count = document.getElementById('list').childElementCount;
    if(count > 0){
        for(let i = 0;i < count;i++){
            document.getElementById(String('element' + i)).remove();
        }
    }
}
function getTextBoxStatus(){
    let element = document.getElementById('text-box'),
        style = window.getComputedStyle(element),
        display = style.getPropertyValue('display');

    return display;
}

//点击事件
function displayAllText(){
    removeAllLiElement();
    iniAllText();
    document.getElementById('text-box').style.setProperty('display','none');
    document.getElementById('list').style.setProperty('display','block');
    ELEMENT_VALUE = undefined;
}

function createNewText(){
    document.getElementById('text-box').style.setProperty('display','block');
    document.getElementById('list').style.setProperty('display','none');
    document.getElementById('text-box').value = '';
    ELEMENT_VALUE = undefined;
}

function saveText(){
    let element = document.getElementById('text-box');
    let display = getTextBoxStatus();
    if(display === 'none'){
        alert("you dont have open a article");
    }else{
        if(ELEMENT_VALUE == undefined){
            let title = prompt("please enter your title of article");
            if(title != null && title != ''){
                let data = dataStyle(title,element.value);
                    addDataToDb(data);
                    displayAllText();
                    console.log("data saveed....")
            }else if(title === ''){
                alert("sorry please enter your title of article");
            }
        }else{
            updataDataToDb(element.value);
        }

    }
}

function deleteText(){
    let display = getTextBoxStatus();

    if(display === 'none'){
        alert("please first open text");
        return;
    }

    if(confirm("are sure delete text?") == true){
        delDataOfDb();
    }else{

    }
}

function displayText(){
    //console.log(this.innerHTML);
    ELEMENT_VALUE = this;
    getDataFromDbByIndex('title',ELEMENT_VALUE.innerHTML).then((value) =>{
        let element = document.getElementById('text-box');
        element.style.setProperty('display','block');
        document.getElementById('list').style.setProperty('display','none');
        element.value = value.text;
        console.log(value);
    });
}


iniAllText();
