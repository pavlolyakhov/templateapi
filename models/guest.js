const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//model
const guestUserSchema = new Schema({
    
}, { strict: false });


//create class
const GuestUserClass = mongoose.model('guestUsers', guestUserSchema);

// export
module.exports = GuestUserClass;
