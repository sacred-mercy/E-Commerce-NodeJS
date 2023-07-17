const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");

const upload = multer({ dest: "uploads/product/" });

const db = require("../methods/db");

router
	.route("/products")
	.get((req, res) => {
		const sql = "SELECT * FROM products";
		db(sql)
			.then((result) => {
				res.send(result);
			})
			.catch((err) => {
				console.log(err);
			});
	})
	.put((req, res) => {
		const { id, title, price, description, brand, stock } = req.body;

		if (
			id === "" ||
			title === "" ||
			price === "" ||
			description === "" ||
			brand === "" ||
			stock === ""
		) {
			res.status(400).send("Please fill all the fields");
			return;
		}

		const sql = `UPDATE products SET title = '${title}', price = ${price}, description = "${description}", brand = '${brand}', stock = ${stock} WHERE id = ${id}`;
		db(sql)
			.then((result) => {
				res.send(result);
			})
			.catch((err) => {
				console.log(err);
			});
	})
	.post(upload.single("image"), (req, res) => {
		let reqData = JSON.parse(req.body.jsonData);
		reqData.thumbnail = req.file.filename;

		const { title, price, description, brand, stock, thumbnail } = reqData;

		if (
			title === "" ||
			price === "" ||
			description === "" ||
			brand === "" ||
			stock === "" ||
			thumbnail === ""
		) {
			res.status(400).send("Please fill all the fields");
			return;
		}

		const sql =
			`INSERT INTO products (title, price, description, brand, stock, thumbnail)` +
			` VALUES ('${title}', ${price}, '${description}', '${brand}', ${stock}, '${thumbnail}')`;

		db(sql)
			.then((result) => {
				let data = {
					id: result.insertId,
					thumbnail: reqData.thumbnail,
				};
				res.send(data);
			})
			.catch((err) => {
				console.log(err);
			});
	})
	.delete((req, res) => {
		const { id } = req.body;

		if (id === "") {
			res.status(400).send("Bad Request");
			return;
		}
		const sql = `DELETE FROM products WHERE id = ${id}`;
		db(sql)
			.then((result) => {
				// delete image from uploads/product
				fs.unlink(`uploads/product/${req.body.thumbnail}`, () => {
					res.send(result);
				});
			})
			.catch((err) => {
				console.log(err);
			});

		// delete this product from cart of all users
		const sql2 = `DELETE FROM cart_details WHERE product_id = ${id}`;
		db(sql2);
	});

module.exports = router;
