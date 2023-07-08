let db = require("./db.js");

function getProducts() {
    return new Promise((resolve, reject) => {
        db("SELECT * FROM products")
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

module.exports = { getProducts };
