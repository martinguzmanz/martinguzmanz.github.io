/* BITSO API
Siguiendo el API General de Bitso: 
For successful API calls, our JSON response objects looks like:
{ "success": true, "payload": {RELEVANT_DATA_HERE} }
se crea un objeto con el payload de la llamada, el payload puede ser un objeto o bien un arreglo de objetos, dependiendo de la llamada.
//        var url =  "https://api.bitso.com/v3/order_book/?book=btc_mxn&aggregate=true"
//        var url =  "https://api.bitso.com/v3/available_books/"
//        var url =  "https://api.bitso.com/v3/ticker/?book=btc_mxn"
//        "https://api.bitso.com/v3/order_book/?book=btc_mxn"
//        var url = "https://api.bitso.com/v3/trades/?book=btc_mxn" 
//        var url =  "https://api.bitso.com/v3/trades/?book=btc_mxn"

*/
'use strict';
/*
    var vertice = new Object();
    vertice.getTC = function (verticeName, target){
        var i;
        for (i=0 ; i<vertice[verticeName].aristas.length; i++) {
            if (vertice[verticeName].aristas[i].siguiente_Vertice == target) {
                return vertice[verticeName].aristas[i].tipoCambio;
            }
        }
    }
*/
var orderPrefix="Order_";

var bITSOpayLoadsObj = new Object();
//    bITSOpayLoadsObj.books;   //existing exchange order books
//    bITSOpayLoadsObj.tickers; //trading information from the specified book    
//    bITSOpayLoadsObj.orders;  //list of all open orders in the specified book
//    bITSOpayLoadsObj.trades;  //list of recent trades from the specified book.

function loadUrl(method, url) {
    return new Promise (resolve => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange=function() {
            if (this.readyState == 4 && this.status == 200) { 
                resolve(this.responseText);
            }/*else{
                alert("espera");
            }*/
        };
        xhttp.open(method, url, true);
        xhttp.send();
    });
}


async function loadBITSOPayload( method, url, propertyName ) {
// de un url con el formato json de bitso obtiene su payload en un objeto JS
        var urlResponse = await loadUrl (method, url);
        var payLoadObj = extraePayload ( urlResponse );
        bITSOpayLoadsObj[propertyName] = payLoadObj;
//        console.log("Obteniendo para", propertyName,bITSOpayLoadsObj[propertyName]);     
}

function extraePayload ( cadena ) {
    var myObj = JSON.parse( cadena );
    var myProps = Object.keys(myObj);
    //    console.log(Object.keys(myObj)); 
    if (myProps[1] != "payload") {
        return window.alert("Datos erroneos");
    }
    if (myObj.success) {
        var myPayload = myObj.payload;
        return myPayload;
    } else { alert("Llamada sin éxito",myProps);
    } 
}

