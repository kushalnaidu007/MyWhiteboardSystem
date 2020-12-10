"use strict";
 
(function () {
  var socket = io();
  var canvas = document.getElementsByClassName("sketch")[0];
  var snapshotButton = document.getElementById("snapshotButton");
  var snapshotImageElement = document.getElementById("snapshotImageElement");
  var loop;

  
  // var colorErase = document.getElementsByClassName("btn");
  var context = canvas.getContext("2d");
  var dataUrl;
  var current = {
    color: "black"
  };
  var drawing = false;
  //save the whiteboard default state
  //context.save();
 
  canvas.addEventListener("mousedown", onMouseDown, false);
  canvas.addEventListener("mouseup", onMouseUp, false);
  canvas.addEventListener("mouseout", onMouseUp, false);
  canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);
 
  //Touch support for mobile devices
  canvas.addEventListener("touchstart", onMouseDown, false);
  canvas.addEventListener("touchend", onMouseUp, false);
  canvas.addEventListener("touchcancel", onMouseUp, false);
  canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);
 
 
 
  socket.on("drawing", onDrawingEvent);
 
  window.addEventListener("resize", onResize, false);
  onResize();
 
  snapshotButton.onclick = function (e) {
    
   socket=io();

    if (snapshotButton.value === "Take snapshot") {
      var user = prompt("Enter your name?");
      var snap = prompt("do you want a snapsopt, type YES or NO", "");
      var data = [{user,
        snap}];
    console.log("snap reply is", snap);
    snapfunc(data);
    function snapfunc(data1){
      var scores1 = data1.reduce((acc, cur) => {
        if (!acc[cur.snap]) {
          acc[cur.snap] = 1;
        } else {
          acc[cur.snap]++;
        }
        console.log(scores1);
        return acc;
        
        }, {});}
        
    var countsnap=0, countnosnap=0;

    if(snap == "yes")
    {
      countsnap++;
    }
    else if(snap=="no")
    {
      countnosnap++;
    }
    console.log(countsnap);
    console.log(countnosnap);

    var i=0;
    i= (countsnap/countnosnap+countsnap)*100;
    console.log(i);
    if(i>50)
    {
      dataUrl = canvas.toDataURL();
      clearInterval(loop);
      snapshotImageElement.src = dataUrl;
      snapshotImageElement.style.display = "inline";
      canvas.style.display = "none";
      snapshotButton.value = "Return to Canvas";
    }
    }else if(snapshotButton.value === "Return to Canvas" ){
        dataUrl = canvas.toDataURL();
        clearInterval(loop);
        snapshotImageElement.src = dataUrl;
        snapshotImageElement.style.display = "none";
        canvas.style.display = "inline";
        snapshotButton.value = "Take snapshot";
    }

    
    else {
      canvas.style.display = "inline";
      snapshotImageElement.style.display = "none";
      loop = setInterval(drawClock, 1000);
      snapshotButton.value = "Take snapshot";
    }
    if (!socket.emit) {
      return;
    }
    socket.emit("snap",i);
    console.log(i+ " will be the snap.");
  };
  
 
  // Initialization
 
  context.font = FONT_HEIGHT + "px Arial";
  loop = setInterval(drawClock, 1000);

 // window.onload(canvas.toDataURL());


  function drawLine(x0, y0, x1, y1, color, emit) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
    //CanvasRenderingContext2D.save();
    //context.restore();
 
    if (!emit) {
      return;
    }
    var w = canvas.width;
    var h = canvas.height;
 
    socket.emit("drawing", {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }
  //start position
  function onMouseDown(e) {
    drawing = true;
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
  }
  //finished position
  function onMouseUp(e) {
    if (!drawing) {
      return;
    }
    drawing = false;
    drawLine(
      current.x,
      current.y,
      e.clientX || e.touches[0].clientX,
      e.clientY || e.touches[0].clientY,
      current.color,
      true
    );
  }
 
  //draw event on the board
  function onMouseMove(e) {
    if (!drawing) {
      return;
    }
 
    drawLine(
      current.x,
      current.y,
      e.clientX || e.touches[0].clientX,
      e.clientY || e.touches[0].clientY,
      current.color,
      true
    );
    if (TogetherJS.running) {
      TogetherJS.send({
        type: "drawLine",
        x0: current.x,
        y0: current.y,
        x1: e.clientX || e.touches[0].clientX,
        y1: e.clientY || e.touches[0].clientY
      });
    }
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
  }
 
  

 
  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function () {
      var time = new Date().getTime();
 
      if (time - previousCall >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }
 
  function onDrawingEvent(data) {
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }
 
  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
 
  TogetherJS.hub.on("draw", function (msg) {
    if (!msg.sameUrl) {
      return;
    }
    draw(msg.start, msg.end, true);
  });
 
  TogetherJS.hub.on("togetherjs.hello", function (msg) {
    if (!msg.sameUrl) {
      return;
    }
    var image = canvas.toDataURL("image/png");
    TogetherJS.send({
      type: "init",
      image: image
    });
    TogetherJS.hub.on("init", function (msg) {
      if (!msg.sameUrl) {
        return;
      }
      var image = new Image();
      image.src = msg.image;
      context.drawImage(image, 0, 0);
    });
  });
})();

function myFunction() {

  //var voting=false;
  var socket = io();
  socket.on("election", onElectionEvent);
  onElectionEvent();

  function onElectionEvent(){

    
  var user = prompt("Enter your name?");
  var vote = prompt("Enter the user name to vote:", "");
  var data = [{user,
    vote}];
console.log("vote", data);
console.log(data);
electleader(data);

 }

 function electleader(data)
 {
var numberofvotes = data.reduce((acc, cur) => {
if (!acc[cur.vote]) {
  acc[cur.vote] = 1;
} else {
  acc[cur.vote]++;
}
return acc;
}, {});

console.log(numberofvotes);

var sortedScores = [];
for (var person in numberofvotes) {
  sortedScores.push([person, numberofvotes[person]]);
}

sortedScores.sort(function(b, a) {
  return a[1] - b[1];
});
console.log(sortedScores);

if (!socket.emit) {
  return;
}
socket.emit("election",sortedScores);

console.log(sortedScores[0][0] + " is the leader of the whiteboard.");


outerHeight.ptintln()
 }




} 

