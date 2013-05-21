var fs      = require('fs');
    express = require('express');
    app     = express();
    mongo = require('mongodb');
    port    = process.env.PORT || 5000;

    app.configure(function () {
        app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
        app.use(express.bodyParser());
    });

   var Server = mongo.Server;
   var Db = mongo.Db;
   var BSON = mongo.BSONPure;
   var ObjectID = mongo.ObjectID;

   var server = new Server('ds059947.mongolab.com', 59947, {auto_reconnect : true});
   var db = new Db('punten', server);

   db.open(function(err, client) {
       client.authenticate('punten', 'vijfpunten', function(err, success) {
           //console.log("Connected to 'punten' database");
       });
   });

 app.all('/*', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'GET,PUT');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
 });
    
app.get('/', function(req, res) {
  db.collection('punten', function(err, collection) {
      collection.find().sort({points: -1}).toArray(function(err, items) {
          res.set('Content-Type', 'application/json');
          res.send(items);
      });
  });
});

app.put('/:id', function(req, res){

  var id = req.params.id;
  var player = req.body;

  db.collection('punten', function(err, collection) {
      collection.update({'_id':new BSON.ObjectID(id)}, player, {safe:true}, function(err, result) {
          if (err) {
              console.log('Error updating player: ' + err);
              res.send({'error':'An error has occurred'});
          } else {
              res.set('Content-Type', 'application/json');
              console.log('' + result + ' document(s) updated');
              res.send(player);
          }
      });
  });

});

app.get('/:id', function(req, res){
  var id = req.params.id;
   db.collection('punten', function(err, collection) {
       collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
           res.send(item);
       });
   });
});

app.listen(port);

