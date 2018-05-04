//onload listo
function ready(){
  titulo("AJEDREZ");
  disponible();
}
function partida(){
  window.setInterval(function(){
    recTablero();
  }, 2000);
}
function inicio(){
  titulo("AJEDREZ");
  login();
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
                contentType: 'text/plain',

                xhrFields: {
                  withCredentials: false
                },

                success: function(result) {
                    var resultado = JSON.parse(result);
                    if (resultado.status == "wrong") {
                        alert(resultado.msg);
                    }else{
                        localStorage.setItem("token", resultado.token);
                        localStorage.setItem("idUsuario", resultado.idUsuario);
                        window.location.replace("disponible.html");
                    }
                },

                error: function() {
                    alert("Algo falló.");
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
        window.location.replace("index.html");
      },

      error: function() {
        alert("No puedes cerrar sesión en éste momento.");
      }
    });
}

//copiar token
function copiar() {
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
      },

      error: function() {
        alert("Algo falló.");
      }
    });

  });

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
          jugarYa();
        });
      },

      error: function() {
        alert("Algo falló.");
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
        alert("Algo falló.");
      }
    });
}

//funcion que redirige a partida
function jugarYa(){
    window.location.replace("partida.html");
}

//recargar tablero
function recTablero(){
    $.ajax({
      type: 'GET',
      url: 'https://young-inlet-29774.herokuapp.com/api/fixa/'+localStorage.idPartida,

      success: function(result) {
        crearTablero(result);
        turno();
      },

      error: function() {
        alert("Algo falló al pedir las fichas.");
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
        $("#blancas").show();
      }else{
        $("#blancas").hide();
        $("#negras").show();
      }
    },

    error: function() {
      alert("Algo falló con los turnos.");
    }
  });
}

//tablero
function crearTablero(result){
    var fichas = {};
    for (var i = 0; i < result.length; i += 4) {
        fichas[result[i]] = [result[i+1],result[i+2],result[i+3]];
    }
  $(".tablero" ).empty();
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
  for(var i = 1; i < 9; i++){
      var tr = document.createElement('tr');
      var trr = function(){
        $(this).css({
          'height' : '70px'
        });
      }
      trr.call( tr );
      for(var j = 1; j < 9; j++){
        var td = document.createElement('td');
        if(i%2 == j%2){
          var marronFlojo = function(){
            $(this).css('background-color', '#c9a060').addClass("rounded").attr("value", ""+i+j);
            if ($(this).attr('value') in fichas){
              if (fichas[$(this).attr('value')][0] == "img/b4.png" || fichas[$(this).attr('value')][0] == "img/b6.png"){
                var img = "<img id='"+fichas[$(this).attr('value')][1]+"' class='hvr-buzz-out blancas' src='"+fichas[$(this).attr('value')][0]+"' width='100%' height='80%' border='2' display='block' onclick='guardarFicha(event)' />";
              } else {
                var img = "<img id='"+fichas[$(this).attr('value')][1]+"' class='hvr-buzz-out negras' src='"+fichas[$(this).attr('value')][0]+"' width='100%' height='80%' border='2' display='block' onclick='guardarFicha(event)' />";
              }
              if (true) {
                $(this).prop('onclick',null).off('click');
              }
              
            }else{
              $(this).attr("onclick", "moverFicha(event)");
              var img = "<img src='img/oscuro.jpg' width='1px' height='1px' border='2' display='block' alt=''/>";
            }
            if (localStorage.idUsuario != fichas[$(this).attr('value')][2]) {
              alert("ls.idusuario (id usuario logado): "+localStorage.idUsuario+"\nid usuario que le toca: "+fichas[$(this).attr('value')][2]);
            }

            $(this).append(img);
          }
          marronFlojo.call( td );
        }else{
          var marronFuerte = function(){
            $(this).css('background-color', '#f9dcae').addClass("rounded").attr("value", ""+i+j);
            if ($(this).attr('value') in fichas){
              if (fichas[$(this).attr('value')][0] == "img/b4.png" || fichas[$(this).attr('value')][0] == "img/b6.png"){
                var img = "<img id='"+fichas[$(this).attr('value')][1]+"' class='hvr-buzz-out blancas' src='"+fichas[$(this).attr('value')][0]+"' width='100%' height='80%' border='2' display='block' onclick='guardarFicha(event)' />";
              } else {
                var img = "<img id='"+fichas[$(this).attr('value')][1]+"' class='hvr-buzz-out negras' src='"+fichas[$(this).attr('value')][0]+"' width='100%' height='80%' border='2' display='block' onclick='guardarFicha(event)' />";
              }
            }else{
              $(this).attr("onclick", "moverFicha(event)");
              var img = "<img src='img/claro.jpg' width='1px' height='1px' border='2' display='block' alt=''/>";
            }
            $(this).append(img);
          }
          marronFuerte.call( td );
        }
        tr.appendChild(td);
      }
      table.appendChild(tr);
  }
  $(".tablero").append(table);
}

//guardo la ficha seleccionada si es tu turno
function guardarFicha(event){
  $.ajax({
    type: 'GET',
    url: 'https://young-inlet-29774.herokuapp.com/api/turno/'+localStorage.token+'/'+localStorage.idPartida,

    success: function(result) {
      result = JSON.parse(result);
      if (event.target.classList.contains(result.turno)) {
        localStorage.setItem("idFicha", event.target.getAttribute("id"));
      }else{
        alert("No te toca");
      }
    },

    error: function() {
      alert("Algo falló, lo arreglaremos con la mayor brevedad posible.");
      localStorage.removeItem("idFicha");
    }
  });

}

//intento hacer el movimiento indicado
function moverFicha(event){
  if (!(localStorage.getItem("idFicha") === null)) {
    $.ajax({
      type: 'GET',
      url: 'https://young-inlet-29774.herokuapp.com/api/mover/'+localStorage.token+'/'+localStorage.idFicha+'/'+event.target.getAttribute("value"),

      success: function(result) {
        result = JSON.parse(result);
        if (result.status == "ok") {
          recTablero();
        }else{
          alert("ERROR: "+result.msg);
        }
        localStorage.removeItem("idFicha");
      },

      error: function() {
        alert("Algo falló, lo arreglaremos con la mayor brevedad posible.");
        localStorage.removeItem("idFicha");
      }
    });
  }
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