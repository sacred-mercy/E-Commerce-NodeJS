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
        productCard.querySelector("#productImage").src = product.thumbnail;
        productCard.querySelector("#productName").innerText = product.title;
        productCard.classList.remove("hidden");
        productsContainer.appendChild(productCard);
    }
    console.log("current index: " + currentIndex);
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
                    document
                        .getElementById("LoadMoreBtn")
                        .classList.add("hidden");
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
            console.log(product);
            let dialog = document.getElementById("dialog");
            dialog.querySelector("#productImageDialog").src = product.thumbnail;
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

function showModal(id) {
    console.log(id);
    
}

function addToCart(button) {
    let card = button.closest(".card");
    let id = card.id;
    console.log(id);
}
