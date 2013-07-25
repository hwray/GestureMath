var connect = require('connect');


var app = connect();
app.use(connect.logger('dev'));
app.use(connect.static('src/'));
app.listen(8000);

console.log("Server listening on port 8000");