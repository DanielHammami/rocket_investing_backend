var express = require('express');
var router = express.Router();

//initialisation modules de chiffrement et hachage pour le password input
var uid2 = require('uid2')
var bcrypt = require('bcrypt');

//import connexion des models users & portofolios
var userModel = require('../models/users')
var portofolioModel = require('../models/portofolios')

// --------------------------- localhost:3000 --------------------------- //
/* GET home page ==> test fonctionnement Express Backend */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// ------------------------------- Sign-Up POST------------------------------- //
router.post('/sign-up', async (req, res) => {

  var error = []
  var result = false
  var saveUser = null
  var token = null

  const data = await userModel.findOne({username: req.body.usernameFromFront})

  if(data != null){
    error.push('utilisateur déjà présent')
  }

  if(req.body.usernameFromFront == '' || req.body.passwordFromFront == ''){
    error.push('champs vides')
  }

  if(error.length == 0){
    var hash = bcrypt.hashSync(req.body.passwordFromFront, 10);
    var newUser = new userModel({
      username: req.body.usernameFromFront,
      password: hash,
      token: uid2(32),
    })
    saveUser = await newUser.save()

    if(saveUser){
      result = true
      token = saveUser.token
    }
  }

  res.json({result, saveUser, error, token})
  });

  // ------------------------------- Sign-In POST ------------------------------- //
  router.post('/sign-in', async (req, res) => {

    var result = false
    var user = null
    var error = []
    var token = null

    if(req.body.usernameFromFront == '' || req.body.passwordFromFront == ''){
      error.push('champs vides')
    }

    if(error.length == 0){
    user = await userModel.findOne({username: req.body.usernameFromFront,})

      if(user){
        if(bcrypt.compareSync(req.body.passwordFromFront, user.password)){
          result = true
          token = user.token
        } else {
          result = false
          error.push('mot de passe incorrect')
        }

      } else {
        error.push('utilisateur inconnu')
      }
    }

    res.json({result, user, error, token})
  });

  // ------------------------------ Wishlist GET ------------------------------ //
  router.get('/wishlist', async (req, res) => {
    var result = false
    var username;
    var portofolios = "Aucun portefeuille enregistré"
    var user = await userModel.findOne({token: req.query.token})

    if(user != null){
      username = user.username

      if(user.portofoliosId.length >= 1){
        portofolios = await userModel.findOne({token: req.query.token})
                                              .populate('portofoliosId')
                                              .exec()
        // populate() pour lire les propriétés de portofoliosId
        result = true
      }
    }

    res.json({portofolios, result, username}) // pour affichage des portefeuilles dans "Mes favoris"
  })

  // ------------------------------ Wishlist POST ------------------------------ //
  router.post('/wishlist', async function(req, res){
    var result = false
    var userName;
    var isValid = false

    var user = await userModel.findOne({token: req.body.token})

    if(user != null){

      for (let i=0; i<user.portofoliosId.length; i++){
        if(req.body._idFront == user.portofoliosId[i]){
          isValid = true
        }
      }

      if(!isValid) {
        user.portofoliosId.push({_id: req.body._idFront}) // _id = objectId du portefeuille sélectionné
        var userSave = await user.save()

        if(userSave.username){
          result = true
          userName = userSave.username
        }
      }

    }

    res.json({result, userName, isValid})
  })

  // ------------------------------ Wishlist DELETE ------------------------------ //
  router.delete('/wishlist', async function(req,res){
    var result = false
    var user = await userModel.findOne({token: req.body.token})

    if(user != null){
      user.portofoliosId.splice(req.body.position,1)

      var userSave = await user.save()

      if(userSave.username){
        result = true
      }
    }

    res.json({result})
  })


  // ------------------------------- Strategy POST------------------------------- //

  router.post('/strategy', async (req, res) => {
    var strategyFomFrontend = req.body.strategy
    var profilFromFrontend = req.body.profil

    var strategyData = await portofolioModel.find({
      strategy: strategyFomFrontend
    })

    var data = strategyData

    // get wallet name
    var profilName = []

    for (var i = 0; i < strategyData.length; i += 1) {
      profilName.push(strategyData[i].name)
    }

    res.json({ profilName })
  })

  // ------------------------------- Portofolio GET ------------------------------- //
  router.get('/portofolio', async (req, res) => {

    var portofolios = []

    var portofolio = await portofolioModel.findOne({name: req.query.name})
    // req.query.name provenant du nom du portefeuille sélectionné

    if(portofolio != null){
      portofolios = portofolio
    } else {
      portofolios = "Aucun portefeuille disponible"
    }

    res.json({portofolios})
  })


// ------------------------------- introduction GET ------------------------------- //
router.get('/introduction', async function(req, res){
  var result = false
  var username;

  var user = await userModel.findOne({token: req.query.token})

    if(user != null){
      username = user.username
      result = true
    }

  res.json({result, username})
})

module.exports = router;