function creaAristas(){
    // vertice por vertice se busca en el libro de ordenes su $ y se crea la arista
    // con el precio ofertado (bid)
    //console.log("el objeto bITSOpayLoadsObj" , bITSOpayLoadsObj );
    //console.log("llaves bITSOpayLoadsObj", Object.keys( bITSOpayLoadsObj ) );
//    var keys = Object.keys( vertice ); // se borran los arreglos de vertice.
//    console.log("antes:", vertice, keys);
    for (var i in vertice ) { //borramos las aristas de la vuelta anterior.
        if (typeof vertice[i] != "function" && 
            typeof vertice[i].aristas == "object")  { 
            vertice[i].aristas.length=0;
        }
    }
    // console.log("Despues: de borrar aristas", vertice);
    var keys = Object.keys( bITSOpayLoadsObj );
    var i;
    for (i =0 ; i< keys.length ; i++ ) {
        //console.log("key",i, keys[i]);
        if (keys[i].indexOf(orderPrefix)==0) {
            var book = bITSOpayLoadsObj[keys[i]].asks[0].book;
            var pos = book.indexOf("_"); 
            if (pos<0) {alert("book_name esta mal")+book}
            var mayor = book.substr(0, pos);
            var minor = book.slice(pos+1);
            //console.log ("mayor ",mayor," minor", minor,);
            //verficar si ya existe el vertice.
            if (typeof vertice[mayor] == "undefined") { 
                vertice[mayor] = {};
                vertice[mayor].verticeName = mayor;
                vertice[mayor].aristas = [];
            } 
            vertice[mayor].aristas.push({ siguiente_Vertice : minor ,
                               tipoCambio : bITSOpayLoadsObj[keys[i]].asks[0].price ,
                               bidPrice : bITSOpayLoadsObj[keys[i]].bids[0].price ,
                               askPrice : bITSOpayLoadsObj[keys[i]].asks[0].price ,
                               amount : bITSOpayLoadsObj[keys[i]].asks[0].amount
                                         //evaluar mas si el amount es muy bajn...
                                         //Price per unit of major in Minor Units
                                         //amount en Major units
                                        });
            if (typeof vertice[minor] == "undefined") { //se crea minor si no existe
                vertice[minor] = {}; //
                vertice[minor].verticeName = minor;
                vertice[minor].aristas = [];
            }
            vertice[minor].aristas.push({ siguiente_Vertice : mayor ,
                               tipoCambio : 1/bITSOpayLoadsObj[keys[i]].bids[0].price , //?????
                               bidPrice : bITSOpayLoadsObj[keys[i]].bids[0].price ,
                               askPrice : bITSOpayLoadsObj[keys[i]].asks[0].price ,
                               amount : bITSOpayLoadsObj[keys[i]].asks[0].amount
                                          });
        }
    }
}

        
function searchBITSOForArbitrage() {
    var hr = new Date();
    console.log("Inicio:", hr);
    //obtiene todos books
    var url =  "https://api.bitso.com/v3/available_books/";
    loadBITSOPayload( method , url, "books")
     .then ( function (ahorasi) {
        //console.log("Obtuve books" ,typeof(bITSOpayLoadsObj.books), 
        //            Object.keys(bITSOpayLoadsObj) , bITSOpayLoadsObj );
        var completedOrders = 0;
        if (Array.isArray(bITSOpayLoadsObj.books)) {
            var numberOfbooks = bITSOpayLoadsObj.books.length;
            //console.log("A obtener las ordenes por cada book",numberOfbooks);
            for (var i = 0 ; i< numberOfbooks; i++) {
                var book_name = bITSOpayLoadsObj.books[i].book;
                url= "https://api.bitso.com/v3/order_book/?book=" +
                    book_name + "&aggregate=true";
                //console.log("Obteniendo ordenes del libro:", 
                //            book_name);
                book_name = orderPrefix + book_name;
                loadBITSOPayload( method , url, book_name )
                    .then( function() {
                        completedOrders=completedOrders+1;
                        //console.log("llevo",completedOrders,"Orders");
                        if (completedOrders == numberOfbooks ) {
                          //console.log("Termine de obtener orders bITSOpayLoadsObj" ,
                          //       bITSOpayLoadsObj , Object.keys(bITSOpayLoadsObj));
                            creaAristas();
                           //console.log(vertice);
                           //console.log("objetos en vertice", Object.keys(vertice) );
                            generaRutas( verticeInicial ,verticeFinal,"mxn" );
                            evaluaRutas();
                            console.log("TERMINE", hr);
                            console.log(bITSOpayLoadsObj,rutasPonderadas);
                        }
                    })
            }
        } else {
            alert("Solo un BooK o no book disponible, revisar");
            console.log("Solo un BooK o no book disponible, revisar");
            console.log(typeof(bITSOpayLoadsObj.books));
            console.log(bITSOpayLoadsObj.books);
            console.log("Solo un BooK o no book disponible, revisar");
        }
     });
}