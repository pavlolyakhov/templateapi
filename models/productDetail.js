const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//model
const productDetailSchema = new Schema(
    {
        id: { type: String, index: { unique: true } },
        name : String
    },
    { strict: false }       // save all other data not present in predefined schema
);


//create class
const ProductDetailClass = mongoose.model('productDetail', productDetailSchema);

// export
module.exports = ProductDetailClass;
