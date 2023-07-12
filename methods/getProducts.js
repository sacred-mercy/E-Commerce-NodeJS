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

function getProduct(id) {
    return new Promise((resolve, reject) => {
        db(`SELECT * FROM products WHERE id = ${id}`)
            .then((result) => {
                let product = {
                    id: result[0].id,
                    title: result[0].title,
                    price: result[0].price,
                    brand: result[0].brand,
                    description: result[0].description,
                    thumbnail: result[0].thumbnail,
                };
                resolve(product);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

module.exports = { getProducts, getNumberOfProducts, getProduct };
