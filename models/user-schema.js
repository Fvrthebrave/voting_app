var mongoose = require('mongoose');


var userSchema = new mongoose.Schema({
   username: String,
   password: String,
   role: String,
   hasVoted: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Poll"
      }   
   ]
});


module.exports = mongoose.model("User", userSchema);