var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var swaggerJsdoc = require("swagger-jsdoc");
var swaggerUi = require("swagger-ui-express");
var auth = require('./middleware/auth.js');

const db = require('./models/index.js');

// ------ Configure swagger docs ------
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "My API for doing cool stuff!",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header'
        },
      },
    },
  },
  apis: [path.join(__dirname, "/routes/*.js")],
};
var swaggerSpecs = swaggerJsdoc(options);

async function testDB() {
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await db.sequelize.sync({ alter: true });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}


testDB();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var boxesRouter = require('./routes/boxes');
var cardsRouter = require('./routes/cards');
var loginRouter = require('./routes/login');
var signupRouter = require('./routes/signup');
var userToCardRouter = require('./routes/userToCard');
var userToBoxRouter = require('./routes/userToBox');




var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

// Models an app.locals übergeben
app.locals = db

const cors = require('cors');
const corsOptions = {
  origin: '*', // Geben Sie hier die URL Ihrer Website an
  methods: '*',
};
app.use(cors());
app.use(express.json());




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({
  extended: true
}));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/signup', signupRouter)
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true
  }
}));

function admin(req, res, next) {
  if (req.app.locals.user.admin) {
    next();
  } else {
    res.status(403).send('No permission');
  }
}

app.use(auth);
app.post('/checkToken', (req, res) => {
  res.status(200).send();
});
app.use('/boxes', boxesRouter);
app.use('/cards', cardsRouter);
app.use('/progress', userToCardRouter);
app.use(admin);
app.use('/userToBox', userToBoxRouter);
app.use('/users', usersRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  const errorResponse = {
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {},
  };

  // return the error as JSON
  res.status(err.status || 500).json(errorResponse);
});

module.exports = app;
