var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');


var userSchema = new mongoose.Schema({
   username: String,
   password: String,
   role: String,
   hasVoted: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Poll"
      }   
   ],
   polls: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Poll"
      }   
   ]
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);