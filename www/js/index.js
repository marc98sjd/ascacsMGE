/*

    Nombre fichero: index.js
    Creador: Marc Guerra
    Fecha creación: 10/04/2018
    Funcionalidad: Controlar todas las funcionalidades hechas en JS/JQUERY. 
      Controlar parte de la lógica del ajedrez, redireccionar, crear el tablero, peticiones al servidor,etc.

*/

//onload index.html listo
function inicio(){
  titulo("AJEDREZ");
  login();
}
//onload disponible.html listo
function ready(){
  titulo("AJEDREZ");
  disponible();
}
//onload partida.html listo
function partida(){
  window.setInterval(function(){
    recTablero();
  }, 2000);
  menuPartida();
}

//llamada ajax login
function login(){
  $(document).ready(function(){
    $("#login").click(function(){
      var correo = $("#userName").val();
      var contra = $("#userPassword").val();
      $.ajax({
        type: 'GET',
        url: 'https://young-inlet-29774.herokuapp.com/api/login/'+correo+'/'+contra,

        success: function(result) {
          var resultado = JSON.parse(result);
          if (resultado.status == "wrong") {
            alert(resultado.msg);
          }else{
            localStorage.setItem("token", resultado.token);
            localStorage.setItem("idUsuario", resultado.idUsuario);
            localStorage.setItem("yo", resultado.nombreUsuario);
            window.location.replace("disponible.html");
          }
        }
      });
    });
  }); 
}

//logout
function logout(){
  $.ajax({
    type: 'GET',
    url: 'https://young-inlet-29774.herokuapp.com/api/logout/'+localStorage.token,

    success: function() {
      localStorage.removeItem("token");
      localStorage.removeItem("idPartida");
      localStorage.removeItem("user2");
      localStorage.removeItem("idUsuario");
      localStorage.removeItem("yo");
      window.location.replace("index.html");
    },

    error: function() {
      alert("No puedes cerrar sesión en éste momento.");
    }
  });
}

//copiar token
function copiarToken() {
  var token = $("#token_place").text();
  var tempInput = document.createElement("input");
  tempInput.style = "position: absolute; left: -1000px; top: -1000px";
  tempInput.value = token;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
}

//pantalla disponible
function disponible(){
  $("#token_place").text(localStorage.token);
  cargarUsuarios();
  cargarPartidas();
}

//cargo los usuarios disponibles para jugar
function cargarUsuarios() {
  $("#menuUser").click(function(){
    $.ajax({
      type: 'GET',
      url: 'https://young-inlet-29774.herokuapp.com/api/disponible/'+localStorage.token,

      success: function(result) {
        $("#listado").empty();
        for (var i = 0; i < result.length; i++) {
            $("#header ul").append('<li class="listados" role="presentation"><a class="posibles" role="menuitem" tabindex="-1" onclick="jugar()">'+result[i]+'</a></li>');
        }
        if ($('.listados').length == 0){
            $("#header ul").append('<li class="listados" role="presentation">NADIE</li>');
        }

        $(".posibles").click(function(event){
            localStorage.setItem("user2", event.target.innerHTML);
        });
      }
    });
  });
}

//cargo las partidas disponibles para jugar
function cargarPartidas() {
  $("#menuPartida").click(function(){
    $.ajax({
      type: 'GET',
      url: 'https://young-inlet-29774.herokuapp.com/api/partidas/'+localStorage.token,

      success: function(result) {
        $("#listar").empty();
        if (result != "") {
          for (var i = 0; i < result.length; i += 2) {
              $("#header2 ul").append('<li class="lista2" role="presentation"><a class="posible2" value="'+result[i]+'" role="menuitem" tabindex="-1">'+result[i+1]+'</a></li>');
          }          
        }else{
          $("#header2 ul").append('<li class="lista2" role="presentation">SIN PARTIDA</li>');
        }

        $(".posible2").click(function(event){
          localStorage.setItem("idPartida", event.target.getAttribute("value"));
          localStorage.setItem("user2", event.target.innerHTML);
          jugarYa();
        });
      }
    });
  });
}

