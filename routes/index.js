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

// ------------------------------- Sign-Up ------------------------------- //
// req.body.userName = john
// req.body.password (Hash) = ***********
// Token (bcrypt + UID2)
// Renvoie en BDD
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

  // ------------------------------- Sign-In ------------------------------- //
  // req.body.userName = john
  // req.body.password = ***********
  // Récupération du Token en BDD si Name + password ==> Result=True
  // Renvoie le token dans le Front + Name pour affichage
  router.post('/sign-in', async (req, res) => {

    var result = false
    var user = null
    var error = []
    var token = null

    if(req.body.usernameFromFront == '' || req.body.passwordFromFront == ''){
      error.push('champs vides')
    }

    if(error.length == 0){
    const user = await userModel.findOne({username: req.body.usernameFromFront,})

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

  // ------------------------------ Wishlist ------------------------------ //
  // find(+ filtre par le token) en BDD
  // Affichage des portefeuilles en front
  router.get('/wishlist', async (req, res) => {
    var result = false
    var username;
    var portofolios = "Aucun portefeuille enregistré"
    var user = await userModel.findOne({token: req.query.token})
    //console.log("--------------------------User:-----------------------------", user.portofoliosId)

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

  // # insertion
  // db.contacts.insert({ first: 'Quentin', last: 'Busuttil' })
  router.post('/wishlist', async function(req, res){
    var result = false
    var userName;
    var isValid = false

    var user = await userModel.findOne({token: req.body.token})

    if(user != null){

      for (let i=0; i<user.portofoliosId.length; i++){
        // console.log("user.portofoliosId[i]", user.portofoliosId[i])
        if(req.body._idFront == user.portofoliosId[i]){
          isValid = true
        }
      }

      if(!isValid) {
        user.portofoliosId.push({_id: req.body._idFront})
        // _id = objectId du portefeuille sélectionné
        var userSave = await user.save()
        // console.log("userSave :", userSave)

        if(userSave.username){
          result = true
          userName = userSave.username
        }
      }

    }

    res.json({result, userName, isValid})
  })

  // # effacer un document
  // db.contacts.remove({ _id: ObjectId("55accc6c039c97c5db42f192") })
  router.delete('/wishlist', async function(req,res){
    var result = false
    var user = await userModel.findOne({token: req.body.token})

    if(user != null){
      user.portofoliosId.splice(req.body.position,1)
      // utilisation des params pour renvoyer la position du portofolioId
      // à supprimer dans le tableau.

      var userSave = await user.save()

      if(userSave.username){
        result = true
      }
    }

    res.json({result})
  })


  // ------------------------------- Strategy ------------------------------- //

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

    //console.log('profilName => ', profilName)

    res.json({ profilName })
  })

  // ------------------------------- Portofolio ------------------------------- //
  // find(filtre selection portofolio) en BDD
  // Affichage des données page 08 à 11
  router.get('/portofolio', async (req, res) => {

    var portofolios = []
    //console.log("name portefeuille :", req.query.name)
    var portofolio = await portofolioModel.findOne({name: req.query.name})
    // var portofolio = await portofolioModel.findOne({name: "60/40"})
    // req.query.name provenant du nom du portefeuille sélectionné
    // console.log("portofolio:", portofolio)

    if(portofolio != null){
      portofolios = portofolio
    } else {
      portofolios = "Aucun portefeuille disponible"
    }

    res.json({portofolios}) // pour affichage des détails du portefeuille
  })


  // ------------------------------- introduction ------------------------------- //

router.get('/introduction', async function(req, res){
  var result = false
  var username;
  // console.log("--------------------------req.query.token:-----------------------------", req.query.token)
  var user = await userModel.findOne({token: req.query.token})

    if(user != null){
      username = user.username
      result = true
    }

    // console.log("--------------------------Username:-----------------------------", username)
  res.json({result, username}) // le result a un intérêt pour la mise en place de la sécurté//
})

module.exports = router;