var http = require('http'),
    sys  = require('sys'),
    fs   = require('fs'),
    io   = require('socket.io'),
    url  = require('url');

var server = http.createServer(function(req, res) {
  var path = url.parse(req.url).pathname, content_type;  
  
  console.log('* Server Started');
  
  switch (path) {
    case '/':
        res.writeHead(200, { 'Content-Type': 'text/html' });
        var rs = fs.createReadStream(__dirname + '/index.html');
        sys.pump(rs, res);
    break;
    case '/style.css':
    case '/favicon.ico':
        if (path.match(/\.js$/) != null) {
          content_type = 'text/javascript';
        } else if (path.match(/\.css$/) != null) {
          content_type = 'text/css';
        } else if (path.match(/\.png$/) != null) {
          content_type = 'image/png';
        } else {
          content_type = 'text/html';
        }
        
        fs.readFile(__dirname + path, function(err, data){
          if (err) {
            res.writeHead(404);
            res.end('404');
            return;
          }
          res.writeHead(200, { 'Content-Type': content_type })
          res.write(data, 'utf8');
          res.end();
        });
    break;
    default:
        console.log('default');
    break;
  }
  
});

server.listen(8080);

var socket = io.listen(server);

socket.on('connection', function(client) {
	var timer,
		obj,
		x = 0,
		y = 0,
		speed = 5;
		
	timer = setInterval(function () {
		/*if (x < 500) x += speed;
		else x = 1;
		if (y < 500) y += speed;
		else y = 1;*/
		
		client.send(JSON.stringify({ x: x, y: y}));
		//console.log('x: '+ x +' y: '+ y);
	}, 500);

	client.on('message', function(data) {
		console.log('Received: '+ data);
		obj = JSON.parse(data);
		x = obj.x;
		y = obj.x;
		
		socket.broadcast(data);
	});

	client.on('disconnect', function() {
		clearTimeout(timer);
		console.log('Disconnected!');
	});
});
