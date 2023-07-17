const express = require("express");
const router = express.Router();

// include methods
const cart = require("../methods/cart");
const { getProduct } = require("../methods/getProducts");

const checkAuth = require("../middleware/checkAuth");

router.post("/addToCart", async (req, res) => {
    // check if user is logged in
    if (!req.session.isLoggedIn) {
        res.status(200).send("notLoggedIn");
        return;
    }
    const id = req.body.id;
    const user_email = req.session.email;
    const cartId = await cart.getCart(user_email);
    const cartItems = await cart.getCartItems(cartId);
    for (let item of cartItems) {
        if (parseInt(item.product_id) === parseInt(id)) {
            let result = await cart.changeQuantity(
                parseInt(item.id),
                parseInt(item.qty) + 1,
                parseInt(item.product_id)
            );
            if (result === false) {
                res.status(200).send("Out of stock");
                return;
            }
            let qty = parseInt(item.qty) + 1;
            qty = qty.toString();
            res.send(qty);
            return;
        }
    }
    await cart.addItem(cartId, id);
    res.send("1");
});

router.use(checkAuth.checkLoggedIn);

router.get("/", async (req, res) => {
    res.render("cart", {
        username: req.session.name,
    });
});

router.get("/getCart", async (req, res) => {
    const user_email = req.session.email;
    const cartId = await cart.getCart(user_email);
    const cartItems = await cart.getCartItems(cartId);
    let products = [];
    for (let item of cartItems) {
        let product = await getProduct(item.product_id);
        if (product === false) {
            continue;
        }
        product.qty = item.qty;
        products.push(product);
    }
    res.send(products);
});

router.post("/changeCartQty", async (req, res) => {
    const productId = req.body.id;
    const qty = req.body.qty;

    let cartDetailId = await cart.getCartDetailId(productId, req.session.email);
    let result = await cart.changeQuantity(cartDetailId, qty, productId);
    if (result === false) {
        res.status(200).send("Out of stock");
    } else {
        res.status(200).send("OK");
    }
});

router.post("/deleteCartItem", async (req, res) => {
    const productId = req.body.id;
    let cartDetailId = await cart.getCartDetailId(productId, req.session.email);
    await cart.deleteCartItem(cartDetailId);
    res.status(200).send("OK");
});

module.exports = router;
