/* CAMBIO EN ESTA VERSION. 

*/


'use strict';
    var rutas = new Object();
    var rutasPonderadas = new Object();
    var verticeInicial = "mxn";
    var verticeFinal = "mxn";
    var para=100;
    var vertice = new Object(); 

    vertice.getTC = function (verticeName, target){
        var i;
                return vertice[verticeName][target].tipoCambio;
    };


function generaRutas (from, verticeFinal, ruta) {
//    console.log( para );
    if (para > 0) {para--} else {console.log("termina a fuerza=",para); return;}
    
//    console.log("entrando a generar rutas from:",from,"to ",verticeFinal, "ruta actual", ruta,"\n ", vertice);
    
    for ( var siguiente in vertice[from]) {
            if (ruta.indexOf(siguiente) > 0)  { // el destino se repite en la ruta 
                //console.log( siguiente , "ya explorado en ruta=",ruta 
                //            ,"stop: " , para);
            } else {
                if (siguiente == verticeFinal) {
                       rutas[ruta+"-"+siguiente]= {
                           ruta                     : ruta+"-"+siguiente ,
                           globalTC                 : 1 ,
                           amountToInvestInTarget   : 0
                                                  };     
                       para = 100;
                       // console.log("this is a good route ",rutas[ruta]);
                } else {
                    //console.log(" siguiente ruta a evaluar",ruta);
                    generaRutas ( siguiente, verticeFinal, ruta+"-" + siguiente );
                }
            }
    }
    //console.log("termine de iniciar evaluacion de las aristas:",
    //            numAristasdelVertice ,"from", from, "TO: ",verticeFinal, rutas );
}


function evaluaRutas(){
var x;
var peso=1;
var investAmount= 10000;
var investReturn=0;
var hr = new Date();

    for (x in rutas) {
        rutas[x]["globalTC"] =1;
        var rutaStr =rutas[x].ruta;
        peso = pesoRuta(rutaStr);
        rutasPonderadas[x] = peso; //posiblemente ya no se necesite?

//        investReturn= montoXRuta( x, rutaStr , investAmount );
                
        if (peso > 1.0) {
            investReturn= montoXRuta( x, rutaStr , investAmount );
            beep();
            var myvar4 = setTimeout(beep(),1000);
            var myvar3 = setTimeout(beep(),1000);
        }
    }
}

function pesoRuta( rutaStr ){
    //console.log("ruta:>", rutaStr );
    var pos = rutaStr.indexOf("-");
    var first = rutaStr.substr(0, pos);
    var tail = rutaStr.slice(pos+1);
    pos = tail.indexOf("-");
    if (pos<0) {
        //console.log("ultimo: tail=", tail,"first:", first,
        //vertice.getTC(first,tail))
        return vertice.getTC(first,tail);
    } else {
        var next = tail.substr(0,pos);
        //console.log("tipo cambio: ", vertice.getTC(first,next) );
        return vertice.getTC(first,next)*pesoRuta(tail);
    }
}


function montoXRuta( fullRuta, rutaStr , amountToInvest ){
    console.log("monto ruta:>", rutaStr );
    
    var pos = rutaStr.indexOf("-");
    var from = rutaStr.substr(0, pos);
    var tail = rutaStr.slice(pos+1);
        pos = tail.indexOf("-");
    to = tail;
    if (pos>0) { var to = tail.substr(0, pos);}
    
    if ( amountToInvest > vertice[from][to].maxAmountToPay ) { // maxAmountToPay denominacion de origen
        amountToInvest = vertice[from][to].maxAmountToPay;
    }
 
    rutas[fullRuta].amountToInvestInTarget = amountToInvest;
    rutas[fullRuta].globalTC  = rutas[fullRuta].globalTC * vertice[from][to].tipoCambio; // para paso a primera moneda
    
    var amountToGet    = amountToInvest * vertice[from][to].tipoCambio;
    
    console.log("from=",from,"to ", to, " a invertir=",amountToInvest, " para obtener ", amountToGet, " ", to, 
                "tc global hasta pesos =",  rutas[fullRuta].globalTC );
    
    if (tail.indexOf("-")<0) {
        console.log("ultimo: invest", amountToGet / rutas[fullRuta].globalTC  ,"get:", amountToGet );
        if (rutas[fullRuta].globalTC>1) {
            var hr = new Date();
            $("ol").prepend("<li>","Date: ", hr.toLocaleString() ,
                            ", Ruta= " ,fullRuta, 
                            ", Invierte= ",amountToGet / rutas[fullRuta].globalTC,
                            ", Obtiene = ",amountToGet,
                            "</li>");
        }

        return amountToGet;
    } else {
        var tmp= montoXRuta(fullRuta ,tail, amountToGet );
    }
}