//iniciar partida en la bd
function jugar(){
    $.ajax({
      type: 'GET',
      url: 'https://young-inlet-29774.herokuapp.com/api/jugar/'+localStorage.user2+'/'+localStorage.token,

      success: function(result) {
        result = JSON.parse(result);
        if (result.status == "ok") {
          localStorage.setItem("idPartida", result.idPartida);
          jugarYa();
        }else{
          alert("ERROR: "+result.msg);
        }
      },

      error: function() {
        alert("No se puede crear la partida en éste momento.");
      }
    });
}

//funcion que redirige a partida
function jugarYa(){
    window.location.replace("partida.html");
}

//funcion que carga los datos del menu
function menuPartida() {
  $(".card-title").append("BIENVENIDO "+localStorage.yo);
  $(".btn-info").text(""+localStorage.user2);
}

//recargar tablero
function recTablero(){
    $.ajax({
      type: 'GET',
      url: 'https://young-inlet-29774.herokuapp.com/api/fixa/'+localStorage.idPartida,

      success: function(result) {
        crearTablero(result);
        turno();
      }
    });
}

//cambiar turno
function turno(){
  $.ajax({
    type: 'GET',
    url: 'https://young-inlet-29774.herokuapp.com/api/turno/'+localStorage.token+'/'+localStorage.idPartida,

    success: function(result) {
      result = JSON.parse(result);
      if (result.turno == "blancas") {
        $("#negras").hide();
        $("#blancas").html(result.jugador).show();
      }else{
        $("#blancas").hide();
        $("#negras").html(result.jugador).show();
      }
    }
  });
}

//tablero
function crearTablero(result){
  var fichas = diccionarioFichas(result);

  comprobarFinal(fichas);

  $(".tablero" ).empty();
  var table = tableTag();
  for(var i = 1; i < 9; i++){
      var tr = document.createElement('tr');
      for(var j = 1; j < 9; j++){
        var td = document.createElement('td');
        if(i%2 == j%2){
          td = celdasFuertes(td,fichas,i,j);
        }else{
          td = celdasFlojas(td,fichas,i,j);
        }
        tr.appendChild(td);
      }
      table.appendChild(tr);
  }
  $(".tablero").append(table);
}

//creo el diccionario de fichas
function diccionarioFichas(result) {
  var fichas = {};
  for (var i = 0; i < result.length; i += 4) {
    fichas[result[i]] = [result[i+1],result[i+2],result[i+3]];
  }
  return fichas;
}
//creo el tag table
function tableTag() {
  var table = document.createElement("table");
  var tabla = function(){
    $(this).css({
      'border-style' : 'solid',
      'border-width' : '20px',
      'border-color' : '#6d502c',
      'box-shadow' : '10px 10px 8px 10px #888888',
       'margin' : '0 auto'
    });
  }
  tabla.call( table );
  return table;
}

//creo celdas color fuerte
function celdasFuertes(td,fichas,i,j) {
  var marronFuerte = function(){
    $(this).css({'background-color':'#c9a060', 'height':'80px', 'width':'80px'}).addClass("rounded").attr("value", ""+i+j);
    var key = $(this).attr('value');
    if (key in fichas){
      if (fichas[key][0] == "img/b4.png" || fichas[key][0] == "img/b6.png"){
        if (localStorage.idUsuario != fichas[key][2]){
          var img = "<img id='"+fichas[key][1]+"' class='blancas unseen' src='"+fichas[key][0]+"' width='100%' height='80%' border='2' display='block'/>";
          $(this).attr("onclick", "moverFicha(event)");
        }else{
          var img = "<img id='"+fichas[key][1]+"' class='hvr-buzz-out blancas' src='"+fichas[key][0]+"' width='100%' height='80%' border='2' display='block' onclick='guardarFicha(event)' />";
        }
      }else{
        if (localStorage.idUsuario != fichas[key][2]){
          var img = "<img id='"+fichas[key][1]+"' class='negras unseen' src='"+fichas[key][0]+"' width='100%' height='80%' border='2' display='block'/>";
          $(this).attr("onclick", "moverFicha(event)");
        }else{
          var img = "<img id='"+fichas[key][1]+"' class='hvr-buzz-out negras' src='"+fichas[key][0]+"' width='100%' height='80%' border='2' display='block' onclick='guardarFicha(event)' />";
        }
      }
    }else{
      $(this).attr("onclick", "moverFicha(event)");
      var img = "<img src='img/oscuro.jpg' width='1px' height='1px' border='2' display='block' alt=''/>";
    }
    $(this).append(img);
  }
  marronFuerte.call( td );
  return td;
}

