var socket = io();
var usuario;
var escribiendo = false;
var timeout = undefined;

// Crear nombre de usuario 
function configurarNombreUsuario(){
    if($('#item').val()!=""){
          socket.emit('configurarNombreUsuario', $('#item').val());      
    }
    else{
        alert("Debe ingresar un Nickname para el Chat");
    }
}

$(document).ready(function(){

    $('#item').keydown(function (e){
        if(e.keyCode == 13){
            configurarNombreUsuario();
        }
    })

    socket.on('configurarUsuario', (datos)=>{
        usuario = datos.nombreusuario;
        $("#nombreusuario").html("<label class='txt_negrita'>Escribe un Mensaje:</label>");
        $("#item").val("");
        $("#item").attr("placeholder", "");
        
        $("#enviar").attr("onclick", "enviarMensaje()");
        $("#enviar").attr("value", "Enviar");         

        obtenerMensajes();
    });

    $('#item').keypress((e)=>{
    
        if($("#item").attr("placeholder") != "Nombre de Usuario:"){

            if(e.which != 13){
                escribiendo = true;
                socket.emit('escribiendo', {usuario:usuario, escribiendo:true});
                clearTimeout(timeout);
                timeout = setTimeout(finTiempoEscritura, 100);
            }
            else {
                clearTimeout(timeout);
                finTiempoEscritura();
                enviarMensaje();
            }
        }

    });

    // Mostrar texto 'Usuario esta escribiendo...'
    socket.on('display', (datos)=>{

        if(datos.escribiendo == true) {
            if (document.hasFocus()) {
                $('.escribiendo').hide();
            }
            else {
                $('.escribiendo').show(); 
            }

            
        }
        else {
            if(usuario == undefined){
                $('.escribiendo').text("");
            }
            else {    
                $('.escribiendo').text(`${datos.usuario} esta escribiendo...`);
                setTimeout(function() {
                    $('.escribiendo').fadeOut('fast');
                }, 1500)                
            }
        }
    });
});

// Obtenemos los mensajes en tiempo real 
socket.on('mensaje',obtenerMensajes);

function finTiempoEscritura(){
    escribiendo = false;
    socket.emit('escribiendo', {usuario:usuario, escribiendo:false});
}

// Obtener mensajes para mostrarlos en el chat 
function obtenerMensajes(){
    $.getJSON("https://cluttered-rake-production.up.railway.app/mensajes/", (datos)=>{ 
        var mensaje = [];
        $.each(datos, (key, val) => {
            $.each(val, (key, val) => {
                var nombreusuario = key;
                var msg = val;
                mensaje.push(`<strong>${nombreusuario}</strong><p>${msg}</p>`);
            });
        });
        $(".ventanachat").html(mensaje);
        $(".ventanachat").animate({ scrollTop: $(document).height() }, "slow");
        return false;
    });

};

// Con este método enviamos el mensaje del usuario al Chat 
function enviarMensaje() {

    var nombreUsuario = usuario; 
    var mensaje = $('#item').val();

    if(nombreUsuario == undefined){
        var item = `{"Bienvenido: " : "${mensaje}"}`;
    }
    else {
        var item = `{"${nombreUsuario}" : "${mensaje}"}`;
    }

    if(mensaje.length>0){
        $.post('/enviar_mensaje', JSON.parse(item), ()=>{
        });
    
        $('#item').val("");

    }
    else{
        alert("No puede enviar Mensajes vacios");
    }
}

function obtenerUsuariosConectados(){
    $.getJSON("https://cluttered-rake-production.up.railway.app/usuarios/", (datos)=>{ 
        var usuarios_mostrar = "";
        $.each(datos, (key, val) => {
            usuarios_mostrar= usuarios_mostrar+"- "+val+". \n";
        });
        if(usuarios_mostrar==""){
            alert("Aun no se ha conectado ningun Usuario al Chat");
        }
        else{
            alert("Usuarios Conectados al Chat: \n"+usuarios_mostrar);
        }
        return false;
    });
}

