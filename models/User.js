const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
