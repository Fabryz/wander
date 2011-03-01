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

var socket = io.listen(server),
	timer,
	x = 0,
	y = 0,
	changed = false,
	dir = 'd',
	obj = { x: x, y: y, dir: dir, changed: changed}, //testing
	speed = 5,
	dirs = ['u', 'd', 'l', 'r'];

socket.on('connection', function(client) {
		
	timer = setInterval(function () {
		/*if (x < 500) x += speed;
		else x = 1;
		if (y < 500) y += speed;
		else y = 1;*/

		console.log('x: '+ obj.x +' y: '+ obj.y +' dir: '+ obj.dir +' changed: '+ obj.changed);
		client.send(JSON.stringify({ x: x, y: y}));
	}, 500);

	client.on('message', function(data) {		
		obj = JSON.parse(data);
		
		/*if (obj.changed)
			changed = true;
		else
			changed = false;*/
			
		//changed = (obj.changed? true : false);
		
		if (obj.changed) {
		
			var pos = dirs.indexOf(obj.dir);
			if (pos >= 0) {
				console.log('Received: '+ data);
			
				if (obj.dir == 'r')
					obj.x += speed;
				else if (obj.dir == 'l')
						obj.x -= speed;    
				if (obj.dir == 'u')
					obj.y -= speed;
				else if (obj.dir == 'd')
						obj.y += speed;
		
				socket.broadcast(JSON.stringify({ x: obj.x, y: obj.y, dir: obj.dir, changed: changed }));
			
			}
		
		}
	});

	client.on('disconnect', function() {
		clearTimeout(timer);
		console.log('Disconnected!');
	});
});
