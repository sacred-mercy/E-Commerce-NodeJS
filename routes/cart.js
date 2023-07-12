const express = require("express");
const router = express.Router();

// include methods\cart.js
const cart = require("../methods/cart");
const { getProduct } = require("../methods/getProducts");

router.get("/cart", async (req, res) => {
    // check if user is logged in
    if (!req.session.isLoggedIn) {
        res.redirect("login");
        return;
    }
    res.render("cart", {
        username: req.session.name,
    });
});

router.get("/getCart", async (req, res) => {
    // check if user is logged in
    if (!req.session.isLoggedIn) {
        res.send("login");
        return;
    }
    const user_email = req.session.email;
    const cartId = await cart.getCart(user_email);
    const cartItems = await cart.getCartItems(cartId);
    let products = [];
    for (let item of cartItems) {
        let product = await getProduct(item.product_id);
        product.qty = item.qty;
        products.push(product);
    }
    res.send(products);
});

router.post("/addToCart", async (req, res) => {
    // check if user is logged in
    if (!req.session.isLoggedIn) {
        res.send("login");
        return;
    }

    const id = req.body.id;
    const user_email = req.session.email;
    const cartId = await cart.getCart(user_email);
    const cartItems = await cart.getCartItems(cartId);
    for (let item of cartItems) {
        if (parseInt(item.product_id) === parseInt(id)) {
            await cart.changeQuantity(
                parseInt(item.id),
                parseInt(item.qty) + 1
            );
            let qty = parseInt(item.qty) + 1;
            qty = qty.toString();
            res.send(qty);
            return;
        }
    }
    await cart.addItem(cartId, id);
    res.send("1");
});

router.post("/changeCartQty", async (req, res) => {
    // check if user is logged in
    if (!req.session.isLoggedIn) {
        res.send("login");
        return;
    }

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
    // check if user is logged in
    if (!req.session.isLoggedIn) {
        res.send("login");
        return;
    }

    const productId = req.body.id;
    let cartDetailId = await cart.getCartDetailId(productId, req.session.email);
    await cart.deleteCartItem(cartDetailId);
    res.status(200).send("OK");
});

module.exports = router;
