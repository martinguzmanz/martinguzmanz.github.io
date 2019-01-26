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
                       rutas[ruta+"-"+siguiente]= ruta+"-"+siguiente;     
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
var max = 1;
var x;
var peso=1;
    for (x in rutas) {
        peso = pesoRuta(rutas[x]);
        rutasPonderadas[x] = peso;
        //console.log ( "ruta:", x, "peso= ", rutasPonderadas[x] );
        
        if (max>0) {
            var g_amount= 1000;
            var g_tc=1;
            console.log( "invest , get", montoXRuta( rutas[x] , g_amount ));
            max--;
        }
        
        if (peso > 1.0) {
            var hr = new Date();
            $("ol").prepend("<li>"," Date ", hr.toLocaleString(),
                            ", Ruta= " ,rutas[x], 
                            ", valor= ",rutasPonderadas[x], "</li>");
            console.log("ARBITRAJE RUTA , ", rutas[x], ", Date ,", 
                hr.toLocaleString() , " , valor ,",rutasPonderadas[x]);
            console.log( "invest , get", montoXRuta( rutas[x] , 10000 ));
            beep();
            var myvar4 = setTimeout(beep(),1000);
            var myvar3 = setTimeout(beep(),1000);
        }
    }
}

function pesoRuta( ruta ){
//    console.log("ruta:>", ruta );
    var pos = ruta.indexOf("-");
    var first = ruta.substr(0, pos);
    var tail = ruta.slice(pos+1);
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


function montoXRuta( ruta , amountToInvest ){
    console.log("ruta:>", ruta );
    
    var pos = ruta.indexOf("-");
    var from = ruta.substr(0, pos);
    var tail = ruta.slice(pos+1);
        pos = tail.indexOf("-");
    to = tail;
    if (pos>0) { var to = tail.substr(0, pos);}    

    
    if ( amountToInvest > vertice[from][to].maxAmountToPay ) {
        amountToInvest = vertice[from][to].maxAmountToPay;
    }

    g_amount = amountToInvest*g_tc;
    g_tc = g_tc * vertice[from][to].tipoCambio;
    
    var amountToGet    = amountToInvest * vertice[from][to].tipoCambio;
        
    console.log("from=",from,"to=", to, " a invertir=",amountToInvest, " para obtener ", amountToGet, " ", to, "Tipo de cambio global hasta pesos", g_tc  );
    
    if (tail.indexOf("-")<0) {
        console.log("ultimo: invest", amountToInvest ,"get:", amountToGet);
        return [ amountToInvest , amountToGet ];
    } else {
        var next = tail.substr(0,pos);
        //console.log("tipo cambio: ", vertice.getTC(first,next) );
        montoXRuta(tail, amountToGet );
    }
}
