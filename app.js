require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo');

const dashboardRoutes = require('./routes/dashboard');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const deliveryRoutes = require('./routes/deliveries');
const userRoutes = require('./routes/users');

const User = require('./models/user');
const Product = require('./models/product');

const app = express();

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/farmers-market';
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongo connection error:'));
db.once('open', () => console.log('MongoDB connected'));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const secret = process.env.SESSION_SECRET || 'thisshouldbeabettersecret';
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600,
  crypto: { secret }
});
store.on('error', (e) => console.log('SESSION STORE ERROR', e));

app.use(session({
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.messages = {
    success: req.flash('success'),
    error: req.flash('error'),
    warning: req.flash('warning'),
    info: req.flash('info')
  };
  res.locals.currentPath = req.path;
  res.locals.pageTitle = res.locals.pageTitle || 'FarmFresh';
  res.locals.additionalCSS = res.locals.additionalCSS || [];
  res.locals.additionalJS = res.locals.additionalJS || [];
  next();
});

app.use('/', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/deliveries', deliveryRoutes);
app.use('/dashboard', dashboardRoutes);

app.get('/about', (req, res) => {
    res.render('about', { pageTitle: 'About Us' });
});

// Find Farmers Page Route
app.get('/farmers', async (req, res) => {
    const farmers = await User.find({ role: 'farmer' });
    res.render('farmers', { farmers, pageTitle: 'Meet Our Farmers' });
});

app.get('/', async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      return res.redirect(`/dashboard/${req.user.role}`);
    }

    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .select('name price image category')
      .lean();

    const normalize = (img) => {
      if (!img) return '/assets/images/placeholder-product.jpg';
      if (typeof img !== 'string') return '/assets/images/placeholder-product.jpg';
      if (img.startsWith('http') || img.startsWith('/')) return img;
      return '/assets/images/' + img;
    };

    products.forEach(p => {
      p.image = normalize(p.image);
    });

    res.render('home', { pageTitle: 'Home', products });
  } catch (err) {
    console.error('Home route error:', err);
    res.render('home', { pageTitle: 'Home', products: [] });
  }
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something went wrong';
  console.error(err);
  res.status(statusCode).render('error', { err, pageTitle: 'Error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});