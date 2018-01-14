const _ = require('lodash');
const Product = require('../models/product');
const ProductDetail = require('../models/productDetail');
const axios = require('axios');
const config = require('../config');
const tescoProductDataApi = config.tescoProductDataApiUrl;


exports.getProductDetails = function (productsArray, res, next) {
    if (productsArray.length < 1) {
        return res.status(422).send({ error: 'Products not found' });
    }
    let usableResults = [];
    const unusableIndexes = [];

    usableResults = _.map(productsArray, _.clone);
    console.log('usableResults', usableResults);
    
    return new Promise(function (resolve, reject) {
        const waitingArr = [];
        productsArray.forEach((item, i) => {
            //setTimeout(function () {
                console.log("get details with delay");
            const tpnb = item.tpnb;
            const getProductDataRequest = `${tescoProductDataApi}tpnb=${tpnb}`;    //const TESCO_PRODUCT_API = `https://dev.tescolabs.com/product/?tpnb=${tpnb}`;
                axios.get(getProductDataRequest, { headers: { "Ocp-Apim-Subscription-Key": config.tescoApiKey } })
                    .then((productResponse) => {
                        waitingArr.push(i);
                        try {
                            const foundItem = productResponse.data.products[0];
                            const kcalPer100 = foundItem.calcNutrition.calcNutrients[1].valuePer100;    // fails and triggers catch block
                            const unitOfSale = usableResults[i].UnitOfSale;
                            const quantity = (foundItem.qtyContents) ? foundItem.qtyContents.quantity : "";
                            let weightUnits = (foundItem.qtyContents) ? foundItem.qtyContents.quantityUom : "per 100g";
                            usableResults[i].kcalPer100 = kcalPer100;
                            usableResults[i].weightUnits = weightUnits;
                            usableResults[i].quantity = quantity;

                            if (unitOfSale === 1) {                                        // packaged
                                if (weightUnits.toLowerCase() === "kg") {
                                    const totalEnergy = Math.round(quantity * 10 * kcalPer100);
                                    usableResults[i].productEnergy = totalEnergy;
                                }
                                else if (weightUnits.toLowerCase() === "g") {
                                    const totalEnergy = Math.round(quantity / 100 * kcalPer100);
                                    usableResults[i].productEnergy = totalEnergy;
                                }
                                else if (weightUnits.toLowerCase() === "ml") {
                                    const totalEnergy = Math.round(quantity / 100 * kcalPer100);
                                    usableResults[i].productEnergy = totalEnergy;
                                }
                                else if (weightUnits.toLowerCase() === "l") {
                                    const totalEnergy = Math.round(quantity * 10 * kcalPer100);
                                    usableResults[i].productEnergy = totalEnergy;
                                }
                                else {
                                    throw new Error("Error unitOfSale 1");
                                }
                            }
                            else if (unitOfSale === 3) {                                   // loose
                                if (weightUnits.toLowerCase() === "per 100g") {
                                    const totalEnergy = Math.round(kcalPer100);
                                    usableResults[i].productEnergy = totalEnergy;
                                }
                                else {
                                    throw new Error("Error unitOfSale 2");
                                }
                            }
                            else if (unitOfSale === 2) {                                   // single item
                                if (weightUnits.toLowerCase() === "sngl") {
                                    const AverageSellingUnitWeight = usableResults[i].AverageSellingUnitWeight
                                    const averageEnergyPerItem = kcalPer100 * 10 * AverageSellingUnitWeight;
                                    let totalEnergy = Math.round(averageEnergyPerItem);
                                    usableResults[i].productEnergy = totalEnergy;
                                    usableResults[i].weightUnits = 'item';                   // rename SNGL to item
                                }
                                else {
                                    throw new Error("Error unitOfSale 3");
                                }
                            }
                        }
                        catch (e) {
                            unusableIndexes.push(i);
                        }
                        finally {
                            console.log("axios finally with delay");

                            if (waitingArr.length === productsArray.length) {
                                resolve([unusableIndexes, usableResults]);
                            }
                        }
                    })      // then
                    .catch(error =>
                    {
                        console.log(error); 
                        reject(error)
                    });
            //}, 3000);
        });      // for each
    })           // promise
}

exports.getProductFromDb = function (data) {
    const { searchText, searchOffset, searchTake } = data;
    return new Promise((resolve, reject) => {
        ProductDetail.find({ 'name': { $regex: new RegExp("^" + searchText, "i") } })
            .limit(searchTake)
            .skip(searchOffset)
            .exec(
            function (err, docs) {
                if (err) {
                    reject('find product in db failed');
                }
                console.log(docs);
                resolve(docs);
            })
        });
        //ProductDetail.find({ 'name': { $regex: new RegExp("^" + searchText, "i") } }, function (err, docs) {
        //    debugger;
        //    if (err) {
        //        reject('find product in db failed');
        //    }
        //    docs.
        //    console.log(docs);
        //    resolve(docs);
        //});
    };


exports.saveUsableProductDetails = function (foundProducts) {
    return new Promise((resolve, reject) => {
        try {
            const inserted = Object.keys(foundProducts.usableObj).map(key => foundProducts.usableObj[key]);     //convert to array to insert into db.
            console.log("insert:", foundProducts.usableObj);
            const insert = ProductDetail.insertMany(inserted);
            insert.then(() => {
                resolve(foundProducts);
            })
            .catch((e) => {
                console.log("insertMany", insert);
                console.log("rejected", insert.emitted.reject);
                reject(e);
            })
        }
        catch (e) {
            console.log('insert failed', e);
            debugger;
            reject();     // resolve in any case , if save failed just log it.
        }
    });
}

exports.findUsableProducts = function (found) {
    try {
        //debugger;
        const unusableIndexes = found[0], usableResults = found[1];
        unusableIndexes.sort();
        for (let y = unusableIndexes.length - 1; y >= 0; y--) {
            usableResults.splice(unusableIndexes[y], 1);
        }
        const usableObj = {};
        usableResults.reduce(function (previousValue, currentValue) {
            usableObj[currentValue.id] = currentValue;
        }, usableObj);
        const payloadObject = { usableObj };
        return payloadObject;
    }
    catch (e) {
        throw new Error("Error converting to usable object");
    }
}


//exports.findUsableProducts = function (found) {
//    return new Promise((resolve, reject) => {
//        try {

//            const unusableIndexes = found[0], usableResults = found[1];
//            unusableIndexes.sort();
//            for (let y = unusableIndexes.length - 1; y >= 0; y--) {
//                usableResults.splice(unusableIndexes[y], 1);
//            }
//            const usableObj = {};
//            usableResults.reduce(function (previousValue, currentValue) {
//                usableObj[currentValue.id] = currentValue;
//            }, usableObj);
//            //const payloadObject = { usableObj, searchText, searchOffset }
//            const payloadObject = { usableObj };
//            resolve(payloadObject);
//        }
//        catch (e) {
//            reject('findUsableProducts failed');
//        }
//    });
//}

//function cacheResults(usableObj) {
//    ProductDetail.findOne({ id: id }, function (err, existingProduct) {
//        if (err) {
//            console.log('error', err);
//            console.log('next function', next);
//            //return next(err);
//            //return;
//        }
//        if (existingProduct) {
//            console.log('existingProduct', existingProduct);
//            return ;
//        }
//        const productDetail = new ProductDetail(data);

//        productDetail.save(function (err) {
//            if (err) {
//                console.log('productDetail save error', err);
//                //  return next(err);
//                return;
//            }
//            console.log("productDetail Saved");
//            return;
//        });
//    });
//}