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

  // recherche et récupération d'un User existant dasns la BDD depuis l'input du front
  const data = await userModel.findOne({username: req.body.usernameFromFront})

  // si la variable data n'est pas "null" alors l'utilisateur existe ==> Affichage du texte "utilisateur deja présent"
  if(data != null){
    error.push('utilisateur déjà présent')
  }

  // si les input provenant du front sont vides ==> Affichage du texte "champs vides"
  if(req.body.usernameFromFront == '' || req.body.passwordFromFront == ''){
    error.push('champs vides')
  }

  // si le tableau Error est vide ==> codage du nouveau password grâce à la fonction de hashage et création d'un token User
  if(error.length == 0){
    var hash = bcrypt.hashSync(req.body.passwordFromFront, 10);
    var newUser = new userModel({
      username: req.body.usernameFromFront,
      password: hash,
      token: uid2(32),
    })
    saveUser = await newUser.save() // sauvegarde du User en BDD

    // condition de vérification de l'enregistrement du User en BDD et renvoie du token au front (json)
    if(saveUser){
      result = true
      token = saveUser.token
    }
  }

  res.json({result, saveUser, error, token}) // retour des données au front par res.json
  });

  // ------------------------------- Sign-In POST ------------------------------- //
  router.post('/sign-in', async (req, res) => {

    var result = false
    var user = null
    var error = []
    var token = null

    // si les input provenant du front sont vides ==> Affichage du texte "champs vides"
    if(req.body.usernameFromFront == '' || req.body.passwordFromFront == ''){
      error.push('champs vides')
    }

    // si le tableau Error est vide ==> recherche du User dans la BDD grace à l'input du front
    if(error.length == 0){
    user = await userModel.findOne({username: req.body.usernameFromFront,})

      // si User existe ==> décodage du nouveau password grâce à la fonction de hashage et récupération du token User
      // sinon affichage de "Mot de passe incorrect"
      if(user){
        if(bcrypt.compareSync(req.body.passwordFromFront, user.password)){
          result = true
          token = user.token
        } else {
          result = false
          error.push('mot de passe incorrect')
        }

        //  Si User n'existe pas ==> Affichage du texte "utilisateur inconnu"
      } else {
        error.push('utilisateur inconnu')
      }
    }

    res.json({result, user, error, token}) // retour des données au front par res.json
  });

  // ------------------------------ Wishlist GET ------------------------------ //
  router.get('/wishlist', async (req, res) => {
    var result = false
    var username;
    var portofolios = "Aucun portefeuille enregistré"
    
    // recherche et récupération du User dans la BDD grace au token envoyé depuis le fetch du front (portofolioScreen ou wishlistScreen)
    var user = await userModel.findOne({token: req.query.token})

    // Si User existe ==> assigner le nom du User à la variable username pour renvoie au front
    if(user != null){
      username = user.username

      // Si la propriété "portofoliosId" n'est pas vide et contient bien un tableau avec des clé étangères,
      // on récupère le User grace à l'identification du token depuis le front et on viens lire l'ensemble des data du User
      // + les données comprises dans les clés étrangères grace à la fonction populate().
      if(user.portofoliosId.length >= 1){
        portofolios = await userModel.findOne({token: req.query.token})
                                              .populate('portofoliosId')
                                              .exec()
        // populate() pour lire les propriétés de portofoliosId
        result = true
      }
    }

    res.json({portofolios, result, username})  // retour des données au front par res.json
  })

  // ------------------------------ Wishlist POST ------------------------------ //
  router.post('/wishlist', async function(req, res){
    var result = false
    var userName;
    var isValid = false

    // recherche et récupération du User dans la BDD grace au token envoyé depuis le fetch du front (portofolioScreen)
    var user = await userModel.findOne({token: req.body.token})

    // Si User existe
    if(user != null){

      // condition de vérification si l'_ID du portefeuille sélectionné est deja enregistré chez le USer en BDD
      for (let i=0; i<user.portofoliosId.length; i++){
        if(req.body._idFront == user.portofoliosId[i]){
          isValid = true // si l'_ID du portefeuille existe deja on passe la variable IsValid à True sinon elle reste False
        }
      }

      // Si la variable isValid est false ==> Enregistrement de l'_ID clé étangère dans User en BDD
      if(!isValid) {
        user.portofoliosId.push({_id: req.body._idFront}) // _id = objectId du portefeuille sélectionné
        var userSave = await user.save()

        // condition de vérification de l'enregistreme,nt en BDD et renvoie au front du nom du User
        if(userSave.username){
          result = true
          userName = userSave.username
        }
      }

    }

    res.json({result, userName, isValid})  // retour des données au front par res.json
  })

  // ------------------------------ Wishlist DELETE ------------------------------ //
  router.delete('/wishlist', async function(req,res){
    var result = false

    // recherche et récupération du User dans la BDD grace au token envoyé depuis le fetch du front (wishlistScreen)
    var user = await userModel.findOne({token: req.body.token})

    // si User exuste ==> on supprime la propriété clé étrangère de User correspondante 
    // à la position du tableau renvoyé depuis le front (map sur dataPortofolio dans wishlistScreen)
    if(user != null){
      user.portofoliosId.splice(req.body.position,1)

      var userSave = await user.save()

      if(userSave.username){
        result = true
      }
    }

    res.json({result})  // retour des données au front par res.json
  })


  // ------------------------------- Strategy POST------------------------------- //

  router.post('/strategy', async (req, res) => {
    var strategyFomFrontend = req.body.strategy

    // recherche et récupération des données de portofolio dans la BDD
    var strategyData = await portofolioModel.find({ strategy: strategyFomFrontend })

    // get wallet name ==> Récupération des noms de portefeuilles dans un tableau nommé profilName
    // pour affichage dans strategyScreen suivant le type de stratégie Active ou passive.
    var profilName = []

    for (var i = 0; i < strategyData.length; i += 1) {
      profilName.push(strategyData[i].name)
    }

    res.json({ profilName })  // retour des données au front par res.json
  })

  // ------------------------------- Portofolio GET ------------------------------- //
  router.get('/portofolio', async (req, res) => {

    var portofolios = []

    // recherche et récupération du portefeuille dans la BDD grace au nom de clui-ci envoyé depuis
    // le fetch du front (portofolioScreen)
    var portofolio = await portofolioModel.findOne({name: req.query.name})
    // req.query.name provenant du nom du portefeuille sélectionné

    // condition de vérification si portofolio existe
    if(portofolio != null){
      portofolios = portofolio
    } else {
      portofolios = "Aucun portefeuille disponible"
    }

    res.json({portofolios})  // retour des données au front par res.json
  })


// ------------------------------- introduction GET ------------------------------- //
router.get('/introduction', async function(req, res){
  var result = false
  var username;

  // recherche et récupération du User dans la BDD grace au token envoyé depuis le fetch du front (introductionScreen)
  var user = await userModel.findOne({token: req.query.token})

    // Si le User existe ==> renvoie au front du nom du USer pour affichage
    if(user != null){
      username = user.username
      result = true
    }

  res.json({result, username})  // retour des données au front par res.json
})

module.exports = router;