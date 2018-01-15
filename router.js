const Authentication = require('./controllers/authentication');
const guestController = require('./controllers/guestController');
const passportService = require('./services/passport');
const passport = require('passport');


const requireAuth = passport.authenticate('jwt', {session:false});
const requireSignin = passport.authenticate('local', {session: false});

const dataProvider = require('./services/data_provider');


module.exports = function(app){
  app.get('/', requireAuth, function(req, res){
    res.send({message:'secret code is ABC'});
  });
  app.post('/signin', requireSignin, Authentication.signin)
  app.post('/signup', Authentication.signup);

  app.get('/getguestid', function (req, res) {
      guestController.getGuestId(req, res);
  });
  app.post('/saveGuestSelection', function (req, res) {
      guestController.saveGuestSelection(req, res);
  })
  
  app.post('/getProducts', getProductsAsync);


}

const getProductsAsync = async function (req, res) {
    const data = req.body;
    const result = await dataProvider.requestProducts(data, res);
    if (result) {
        res.status(200).send(result);
    }
    else {
        debugger;
        res.status(404).send({ error: "no results" });
    }
}