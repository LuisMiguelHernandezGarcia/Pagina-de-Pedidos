const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const ejs = require('ejs');
const path = require('path');

const app = express();

// Configuración de la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'platadormapedidos',
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos: ', err);
    throw err;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Configuración de sesiones
app.use(
  session({
    secret: 'secret-key',
    resave: true,
    saveUninitialized: true,
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Middleware para verificar si el usuario está autenticado
function isLoggedIn(req, res, next) {
  if (req.session.loggedin) {
    return next();
  }
  res.redirect('/login');
}

// Rutas
app.get('/', isLoggedIn, (req, res) => {
  // Consulta para obtener la lista de productos desde la base de datos
  db.query('SELECT folio, nombre_producto FROM productos', (err, productos) => {
    if (err) {
      console.error(err);
      res.render('dashboard.ejs', { user: req.session.user, productos: [] });
    } else {
      res.render('dashboard.ejs', { user: req.session.user, productos });
    }
  });
});

app.get('/login', (req, res) => {
  res.render('login.ejs', { error: null });
});

app.post('/login', (req, res) => {
  const { correo, contraseña } = req.body;
  if (correo && contraseña) {
    db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, results) => {
      if (err) {
        console.error(err);
        res.render('login.ejs', { error: 'Error en la base de datos' });
      } else if (results.length > 0) {
        const usuario = results[0];
        bcrypt.compare(contraseña, usuario.contraseña, (bcryptErr, result) => {
          if (bcryptErr) {
            console.error(bcryptErr);
            res.render('login.ejs', { error: 'Error de autenticación' });
          } else if (result) {
            req.session.loggedin = true;
            req.session.user = usuario;
            res.redirect('/');
          } else {
            res.render('login.ejs', { error: 'Credenciales incorrectas' });
          }
        });
      } else {
        res.render('login.ejs', { error: 'Usuario no encontrado' });
      }
    });
  } else {
    res.render('login.ejs', { error: 'Campos vacíos' });
  }
});

app.get('/registro', (req, res) => {
  res.render('registro.ejs', { error: null });
});

app.post('/registro', (req, res) => {
  const { nombre, apellido, correo, contraseña } = req.body;

  // Verificar si el correo ya existe en la base de datos
  db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, results) => {
    if (err) {
      console.error(err);
      res.render('registro.ejs', { error: 'Error en la base de datos' });
    } else if (results.length > 0) {
      // El correo ya está en uso, redirige de nuevo al formulario de registro con un mensaje de error
      res.render('registro.ejs', { error: 'El correo electrónico ya está en uso.' });
    } else {
      // Genera un hash bcrypt para la contraseña
      bcrypt.hash(contraseña, 10, (err, hash) => {
        if (err) {
          console.error(err);
          res.render('registro.ejs', { error: 'Error al hashear la contraseña' });
        } else {
          // Almacena el usuario en la base de datos con la contraseña hasheada y el rol por defecto 'cliente'
          db.query(
            'INSERT INTO usuarios (nombre, apellido, correo, contraseña, rol) VALUES (?, ?, ?, ?, ?)',
            [nombre, apellido, correo, hash, 'cliente'],
            (err, result) => {
              if (err) {
                console.error(err);
                res.render('registro.ejs', { error: 'Error al registrar usuario' });
              } else {
                // Usuario registrado con éxito
                res.redirect('/login');
              }
            }
          );
        }
      });
    }
  });
});

// ... (otras importaciones y configuraciones)

app.post('/crear-pedido', isLoggedIn, (req, res) => {
  const {
    nombre,
    apellido,
    correo,
    calle,
    numero,
    ciudad,
    codigoPostal,
    producto,
    folioProducto,
    nombreProducto,
    stock,
    descripcionProducto,
    precio,
    descuento,
    cantidadProducto,
    precioNeto,
    metodoPago,        // Nuevo campo para el método de pago
    numeroTarjeta,     // Nuevo campo para el número de tarjeta
    correoPaypal       // Nuevo campo para el correo de PayPal
  } = req.body;

  // Inserta los datos en la tabla "pedidos" de tu base de datos
  db.query(
    'INSERT INTO pedidos (nombre, apellido, correo, direccion_calle, direccion_numero, ciudad, codigo_postal, producto, folio_producto, nombre_producto, stock, descripcion_producto, precio, descuento, cantidad_producto, precio_neto, metodo_pago, numero_tarjeta, correo_paypal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)',
    [
      nombre,
      apellido,
      correo,
      calle,
      numero,
      ciudad,
      codigoPostal,
      producto,
      folioProducto,
      nombreProducto,
      stock,
      descripcionProducto,
      precio,
      descuento,
      cantidadProducto,
      precioNeto,
      metodoPago,    // Aquí proporciona el valor para el método de pago
      numeroTarjeta,    // Aquí proporciona el valor para el número de tarjeta
      correoPaypal, // Valor del correo de PayPal
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        res.render('dashboard.ejs', {
          user: req.session.user,
          productos: [],
          error: 'Error al crear el pedido',
        });
      } else {
        // Redirecciona a la página de dashboard o muestra un mensaje de éxito
        res.redirect('/ultimo-pedido');
      }
    }
);
});

// Agrega una nueva ruta para mostrar el último pedido del usuario logeado
app.get('/ultimo-pedido', isLoggedIn, (req, res) => {
  const userId = req.session.user.id; // Suponiendo que tienes un campo "id" en la tabla de usuarios

  // Consulta para obtener el último pedido del usuario
  db.query(
    'SELECT * FROM pedidos WHERE correo = ? ORDER BY id DESC LIMIT 1',
    [req.session.user.correo],
    (err, ultimoPedido) => {
      if (err) {
        console.error(err);
        res.render('dashboard.ejs', {
          user: req.session.user,
          productos: [],
          error: 'Error al obtener el último pedido',
        });
      } else if (ultimoPedido.length > 0) {
        res.render('ultimo-pedido.ejs', {
          user: req.session.user,
          ultimoPedido: ultimoPedido[0],
        });
      } else {
        res.render('dashboard.ejs', {
          user: req.session.user,
          productos: [],
          error: 'No se encontraron pedidos para este usuario',
        });
      }
    }
  );
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/login');
  });
});

// Agrega la nueva ruta para obtener los datos del producto
app.get('/get-product/:productoId', (req, res) => {
  const productoId = req.params.productoId;
  // Consulta para obtener los datos del producto desde la base de datos
  db.query('SELECT * FROM productos WHERE folio = ?', [productoId], (err, producto) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error en la base de datos' });
    } else if (producto.length > 0) {
      res.json(producto[0]);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  });
});

// Configuración de EJS como motor de plantillas
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Puerto en el que se ejecutará el servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});