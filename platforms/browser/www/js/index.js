/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

 //onload listo
function ready(){
  titulo("AJEDREZ");
  disponible();
}
function partida(){
    titulo("A JUGAR");
}
function inicio(){
    titulo("AJEDREZ");
    login();
}
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


//pantalla disponible
function disponible(){
  $("#token_place").text(localStorage.token);
  $("#menu1").click(function(){
    $.ajax({
      type: 'GET',
      url: 'https://young-inlet-29774.herokuapp.com/api/disponible/'+localStorage.token,

      success: function(result) {
        $("#listado").empty();
        for (var i = 0; i < result.length; i++) {
            $("#header ul").append('<li class="listados" role="presentation"><button class="posibles" role="menuitem" tabindex="-1" value="'+result[i]+'">'+result[i]+'</button></li>');
        }
        if ($('.listados').length == 0){
            $("#header ul").append('<li class="listados" role="presentation">NADIE</li>');
        }

        $(".posibles").click(function(event) {
            var fired_button = event.target.value;
            alert(fired_button);
        });
      },

      error: function() {
        alert("Algo falló.");
      }
    });

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

//iniciar partida
function jugar(){
    alert($(this).val());
}

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

 