//creo celdas color flojo
function celdasFlojas(td,fichas,i,j) {
  var marronFlojo = function(){
    $(this).css({'background-color':'#f9dcae', 'height':'80px', 'width':'80px'}).addClass("rounded").attr("value", ""+i+j);
    var key = $(this).attr('value');
    if (key in fichas){
      if (fichas[key][0] == "img/b4.png" || fichas[key][0] == "img/b6.png"){
        if (localStorage.idUsuario != fichas[key][2]){
          var img = "<img id='"+fichas[key][1]+"' class='blancas unseen' src='"+fichas[key][0]+"' width='100%' height='80%' border='2' display='block'/>";
          $(this).attr("onclick", "moverFicha(event)");
        }else{
          var img = "<img id='"+fichas[key][1]+"' class='hvr-buzz-out blancas' src='"+fichas[key][0]+"' width='100%' height='80%' border='2' display='block' onclick='guardarFicha(event)' />";
        }
      } else {
        if (localStorage.idUsuario != fichas[key][2]){
          var img = "<img id='"+fichas[key][1]+"' class='negras unseen' src='"+fichas[key][0]+"' width='100%' height='80%' border='2' display='block'/>";
          $(this).attr("onclick", "moverFicha(event)");
        }else{
          var img = "<img id='"+fichas[key][1]+"' class='hvr-buzz-out negras' src='"+fichas[key][0]+"' width='100%' height='80%' border='2' display='block' onclick='guardarFicha(event)' />";
        }
      }
    }else{
      $(this).attr("onclick", "moverFicha(event)");
      var img = "<img src='img/claro.jpg' width='1px' height='1px' border='2' display='block' alt=''/>";
    }
    $(this).append(img);
  }
  marronFlojo.call( td );
  return td;
}

//guardo la ficha seleccionada si es tu turno
function guardarFicha(event){
  localStorage.removeItem("hayla");
  $.ajax({
    type: 'GET',
    url: 'https://young-inlet-29774.herokuapp.com/api/turno/'+localStorage.token+'/'+localStorage.idPartida,

    success: function(result) {
      result = JSON.parse(result);
      if (event.target.classList.contains(result.turno)) {
        localStorage.setItem("idFicha", event.target.getAttribute("id"));
        localStorage.setItem("placeFicha", event.target.parentNode.getAttribute("value"));
        localStorage.setItem("ruta", event.target.getAttribute("src"));
      }else{
        alert("No te toca");
      }
    },

    error: function() {
      localStorage.removeItem("idFicha");
      localStorage.removeItem("hayla");
    }
  });

}

//intento hacer el movimiento indicado
function moverFicha(event){
  if (!(localStorage.getItem("idFicha") === null)) {
    var actual = parseInt(localStorage.getItem("placeFicha"));
    var siguiente = parseInt(event.target.getAttribute("value"));
    var ruta = localStorage.getItem("ruta");
    localStorage.removeItem("hayla");
    if (event.target.firstChild.classList.contains('unseen')) {
      localStorage.setItem("hayla",ruta);
    }

    if (comprobarMovimiento(actual,siguiente,ruta)) {
      $.ajax({
        type: 'GET',
        url: 'https://young-inlet-29774.herokuapp.com/api/mover/'+localStorage.token+'/'+localStorage.idFicha+'/'+siguiente,

        success: function(result) {
          result = JSON.parse(result);
          if (result.status == "wrong") {
            alert("ERROR: "+result.msg);
          }
          localStorage.removeItem("idFicha");
          localStorage.removeItem("hayla");
        },

        error: function() {
          localStorage.removeItem("idFicha");
          localStorage.removeItem("hayla");
        }
      });
    } else {
      alert("No puedes hacer éste movimiento.");
    }
  }
}

//función que comprueba qué ficha se intenta mover
function comprobarMovimiento(actual,siguiente,ruta){
  if (ruta == "img/b4.png" || ruta == "img/n4.png") {
    return peon(actual,siguiente,ruta);
  } else if(ruta == "img/b6.png" || ruta == "img/n6.png") {
    return torre(actual,siguiente,ruta);
  }
}

