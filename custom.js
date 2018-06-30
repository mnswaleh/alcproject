/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//check for service worker support then register
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js').then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

let u_input = document.querySelector("#num");
let u_answer = document.querySelector("#ans");
let u_to = document.querySelector("#to");
let u_from = document.querySelector("#from");
let ans_unit = document.querySelector("#ans_u");
let selects = document.querySelectorAll(".units");

let db_req;

//database open request
let DBOpenRequest = window.indexedDB.open("alc_db", 1);
DBOpenRequest.onerror = function (event) {
    console.log('db_opening_error');
};

//upgrade database
DBOpenRequest.onupgradeneeded = function (event) {
    console.log("upgrading...");
    let db = event.target.result;
    db.onerror = function (event) {
        console.log('updrade_error');
    };


    let os = db.createObjectStore("conversions", {keyPath: 'unit_name'});
    os.createIndex("unit_value", "unit_value", {unique: false});
    let transaction = event.target.transaction;


    let newItem = [{unit_name: "USD_USD", unit_value: "1"},
        {unit_name: "USD_YEN", unit_value: "110.74"},
        {unit_name: "USD_KSH", unit_value: "101.01"},
        {unit_name: "YEN_USD", unit_value: "0.009"},
        {unit_name: "YEN_YEN", unit_value: "1"},
        {unit_name: "YEN_KSH", unit_value: "0.91"},
        {unit_name: "KSH_USD", unit_value: "0.0099"},
        {unit_name: "KSH_YEN", unit_value: "1.099"},
        {unit_name: "KSH_KSH", unit_value: "1"}];
    let objectStore = transaction.objectStore("conversions");

    function additions(element, index, array) {
        let objectStoreRequest = objectStore.add(element);
    }
    newItem.forEach(additions);
    transaction.oncomplete =
            function (event) {
                console.log('upgrade transaction successful');
            };
};


DBOpenRequest.onsuccess = function (event) {
    db_req = DBOpenRequest.result;
    console.log('request success');
};

//retrieve data from database
function get_value(units) {
    let convert_value;

    let transaction = db_req.transaction(["conversions"], "readonly");
    let objectStore = transaction.objectStore("conversions");
    let objectStoreRequest = objectStore.get(units);
    objectStoreRequest.onsuccess = function (event) {
        convert_value = objectStoreRequest.result.unit_value;
        convert_currency(u_input.value, convert_value);
    };
    objectStoreRequest.onerror = function (event) {
        console.log('could not get value');
    };
}

//convert the input to approptiate currency
function convert_currency(inputVal, convertVal) {
    let answer = inputVal * convertVal;
    u_answer.innerHTML = answer;
    ans_unit.innerHTML = u_to.value;
}

function perform_task(){
    let unitValue = u_from.value + '_' + u_to.value;
    get_value(unitValue);
}

convert_currency(1, 1);

u_input.addEventListener('keyup', (e) => {
    perform_task();
});

selects.forEach(function (){
    this.addEventListener('change', (e) => {
    perform_task();
});
});



