let productCardTemplate = document.getElementById("productCard");
productCardTemplate.remove();
productCardTemplate.classList.remove("hidden");

let productCardContainer = document.getElementById("productsContainer");

let xhr = new XMLHttpRequest();
xhr.open("GET", "/api/products", true);
xhr.send();
xhr.onload = () => {
	if (xhr.status === 200) {
		let products = JSON.parse(xhr.responseText);
		products.forEach((product) => {
			let productCard = productCardTemplate.cloneNode(true);
			productCard.id = product.id;
			productCard.querySelector("#productName").value = product.title;
			productCard.querySelector("#productPrice").value = product.price;
			productCard.querySelector("#productDescription").value =
				product.description;
			productCard.querySelector("#productBrand").value = product.brand;
			productCard.querySelector("#productQuantity").value = product.stock;
			productCard.querySelector("#productImage").src =
				"product/" + product.thumbnail;
			productCardContainer.appendChild(productCard);
		});
	}
};

// function to get safe value from input
function getSafeValue(value) {
	value = value.trim();
	return value;
}

// function to check if given all arguments are empty or not
function isEmpty(...args) {
	for (let i = 0; i < args.length; i++) {
		let value = getSafeValue(args[i]);
		if (value === "") {
			return true;
		}
	}
	return false;
}

function updateProduct(button) {
	let productCard = button.parentElement.parentElement.parentElement;

	const id = productCard.id;
	const title = productCard.querySelector("#productName").value;
	const price = productCard.querySelector("#productPrice").value;
	const description = productCard.querySelector("#productDescription").value;
	const brand = productCard.querySelector("#productBrand").value;
	const stock = productCard.querySelector("#productQuantity").value;

	if (isEmpty(id, title, price, description, brand, stock)) {
		window.alert("Please fill all the fields");
		return;
	}

	let product = {
		id: id,
		title: title,
		price: price,
		description: description,
		brand: brand,
		stock: stock,
	};
	let xhr = new XMLHttpRequest();
	xhr.open("PUT", "/api/products", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(JSON.stringify(product));
	xhr.onload = () => {
		if (xhr.status === 200) {
			alert("Product updated successfully");
		}
		if (xhr.status === 400) {
			alert(xhr.responseText);
		}
	};
}

function addProduct() {
	const image = document.querySelector("#image").files[0];
	if (image === undefined) {
		window.alert("Please select an image");
		return;
	}
	let title = document.querySelector("#name").value;
	let price = document.querySelector("#price").value;
	let description = document.querySelector("#description").value;
	let brand = document.querySelector("#brand").value;
	let stock = document.querySelector("#quantity").value;

	if (isEmpty(title, price, description, brand, stock)) {
		window.alert("Please fill all the fields");
		return;
	}

	const product = {
		title: title,
		price: price,
		description: description,
		brand: brand,
		stock: stock,
	};
	const formData = new FormData();
	formData.append("image", image);
	formData.append("jsonData", JSON.stringify(product));
	let xhr = new XMLHttpRequest();
	xhr.open("POST", "/api/products", true);
	xhr.send(formData);
	xhr.onload = () => {
		if (xhr.status === 200) {
			let responseData = JSON.parse(xhr.responseText);
			let productCard = productCardTemplate.cloneNode(true);
			productCard.id = responseData.id;
			productCard.querySelector("#productName").value = title;
			productCard.querySelector("#productPrice").value = price;
			productCard.querySelector("#productDescription").value = description;
			productCard.querySelector("#productBrand").value = brand;
			productCard.querySelector("#productQuantity").value = stock;
			productCard.querySelector("#productImage").src =
				"product/" + responseData.thumbnail;
			productCardContainer.appendChild(productCard);

			// Clear the form
			document.querySelector("#name").value = "";
			document.querySelector("#price").value = "";
			document.querySelector("#description").value = "";
			document.querySelector("#brand").value = "";
			document.querySelector("#quantity").value = "";
			document.querySelector("#image").value = "";
		}
		if (xhr.status === 400) {
			alert(xhr.responseText);
		}
	};
}

function deleteProduct(button) {
	let productCard = button.parentElement.parentElement.parentElement;
	let id = productCard.id;
	let xhr = new XMLHttpRequest();
	xhr.open("DELETE", "/api/products", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	let image = productCard.querySelector("#productImage").src;
	image = image.substring(image.lastIndexOf("/") + 1);

	xhr.send(JSON.stringify({ id: id, thumbnail: image }));
	xhr.onload = () => {
		if (xhr.status === 200) {
			productCard.remove();
		}
	};
}
