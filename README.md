# Página Web de Pedidos

Este proyecto es una página web de pedidos desarrollada en Node.js y MySQL. Permite a los usuarios iniciar sesión, realizar pedidos y obtener recibos detallados. A continuación, se detallan los pasos para ejecutar el proyecto.

# Requerimientos

Antes de ejecutar el proyecto, asegúrate de tener instalados los siguientes componentes:

Node.js: El entorno de ejecución de JavaScript.
MySQL: El sistema de gestión de bases de datos.
Dependencias del proyecto (puedes instalarlas ejecutando npm install en la carpeta del proyecto después de descomprimir el archivo ZIP).
Configuración de la Base de Datos
Antes de ejecutar la aplicación, configura tu base de datos MySQL. Abre el archivo server.js y busca la sección que contiene la configuración de la base de datos:

# javascript (server.js):
# bash
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'platadormapedidos',
});

Asegúrate de modificar los valores para host, user, password, y database según tu configuración de MySQL.

# Compilación y Ejecución
Para ejecutar la aplicación, sigue estos pasos:

Descarga y descomprime el archivo ZIP del proyecto en tu computadora.

Abre una terminal y navega hasta la carpeta del proyecto.

Ejecuta el siguiente comando para instalar las dependencias del proyecto:

# bash

npm install

Asegúrate de que tu servidor MySQL esté en ejecución.

Ejecuta la aplicación con el siguiente comando:

# bash

npm start

La aplicación se ejecutará en http://localhost:3000.

# Uso

Abre tu navegador web y accede a http://localhost:3000.
Puedes iniciar sesión o registrarte si aún no tienes una cuenta.
Una vez iniciada la sesión, podrás realizar pedidos seleccionando productos, cantidades y proporcionando información de envío.
Luego, podrás confirmar el pedido y obtener un recibo detallado de la transacción.

# Contribución

Si deseas contribuir a este proyecto, estamos abiertos a colaboraciones. Siéntete libre de crear issues o solicitudes de extracción en el repositorio del proyecto.

# Licencia

Este proyecto se encuentra bajo la Licencia MIT.