let db = require("./db.js");

function getCart(email) {
    return new Promise((resolve, reject) => {
        db("SELECT * FROM cart WHERE user_email = '" + email + "'")
            .then(async (result) => {
                if (result.length === 0) {
                    let row = await createCart(email);
                    result = row;
                }
                resolve(result[0].id);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

function createCart(email) {
    return new Promise((resolve, reject) => {
        db(
            "INSERT INTO cart(user_email) VALUES ('" + email + "')",
            (err, row) => {
                if (err) {
                    reject(false);
                } else {
                    resolve(row);
                }
            }
        );
    });
}

function getCartItems(cartId) {
    return new Promise((resolve, reject) => {
        db("SELECT * FROM cart_details WHERE cart_id = '" + cartId + "'")
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

function addItem(cartId, productId) {
    return new Promise((resolve, reject) => {
        db(
            `INSERT INTO cart_details(cart_id, product_id, qty) VALUES ('${cartId}', '${productId}', 1)`
        )
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

function getProductStock(productId) {
    return new Promise((resolve, reject) => {
        db(`SELECT stock FROM products WHERE id = ${productId}`)
            .then((result) => {
                resolve(result[0].stock);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

async function changeQuantity(cartDetailId, qty, productId) {
    // check if product stock is enough
    let stock = await getProductStock(productId);
    if (qty > stock) {
        return false;
    }
    return new Promise((resolve, reject) => {
        db(`UPDATE cart_details SET qty = ${qty} WHERE id = ${cartDetailId}`)
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

async function getCartDetailId(product_id, email) {
    let cart_id = await getCart(email);
    return new Promise((resolve, reject) => {
        db(
            `SELECT id FROM cart_details WHERE cart_id = ${cart_id} AND product_id = ${product_id}`
        )
            .then((result) => {
                resolve(result[0].id);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

function deleteCartItem(cartDetailId) {
    return new Promise((resolve, reject) => {
        db(`DELETE FROM cart_details WHERE id = ${cartDetailId}`)
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

module.exports = {
    getCart: getCart,
    createCart: createCart,
    getCartItems: getCartItems,
    addItem: addItem,
    changeQuantity: changeQuantity,
    getCartDetailId: getCartDetailId,
    deleteCartItem: deleteCartItem,
};
