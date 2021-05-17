var mongoose = require('mongoose')

var actifSchema = mongoose.Schema({
    ticker : String, // code abrégé de l'actif donné par les marchés financiers
    repartition : Number, // répartition donnée de l'actif dans le portefeuille
    description : String, // descriptif courte du nom du ticker
    type : String, // action / obligation
   });

var portofolioSchema = mongoose.Schema({
    name: String, // nom général donné au portefeuille
    description: String, // descriptif du fonctionnement du portefeuille
    strategy: String, // active / passive
    risk: String, // prudent / modere / audacieux
    actifs: [actifSchema],  // utilisation de sous-documents pour récupération des actifs
    perf1 : String, // performances sur 1 an
    perf2 : String, // performances sur 2 ans
    perf5 : String, // performances sur 5 ans
    perfmax : String, // performances depuis création du ticker
    maxloss : String, // perte maximum relative maximum du portefeuille
    volatility : String, // volatilité du portefeuille
})

var portofolioModel = mongoose.model('portofolios', portofolioSchema)

module.exports = portofolioModel