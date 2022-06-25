/**
 * inicializar el proyecto por defecto
 * > npm init -y
 * 
 * instalar el paquete express
 * > npm i express
 * 
 * instalar el paquete fileupload
 * > npm i express-fileupload
 * 
 * instalar el paquete body-parser
 * > npm i body-parser
 * 
 * instalar nodemon como dependencia de desarrollo
 * > npm i nodemon -D
 */

/* se hace la instancia de express en la constante app. */
/* se agrega una constante para utilizar el paquete express-fileupload */
/* se agrega una constante para utilizar el paquete body-parser */
/* se agrega una constante para utilizar file system y eliminar las imagenes guardadas internamente. */
const express = require("express");
const app = express();
const expressFileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const fs = require("fs");

app.listen(3000, console.log("Servidor corriendo en http://localhost:3000/"));

/* Se definen los middleware. */
/* Los middleware son funciones que se deben ser declaradas antes que las rutas y sirven como filtro para manejar rutas de carpetas
o un punto previo, en donde se pueden definir diferentes validaciones. */
/* se agrega de forma publica la carpeta public, donde dentro estara la carpeta imgs. */
/* Al realizar peticiones POST o PUT, el cuerpo de una peticion (payload), contiene información para crear una nuevo registro o 
actualizar uno ya existente. El paquete body-parser permite realizar esta tarea. Solo se requiere instalar body-parser y 
habilitar json() así como url-encode como middlewares para convertir datos a JSON. */
/* extended: true utiliza la libreria la librería "qs" mientras false utiliza la librería "querystring". */
/* extended: true precisa que el objeto req.body vendra con valores desde el formulario de cualquier tipo, en lugar de solo cadenas. */
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/* La validación de express file upload se hace antes de llamar a las rutas, para que la ejecucion del programa se pare aquí
en caso de que ocurra un error. */
/* El primer objeto que se debe definir, es el peso maximo del archivo en formato bytes. */
/* En caso que el peso sea mayor, con abortOnLimit con valor true, se cancela la ejecución del programa. */
/* Y finalmente, se escribe una respuesta para informarle al usuario del problema. */
app.use(expressFileUpload({
    limits: { fileSize: 5000000},
    abortOnLimit: true,
    responseOnLimit: "Se supero el limite maximo de peso del archivo.",
}));

/* ruta raiz del programa, carga el formulario. */
/* se utiliza el verbo GET. */
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/formulario.html");
});

/* ruta collage para ver las fotos subidas en el servidor. */
app.get("/collage", (req, res) => {
    res.sendFile(__dirname + "/collage.html");
});

/* ruta imagen para subir una foto en la carpeta imgs. */
/* se utiliza el verbo POST. */
app.post("/imagen", (req, res) => {
        //
    /* se crea una constante y con un destructuring se obtiene la propiedad file del formulario.html. */
    /* se crea una constante de posicion y utilizando req.body se puede rescatar el numero ingresado en posicion en el formulario 
    y no es necesario pasar la informacion por req.on() */
    const { target_file } = req.files;
    const { posicion } = req.body;

    /* .mv() es un metodo de fileupload para poder mover un archivo a una carpeta especifica. */
    /* con __dirmane se indeca que desde la raiz, se debe buscar la carpeta archivos, y dentro agregar el archivo con el nombre 
    que tiene por defecto. */
    /* como segundo parametro, se le pasa un callback de error, para crear una validacion y mostrar un mensaje de éxito o de error. */
    /* utilizando las rutas ya definidas, se crean mensajes para poder volver a las paginas anteriores utilizando html. */
    if (posicion >= 1 && posicion < 9) {
        const name = `imagen-${posicion}`;
        target_file.mv(`${__dirname}/public/imgs/${name}.jpg`, (err) => {
            if (err) {
                res.send(`<h4>Ha ocurrido un error al subir la imagen.<h4>
                        <p><a href="/">Volver a la seccion anterior</a></p>`);
            } else {
                res.send(`<h3>Archivo subido al servidor con éxito.</h3>
                        <p><a href="/">Volver a la seccion anterior</a></p>`);
            }
        })
    } else {
        res.send(`<h3>La Posicion no puede ir en blanco, y tampoco puede ser menor a 1 y mayor a 9.</h3>
                <p><a href="/">Volver a la seccion anterior</a></p>`);
    }

});

/* ruta deleteImg para eliminar una foto en la carpeta imgs. */
/* se utiliza el verbo GET ya que en collage.html no hay una ruta que utilice DELETE. */
app.get("/deleteImg/:nombre", (req, res) => {
    const { nombre } = req.params;
    fs.unlink(`${__dirname}/public/imgs/${nombre}`, (err) => {
        if (err) {
            res.send(`<h3>Ha ocurrido un error al eliminar la imagen.</h3>
                    <p><a href="/collage">Volver a la seccion anterior</a></p>`);
        } else {
            res.send(`<h3>La imagen ${nombre} fue eliminada con exito.</h3>
                    <p><a href="/collage">Volver a la seccion anterior</a></p>`);
        }
    });
});

/* Ruta genérica para cualquier endpoint no declarado. */
app.get("*", (req, res) => {
    res.send("<h1>ERROR 404</h1><h3>Página no encontrada.</h3>");
})