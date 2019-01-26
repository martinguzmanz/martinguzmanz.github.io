/* CAMBIO EN ESTA VERSION. SE PASAS DE un ARREGLO DE ARISTAS A OBJETOS PUROS.

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
        for (i=0 ; i<vertice[verticeName].aristas.length; i++) {
            if (vertice[verticeName].aristas[i].siguiente_Vertice == target) {
                return vertice[verticeName].aristas[i].tipoCambio;
            }
        }        
    };
/* remover para probar en Stand Alone junto con una función main. TEST GRAPHO.
    vertice.mxn =
      { 
        verticeName : "mxn", // vertice mxn, dos aristas
        aristas:[
            { siguiente_Vertice : "tusd" , 
              tipoCambio : 1/21, //ask OJO existe tusd_mxn. deveria ser 1/ask?
              unidades: "tusd/mxn"
                },
            { siguiente_Vertice : "btc" , 
              tipoCambio : 1/72832.49 , //ask
              unidades: "btc/mxn"
            },
            { siguiente_Vertice : "eth" , 
              tipoCambio : 1/2605.97, //ask
              unidades: "eth/mxn"
            },
          ] ,
      };
/*
    vertice.btc =     
      {
        verticeName : "btc", // vertice btc, dos aristas
        aristas:[
            { siguiente_Vertice : "tusd" , 
              tipoCambio : 20/72257.13, //ask
              unidades: "btc/tusd"
            },
            { siguiente_Vertice : "mxn" , 
              tipoCambio : 1/72257.13 , //ask
              unidades: "btc/mxn"
            }, 
            { siguiente_Vertice : "btc" , 
              tipoCambio : 1/72257.13 , //ask
              unidades: "eth/btc"
            } 
          ]
       };
    vertice.tusd =       
       {
        verticeName : "tusd", 
        aristas:[
            { siguiente_Vertice : "btc" , 
              tipoCambio : 1/200, //ask
              unidades: "tusd/btc"
            },
            { siguiente_Vertice : "mxn" , 
              tipoCambio : 1/19.8 , //ask
              unidades: "tusd/mxn"
            },
            { siguiente_Vertice : "eth" , 
              tipoCambio : 20000 , //ask
              unidades: "otr/tusd"
            } 
          ]
       };   

    vertice.eth =
      { 
        verticeName : "eth", //
        aristas:[
            { siguiente_Vertice : "tusd" , 
              tipoCambio : 2608.51/20, //ask
              unidades: "tusd/eth"
            },
            { siguiente_Vertice : "btc" , 
              tipoCambio : 1/0.03532, //ask
              unidades: "eth/btc"
            },
            { siguiente_Vertice : "mxn" , 
              tipoCambio : 2608.51 , //ask
              unidades: "mxn/eth"
            } 
          ] ,
      };

*/
/*

function main()
{
    generaRutas( verticeInicial ,verticeFinal,"mxn" ); // genera rutas posibles en rutas
    evaluaRutas();
    console.log(rutas);
    
}
*/

function generaRutas (from, verticeFinal, ruta) {
//    console.log( para );
    if (para > 0) {para--} else {console.log("termina a fuerza=",para); return;}
    
    //console.log("entrando a generar rutas from:",from,"to ",verticeFinal, "ruta actual", ruta,"\n ", vertice);

    var numAristasdelVertice = vertice[from].aristas.length;
    
    for (var j=0;  j< numAristasdelVertice ; j++) {
            var siguiente = vertice[from].aristas[j].siguiente_Vertice;
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
var x;
var peso=1;
    for (x in rutas) {
        peso = pesoRuta(rutas[x]);
        rutasPonderadas[x] = peso;
        //console.log ( "ruta:", x, "peso= ", rutasPonderadas[x] );
        if (peso < 1.0) {
            var hr = new Date();
            $("ol").prepend("<li>"," Date ", hr.toLocaleString(),", Ruta= " ,rutas[x], " , valor= ",rutasPonderadas[x], "</li>");
            console.log("ARBITRAJE RUTA , ", rutas[x], ", Date ,", hr.toLocaleString() , " , valor ,",rutasPonderadas[x]);
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
