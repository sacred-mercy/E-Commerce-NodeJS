let productCardTemplate = document.getElementById("productCard");
productCardTemplate.remove();

let currentIndex = 0;
const productObject = [];

// fetch first 5 products from database folder using ajax
let productsData;
let xhr = new XMLHttpRequest();
xhr.open("POST", "/products", true);
xhr.setRequestHeader("Content-Type", "application/json");
xhr.send(JSON.stringify({ from: currentIndex }));
xhr.onload = () => {
    if (xhr.status === 200) {
        productsData = JSON.parse(xhr.response);
        loadProducts(productsData.products);
        if (productsData.numberOfProducts - currentIndex === 0) {
            document.getElementById("LoadMoreBtn").classList.add("hidden");
        }
        if (productsData.numberOfProducts === 0) {
            document.getElementById("productsContainer").innerText =
                "No products found";
        } else {
            document.getElementById("LoadMoreBtn").classList.remove("hidden");
        }
    }
};

function loadProducts(products) {
    let productsContainer = document.getElementById("productsContainer");
    currentIndex += products.length;
    for (let product of products) {
        productObject.push(product);
        let productCard = productCardTemplate.cloneNode(true);
        productCard.id = product.id;
        productCard.querySelector("#productImage").src =
            "product/" + product.thumbnail;
        productCard.querySelector("#productName").innerText = product.title;
        // productCard.querySelector(".addToCartClass").innerText = ;
        productCard.classList.remove("hidden");
        productsContainer.appendChild(productCard);
    }
}

function loadMore() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/products", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ from: currentIndex }));
    xhr.onload = () => {
        if (xhr.status === 200) {
            productsData = JSON.parse(xhr.response);
            loadProducts(productsData.products);
            if (productsData.numberOfProducts - currentIndex === 0) {
                document.getElementById("LoadMoreBtn").classList.add("hidden");
            }
        }
    };
}

function showDialog(button) {
    // find the nearest card to the button
    let card = button.closest(".card");
    let id = parseInt(card.id);
    for (let product of productObject) {
        if (product.id === id) {
            let dialog = document.getElementById("dialog");
            dialog.querySelector("#productImageDialog").src =
                "product/" + product.thumbnail;
            dialog.querySelector("#productNameDialog").innerText =
                product.title;
            dialog.querySelector("#productBrandDialog").innerText =
                product.brand;
            dialog.querySelector("#productPriceDialog").innerText =
                product.price;
            dialog.querySelector("#productDescriptionDialog").innerText =
                product.description;
            window.dialog.showModal();
            break;
        }
    }
}

function addToCart(button) {
    let card = button.closest(".card");
    let id = card.id;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/cart/addToCart", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ id: id }));
    xhr.onload = () => {
        if (xhr.status === 200) {
            if (xhr.response === "notLoggedIn") {
                window.location.href = "/login";
                return;
            }
            if (xhr.response === "Out of stock") {
                alert("Maximum quantity reached");
                return;
            }

            alert(`Added to cart. Total quantity in cart: ${xhr.response}`);
        }
    };
}
