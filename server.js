// Dependencias a utilizar en Proyecto
var alert = require('alert');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var urlencodedParser = bodyParser.urlencoded({extended : false});
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const notifier = require('node-notifier');

//const {PORT = 3000} = process.env

app.use(express.static(__dirname));
app.use(bodyParser.json());

var mensajes = [];
var usuarios = [];

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
 });

 app.post('/enviar_mensaje', urlencodedParser, (req,res) => {
    const object1 = JSON.parse(JSON.stringify(req.body));
    var n_usu= (Object.keys(object1)[0]);
    var mensaje=object1[n_usu]; 
    mensajes.push(req.body);
    io.emit('mensaje');
    res.sendStatus(200);
    var date_ob = new Date();
    var date = ("0" + date_ob.getDate()).slice(-2);
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    var year = date_ob.getFullYear();
    var hours = date_ob.getHours();
    var minutes = date_ob.getMinutes();
    var seconds = date_ob.getSeconds();

    var hora_envio_final= date + "/" + month + "/" + year + " a las " + hours + ":" + minutes + ":" + seconds+" hrs.";
    var mensaje_final= mensaje+'\n ( Enviado el '+hora_envio_final+')';
    notifier.notify({
        title: 'El Usuario '+n_usu+' ha enviado un Mensaje.',
        message: mensaje_final
      });

 });

 app.get('/mensajes', (req,res)=>{
    res.send(JSON.stringify(mensajes));
 });

 app.get('/usuarios', (req,res)=>{
    res.send(JSON.stringify(usuarios));
 });

 io.on('connection', (socket)=>{   
 
    socket.on('configurarNombreUsuario', (datos)=>{ 
       if(usuarios.includes(datos)){
         alert("Nombre de Usuario ya en Uso. Intente con otro");
       }
       else{
         usuarios.push(datos);
         socket.emit('configurarUsuario', {nombreusuario:datos}); 
       }
       
    });
  
    // Pasamos los datos que el usuario esta escribiendo en el chat 
    socket.on('escribiendo', (datos)=>{
       // Si el usuario esta escribiendo un mensaje 
       if(datos.escribiendo == true){
          io.emit('display', datos);
       }
       else {
          io.emit('display', datos);
       }
    });
  
 });

 http.listen(3000, function(){
    console.log('Servidor Iniciado en el port 3000');
 });