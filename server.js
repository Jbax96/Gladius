var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var http = require('http').Server(app);
var io = require('socket.io')(http);
var User = require( __dirname +'/models/user');

//connect to mongoose
mongoose.connect('mongodb://localhost/gladius');
var db = mongoose.connection;

//handle mongoose connection error
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open',function(){
    console.log("Database connected");
});

//use sessions to track logins
app.use(session({
    secret:'I am Spartacus',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection:db
    })
}));

app.use('/Assets',express.static('./Assets'));
//parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//serve static files from template
app.use(express.static(__dirname + '/logReg'));

//include routes
var routes = require('./routes/router');
app.use('/',routes);

//catch 404 and forward to error handler
app.use(function(req,res,next){
    var err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

//error handler
app.use(function(err,req,res,next){
    res.status(err.status || 500);
    res.send(err.message);
});


//Chat window
io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message',msg);
        console.log('message: ' + msg);
    });
    socket.on('connection',function(socket){
    })
});

//Create dictionary to store players as key/value
var players = {};
var bullet_array = [];

io.on('connection',function(socket){
    console.log("New client has connect with id", socket.id);
    socket.on('new-player',function(state_data){
        console.log("New Player has state:",state_data);
        //Add player to dictionary
        players[socket.id] =state_data;
        //send an update event
        io.emit('update-players',players);
    })
    socket.on('disconnect',function(){
        //Remove player from dictionary
        delete players[socket.id]
        io.emit('update-players',players);
    })
    // Listen for move events and tell all other clients that something has moved
    socket.on('move-player',function(position_data){
        if(players[socket.id] == undefined) return; // Happens if the server restarts and a client is still connected
        players[socket.id].x = position_data.x;
        players[socket.id].y = position_data.y;
        players[socket.id].angle = position_data.angle;
        io.emit('update-players',players);
    })

    // Listen for shoot-bullet events and add it to our bullet array
    socket.on('shoot-bullet',function(data){
        if(players[socket.id] == undefined) return;
        var new_bullet = data;
        data.owner_id = socket.id; // Attach id of the player to the bullet
        if(Math.abs(data.speed_x) > 20 || Math.abs(data.speed_y) > 20){
            console.log("Player",socket.id,"is cheating!");
        }
        bullet_array.push(new_bullet);
    });
})

// Update the bullets 60 times per frame and send updates
function ServerGameLoop(){
    for(var i=0;i<bullet_array.length;i++){
        var bullet = bullet_array[i];
        bullet.x += bullet.speed_x;
        bullet.y += bullet.speed_y;

        // Check if this bullet is close enough to hit any player
        for(var id in players){
            if(bullet.owner_id != id){
                // And your own bullet shouldn't kill you
                var dx = players[id].x - bullet.x;
                var dy = players[id].y - bullet.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if(dist < 70){
                    players[id]
                    io.emit('player-hit',id); // Tell everyone this player got hit
                }
            }
        }

        // Remove if it goes too far off screen
        if(bullet.x < -10 || bullet.x > 1000 || bullet.y < -10 || bullet.y > 1000){
            bullet_array.splice(i,1);
            i--;
        }

    }
    // Tell everyone where all the bullets are by sending the whole array
    io.emit("bullets-update",bullet_array);
};
setInterval(ServerGameLoop, 16);


http.listen(3000,function(){
    console.log('listening on port 3000');
});


//add web socket handlers
io.on('connection',function(socket){

});
setInterval(function() {
    io.sockets.emit('message', 'hi!');
}, 1000);

//Update server every 60 seconds
var players = {};
io.on('connection', function(socket) {
    socket.on('new player', function() {
        players[socket.id] = {
            x: 300,
            y: 300
        };
    });
    socket.on('movement', function(data) {
        var player = players[socket.id] || {};
        if (data.left) {
            player.x -= 5;
        }
        if (data.up) {
            player.y -= 5;
        }
        if (data.right) {
            player.x += 5;
        }
        if (data.down) {
            player.y += 5;
        }
    });
});
setInterval(function() {
    io.sockets.emit('state', players);
}, 1000 / 60);



/*app.listen(3000,function(){
    console.log('Express app listening on port 3000');
});*/
