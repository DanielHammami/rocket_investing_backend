const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: String, // nom ou pseudo du compte utilisateur
    password: String, // password du compte utilisateur
    token: String, // token du compte utilisateur
    portofoliosId: [{type: mongoose.Schema.Types.ObjectId, ref: 'portofolios'}], // utilisation de clé étrangère pour récupération des portefeuilles utilisateurs enregistrés en BDD
})

const userModel = mongoose.model('users', userSchema)

module.exports = userModel