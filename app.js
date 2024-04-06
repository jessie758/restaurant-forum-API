const path = require('path');

const express = require('express');
const handlebars = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('./config/passport');
const flash = require('connect-flash');

const handlebarsHelpers = require('./helpers/handlebars-helpers');
const { generalMessageHandler } = require('./middlewares/message-handler');
const { generalErrorHandler } = require('./middlewares/error-handler');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;
const SESSION_SECRET = 'secret';

app.engine('hbs', handlebars({ extname: '.hbs', helpers: handlebarsHelpers }));
app.set('view engine', 'hbs');

app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(
  session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(generalMessageHandler);
app.use(routes);
app.use(generalErrorHandler);

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`);
});

module.exports = app;
