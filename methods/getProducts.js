let db = require("./db.js");

function getProducts(from) {
    return new Promise((resolve, reject) => {
        db(`SELECT * FROM products LIMIT ${from},5`)
            .then((result) => {
                let products = [];
                for (let i = 0; i < result.length; i++) {
                    let product = {
                        id: result[i].id,
                        title: result[i].title,
                        price: result[i].price,
                        brand: result[i].brand,
                        description: result[i].description,
                        thumbnail: result[i].thumbnail,
                    };
                    products.push(product);
                }
                resolve(products);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

function getNumberOfProducts() {
    return new Promise((resolve, reject) => {
        db(`SELECT COUNT(*) AS count FROM products`)
            .then((result) => {
                resolve(result[0].count);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

module.exports = { getProducts, getNumberOfProducts };
