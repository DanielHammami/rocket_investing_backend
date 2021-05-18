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
        error.push('email incorrect')
      }
    }
    
    res.json({result, user, error, token})
  });
  
  // ------------------------------ Whishlist ------------------------------ //
  // find(+ filtre par le token) en BDD 
  // Affichage des portefeuilles en front
  router.get('/wishlist', async (req, res) => {

    var portofolios = []
    var user = await userModel.findOne({token: req.query.token})
    
    if(user != null){
      if(user.portofoliosId != null){
        portofolios = await userModel.findOne({token: req.query.token})
                                              .populate(portofoliosId)
                                              .exec()
        // populate() pour lire les propriétés de portofoliosId
      } else {
        portofolios = "Aucun portefeuille enregistré"
      } 
    }
  
    res.json({portofolios}) // pour affichage des portefeuilles dans "Mes favoris"
  })

  // # insertion
  // db.contacts.insert({ first: 'Quentin', last: 'Busuttil' })
  router.post('/wishlist', async function(req, res){
    var result = false

    var user = await userModel.findOne({token: req.body.token})

    if(user != null){
      user.portofoliosId.push(req.query._idFront)
      // _id = objectId du portefeuille sélectionné

      var userSave = await user.save()

      if(userSave.username){
        result = true
      }
    }

    res.json({result})
  })

  // # effacer un document
  // db.contacts.remove({ _id: ObjectId("55accc6c039c97c5db42f192") })
  router.delete('/wishlist/:position', async function(req,res){
    var result = false
    var user = await userModel.findOne({token: req.body.token})
  
    if(user != null){
      user.portofoliosId.splice(req.params.position,1)
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
  // req.query/body?.value (select)
  // find(filtre stratégie: active ou passive) en BDD
  // Affichage des portefeuilles actif ou passif en front
  router.get('/strategy', async (req, res) => {

    var strategys = []
    var strategy = await portofolioModel.find({strategy: req.query.strategy})
    // req.query.stratgy provenant du SELECT(input)
    // retour de 3 schémas ==> ACTIVE / PASSIVE
    
    if(strategy != null){
      strategys = strategy
    } else {
      strategys = "Aucune stratégie disponible"
    }
  
    res.json({strategys}) // pour affichage des portefeuilles dans "Stratégie Active/passive"
  })
  
  // ------------------------------- Portofolio ------------------------------- //
  // find(filtre selection portofolio) en BDD
  // Affichage des données page 08 à 11
  router.get('/portofolio', async (req, res) => {

    var portofolios = []
    var portofolio = await portofolioModel.findOne({name: req.query.name})
    // req.query.name provenant du nom du portefeuille sélectionné
    
    if(portofolio != null){
      portofolios = portofolio
    } else {
      portofolios = "Aucun portefeuille disponible"
    }
  
    res.json({portofolios}) // pour affichage des détails du portefeuille
  })


module.exports = router;





router.get('/introduction', async function(req, res){
  var result = false
  var username;  
  var user = await userModel.findOne({token: req.query.token})
  
    if(user != null){
     
      username = user.username

      result = true
      
    }
    console.log("--------------------------Username:-----------------------------", username)
  res.json({result, username})
})