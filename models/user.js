// make userSchema to store the user info using the passport
// passport tool provide the some methods & it's implementation is hidden by def.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const localPassportMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        require: true,
        unique: true
    }
});
// paasportlocalmongoose add directly username & password into our model
userSchema.plugin(localPassportMongoose);

module.exports = mongoose.model('User', userSchema);