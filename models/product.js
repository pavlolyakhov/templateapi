const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//model
const productSchema = new Schema({
    AverageSellingUnitWeight: Number,
    ContentsMeasureType: String,
    ContentsQuantity: Number,
    UnitOfSale: Number,
    UnitQuantity: String,
    description: Object,
    id: { type: String, index: { unique: true } },
    image: String,
    name: String, 
    price: Number,
    tpnb: Number,
    unitprice : Number
});


//create class
const ProductClass = mongoose.model('product', productSchema);

// export
module.exports = ProductClass;
