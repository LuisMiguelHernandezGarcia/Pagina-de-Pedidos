const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(
  new LocalStrategy((correo, contraseña, done) => {
    connection.query(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo],
      async (error, results) => {
        if (error) {
          return done(error);
        }
        if (!results || results.length === 0) {
          return done(null, false, { message: 'Usuario no encontrado' });
        }

        const user = results[0];

        // Compara la contraseña ingresada con la almacenada en la base de datos
        const match = await bcrypt.compare(contraseña, user.contraseña);

        if (match) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Contraseña incorrecta' });
        }
      }
    );
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  connection.query('SELECT * FROM usuarios WHERE id = ?', [id], (error, results) => {
    if (error) {
      return done(error);
    }
    const user = results[0];
    done(null, user);
  });
});

// Configuración adicional de passport y rutas para el inicio de sesión
// ...

app.use(passport.initialize());
app.use(passport.session());

// Rutas para el inicio de sesión y cierre de sesión
// ...

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});