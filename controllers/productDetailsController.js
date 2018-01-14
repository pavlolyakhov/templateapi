const ProductDetails = require('../models/productDetails');

//const Product = require('../models/productDetails');

//exports.storeProduct = function (data, res, next) {
//    const id = data.id
//    if (!id) {
//        return res.status(422).send({ error: 'Product Id is missing' });
//    }

//    Product.findOne({ id: id }, function (err, existingProduct) {
//        if (err) {
//            console.log('error', err);
//            console.log('next function', next);
//            return next(err);
//        }
//        //if email exists return Error
//        if (existingProduct) {
//            console.log('existingProduct', existingProduct);
//            return res.status(200).send("Product found");
//            //return res.status(422).send({ error: 'Product already exist.' });
//        }
//        const product = new Product(data);
//        console.log('new product with schema', product);

//        product.save(function (err) {
//            if (err) {
//                console.log('Save error', err);
//                return next(err);
//            }
//            console.log("product Saved");
//            res.status(201).send({ "id": id });

//        });

//    });
//}