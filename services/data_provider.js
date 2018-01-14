const axios = require('axios');
const config = require('../config');
const getProductDetails = require('../controllers/productController').getProductDetails;
const getProductFromDb = require('../controllers/productController').getProductFromDb;
const saveUsableProductDetails = require('../controllers/productController').saveUsableProductDetails;
const findUsableProducts = require('../controllers/productController').findUsableProducts;
const tescoSearchApi = config.tescoSearchApiUrl;

function dataProvider() {
    this.requestProducts = function (data, res) {
        return new Promise((resolve, reject) => {
            // search db for existing products, with offset
            // if no products is found in db, get axios to tesco
            // search db must return a promise
            return getProductFromDb(data)
                .then(result => {
                    if (result.length > 0) {
                        const usableObj = {};
                        result.reduce(function (previousValue, currentValue) {
                            const id = currentValue._doc.id;
                            usableObj[id] = currentValue._doc;
                        }, usableObj);
                        const payloadObject = { usableObj };
                        resolve(payloadObject);
                    }
                    else {                  // no more products in db, get from tesco
                        console.log("not found in db");

                        const { searchText, searchOffset, searchTake } = data;
                        const getProductsRequest = `${tescoSearchApi}query=${searchText}&offset=${searchOffset}&limit=${searchTake}`;
                        axios.get(getProductsRequest, {
                            headers: { "Ocp-Apim-Subscription-Key": config.tescoApiKey }
                        })
                            .then(async function (response) {
                                const results = response.data.uk.ghs.products.results;          // array
                                console.log(results);
                                //async await here
                                const foundProducts = await getProductDetails(results, res);
                                console.log('foundProducts');
                                console.log(foundProducts);
                                return foundProducts;
                                //res.send(results);
                            })

                            .then((foundProducts) => {
                                return findUsableProducts(foundProducts);
                            })
                            .then(foundUsableProducts => {
                                saveUsableProductDetails(foundUsableProducts);
                                return foundUsableProducts;
                            })
                            .then(results => {
                                resolve(results);
                            })
                            .catch(e => {
                                debugger;
                                console.log("Error getting usable products")
                                console.log(e);
                                reject(e)
                            });
                    }
                }).catch(e => {
                    debugger;
                    reject("reject whole request");
                });
        })
    }
}


module.exports = new dataProvider();

// return {products : [
                //    {[id] : { generic : generic, details: details  }},
                //    {[id] : { generic : generic, details: details  }},
                //    {[id] : { generic : generic, details: details  }},
                //]}