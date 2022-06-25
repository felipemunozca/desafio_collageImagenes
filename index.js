
const express = require("express");
const app = express();
const expressFileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const fs = require("fs");

app.listen(3000, console.log("Servidor corriendo en http://localhost:3000/"));

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/* 1. Integrar express-fileupload a Express. */
/* 2. Definir que el límite para la carga de imágenes es de 5MB. */
/* 3. Responder con un mensaje indicando que se sobrepasó el límite especificado. */
app.use(expressFileUpload({
    limits: { fileSize: 5000000},
    abortOnLimit: true,
    responseOnLimit: "Se supero el limite maximo de peso del archivo.",
}));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/formulario.html");
});

app.get("/collage", (req, res) => {
    res.sendFile(__dirname + "/collage.html");
});

/* 4. Crear una ruta POST /imagen que reciba y almacene una imagen en una carpeta pública del servidor. 
Considerar que el formulario envía un payload con una propiedad “position”, que indica la posición del collage donde 
se deberá mostrar la imagen. */
app.post("/imagen", (req, res) => {
    const { target_file } = req.files;
    const { posicion } = req.body;
    console.log(posicion)

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

/* 5. Crear una ruta GET /deleteImg/:nombre que reciba como parámetro el nombre de una imagen y la elimine de la 
carpeta en donde están siendo alojadas las imágenes. Considerar que esta interacción se ejecuta al hacer click en 
alguno de los números del collage. */
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

app.get("*", (req, res) => {
    res.send("<h1>ERROR 404</h1><h3>Página no encontrada.</h3>");
})