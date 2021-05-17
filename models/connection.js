var mongoose = require('mongoose');

var options = {
    connectTimeoutMS: 5000,
    useUnifiedTopology : true,
    useNewUrlParser: true,
}

mongoose.connect('mongodb+srv://andrea:lacapsule@cluster0.joaey.mongodb.net/rocketinvesting?retryWrites=true&w=majority',
    options,
    function(err){
        console.log("BDD is working :", err);
    }
)

module.exports = mongoose