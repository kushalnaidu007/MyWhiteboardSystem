const express = require("express");
const app = express();
const http = require("http").Server(app);
const port = process.env.PORT || 8000;
const io = require("socket.io")(http);

// Static files to be served.
app.use(express.static(__dirname + ""));

// Create an event handler.
const onConnection = socket => { 
  socket.on("drawing", data => socket.broadcast.emit("drawing", data));
  socket.on("voting", data => socket.broadcast.emit("voting", data));

};




// Initialise it.
io.on("connection", onConnection);

http.listen(port, () => console.log("listening on port " + port));

//http.listen(port, () => console.log("Election Intialized " + port));