//funcion que comprueba el movimiento del peon
function peon(actual,siguiente,ruta){
  if(ruta == "img/b4.png"){
    if(siguiente == actual + 10 && localStorage.getItem("hayla") === null){
      return true;
    }else if(localStorage.getItem("hayla") !== null) {
      if (siguiente == actual + 11 || siguiente == actual + 9) {
        $.ajax({
          type: 'GET',
          url: 'https://young-inlet-29774.herokuapp.com/api/matar/'+localStorage.token+'/'+siguiente
        });
        return true;
      }
    }
  }else{
    if(siguiente == actual - 10 && localStorage.getItem("hayla") === null){
      return true;
    }else if(localStorage.getItem("hayla") !== null) {
      if (siguiente == actual - 11 || siguiente == actual - 9) {
        $.ajax({
          type: 'GET',
          url: 'https://young-inlet-29774.herokuapp.com/api/matar/'+localStorage.token+'/'+siguiente
        });
        return true;
      }
    }
  }
  return false;
}

//funcion que comprueba el movimiento de la torre
function torre(actual,siguiente,ruta){
  var movimiento = "";
  for (var i = 10; i < 71; i+= 10) {
    if (siguiente == actual + i || siguiente == actual - i) {
      movimiento = "vertical";
      if (/*sinPiezaEnMedio(actual,siguiente,movimiento)*/true) {
        if (localStorage.getItem("hayla") !== null) {
          $.ajax({
            type: 'GET',
            url: 'https://young-inlet-29774.herokuapp.com/api/matar/'+localStorage.token+'/'+siguiente
          });
        }
        return true;
      }
    }
  }
  for (var j = 1; j < 8; j++) {
    if (enHorizontal(actual,siguiente)) {
      if (siguiente == actual + j || siguiente == actual - j) {
        movimiento = "horizontal";
        if (/*sinPiezaEnMedio(actual,siguiente,movimiento)*/true) {
          if (localStorage.getItem("hayla") !== null) {
            $.ajax({
              type: 'GET',
              url: 'https://young-inlet-29774.herokuapp.com/api/matar/'+localStorage.token+'/'+siguiente
            });
          }
          return true;
        }
      }
    }
  }
  return false;
}

//funcion que comprueba que el movimiento sea horizontal
function enHorizontal(n1, n2) {
  return Math.floor(n1 / 10) === Math.floor(n2 / 10);
}
//funcion que comprueba que no haya pieza en medio del movimimento
function sinPiezaEnMedio(actual,siguiente,movimimento) {
  $.ajax({
    type: 'GET',
    url: 'https://young-inlet-29774.herokuapp.com/api/enmedio/'+localStorage.token+'/'+actual+'/'+siguiente+'/'+movimimento+'/'+localStorage.idPartida,
    success: function(result) {
      result = JSON.parse(result);
      if (result.status == "wrong") {
        alert("ERROR: "+result.msg);
        localStorage.setItem("noPiezaMitad","error");
      }else if(result.status == "haberla"){
        localStorage.setItem("noPiezaMitad",false);
      }else if(result.status == "nohaberla"){
        localStorage.setItem("noPiezaMitad",true);
      }
      localStorage.removeItem("idFicha");
      localStorage.removeItem("hayla");
    }
  });
  alert("localStorage.nopiezamitad: "+localStorage.noPiezaMitad);
  if (localStorage.noPiezaMitad == "error" || localStorage.noPiezaMitad == "false") {
    return false;
  }else if(localStorage.noPiezaMitad == "true"){
    return true;
  }
}

//funcion que comprueba si se ha acabado la partida
function comprobarFinal(fichas) {
  if (Object.keys(fichas).length == 1) {
    $.ajax({
      type: 'GET',
      url: 'https://young-inlet-29774.herokuapp.com/api/final/'+localStorage.token+'/'+localStorage.idPartida
    });
    finalPartida("FINAL DE PARTIDA!");
  }
  var final = "nowhites";
  var rutaNegra = ["img/n6.png","img/n4.png"];
  var rutaBlanca = ["img/b6.png","img/b4.png"];
  for(var i in fichas){
    if (fichas[i][0] != rutaNegra[0] || fichas[i][0] != rutaNegra[1]){
      final = "BLANCAS";
      break;
    }
  }
  if (final == "BLANCAS") {
    for(var i in fichas){
      rutaNegra = rutaBlanca.indexOf(fichas[i][0]);
      if (rutaNegra == -1) {
        final = "black&white";
        break;
      }
    }
  }else{
    final == "NEGRAS";
  }
  if (final == "BLANCAS" || final == "NEGRAS") {
    $.ajax({
      type: 'GET',
      url: 'https://young-inlet-29774.herokuapp.com/api/final/'+localStorage.token+'/'+localStorage.idPartida
    });
    finalPartida("VICTORIA PARA "+final+"! FIN DEL JUEGO!");
  }
}
//funcion que acaba la partida
function finalPartida(text) {
  alert(text);
  window.location.replace("disponible.html");
}
//cordova
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();

//login/disponible effects
function titulo(palabra){
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var mask;

    var pointCount = 500;
    var str = palabra;
    var fontStr = "bold 128pt Helvetica Neue, Helvetica, Arial, sans-serif";

    ctx.font = fontStr;
    ctx.textAlign = "center";
    c.width = ctx.measureText(str).width;
    c.height = 128; // Set to font size

    var whitePixels = [];
    var points = [];
    var point = function(x,y,vx,vy){
      this.x = x;
      this.y = y;
      this.vx = vx || 1;
      this.vy = vy || 1;
    }
    point.prototype.update = function() {
      ctx.beginPath();
      ctx.fillStyle = "#95a5a6";
      ctx.arc(this.x,this.y,1,0,2*Math.PI);
      ctx.fill();
      ctx.closePath();
      
      // Change direction if running into black pixel
      if (this.x+this.vx >= c.width || this.x+this.vx < 0 || mask.data[coordsToI(this.x+this.vx, this.y, mask.width)] != 255) {
        this.vx *= -1;
        this.x += this.vx*2;
      }
      if (this.y+this.vy >= c.height || this.y+this.vy < 0 || mask.data[coordsToI(this.x, this.y+this.vy, mask.width)] != 255) {
        this.vy *= -1;
        this.y += this.vy*2;
      }
      
      for (var k = 0, m = points.length; k<m; k++) {
        if (points[k]===this) continue;
        
        var d = Math.sqrt(Math.pow(this.x-points[k].x,2)+Math.pow(this.y-points[k].y,2));
        if (d < 5) {
          ctx.lineWidth = .2;
          ctx.beginPath();
          ctx.moveTo(this.x,this.y);
          ctx.lineTo(points[k].x,points[k].y);
          ctx.stroke();
        }
        if (d < 20) {
          ctx.lineWidth = .1;
          ctx.beginPath();
          ctx.moveTo(this.x,this.y);
          ctx.lineTo(points[k].x,points[k].y);
          ctx.stroke();
        }
      }
      
      this.x += this.vx;
      this.y += this.vy;
    }

    function loop() {
      ctx.clearRect(0,0,c.width,c.height);
      for (var k = 0, m = points.length; k < m; k++) {
        points[k].update();
      }
    }

    function init() {
      // Draw text
      ctx.beginPath();
      ctx.fillStyle = "#000";
      ctx.rect(0,0,c.width,c.height);
      ctx.fill();
      ctx.font = fontStr;
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff";
      ctx.fillText(str,0,c.height/2+(c.height / 2));
      ctx.closePath();
      
      // Save mask
      mask = ctx.getImageData(0,0,c.width,c.height);
      
      // Draw background
      ctx.clearRect(0,0,c.width,c.height);
      
      // Save all white pixels in an array
      for (var i = 0; i < mask.data.length; i += 4) {
        if (mask.data[i] == 255 && mask.data[i+1] == 255 && mask.data[i+2] == 255 && mask.data[i+3] == 255) {
          whitePixels.push([iToX(i,mask.width),iToY(i,mask.width)]);
        }
      }
      
      for (var k = 0; k < pointCount; k++) {
        addPoint();
      }
    }

    function addPoint() {
      var spawn = whitePixels[Math.floor(Math.random()*whitePixels.length)];
      
      var p = new point(spawn[0],spawn[1], Math.floor(Math.random()*2-1), Math.floor(Math.random()*2-1));
      points.push(p);
    }

    function iToX(i,w) {
      return ((i%(4*w))/4);
    }
    function iToY(i,w) {
      return (Math.floor(i/(4*w)));
    }
    function coordsToI(x,y,w) {
      return ((mask.width*y)+x)*4;

    }

    setInterval(loop,50);
    init(); 
}