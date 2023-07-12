let productCardTemplate = document.getElementById("productCard");
productCardTemplate.remove();

const productObject = [];

// fetch cart items from database using ajax
let cartItems;
let xhr = new XMLHttpRequest();
xhr.open("GET", "/getCart", true);
xhr.send();
xhr.onload = () => {
    if (xhr.status === 200) {
        cartItems = JSON.parse(xhr.response);
        loadCartItems(cartItems);
        if (cartItems.length === 0) {
            document.getElementById("emptyCart").classList.remove("hidden");
        }
    }
};

function showDialog(button) {
    // find the nearest card to the button
    let card = button.closest(".card");
    let id = parseInt(card.id);
    for (let product of productObject) {
        if (product.id === id) {
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

function loadCartItems(cartItems) {
    for (let item of cartItems) {
        productObject.push(item);
        let productCard = productCardTemplate.cloneNode(true);
        productCard.id = item.id;
        productCard.querySelector("#productImage").src = item.thumbnail;
        productCard.querySelector("#productName").innerText = item.title;
        productCard.querySelector("#productQty").innerText = item.qty;
        productCard.classList.remove("hidden");
        productsContainer.appendChild(productCard);
    }
}

function changeQty(button, isIncrease) {
    let productCard = button.parentElement.parentElement.parentElement;
    let id = productCard.id;
    let qty = productCard.querySelector("#productQty");
    let qtyValue = parseInt(qty.innerText);
    if (isIncrease) {
        qtyValue++;
    } else {
        qtyValue--;
    }
    if (qtyValue === 0) {
        deleteProduct(button);
        return;
    }
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/changeCartQty", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(
        JSON.stringify({
            id: id,
            qty: qtyValue,
        })
    );
    xhr.onload = () => {
        if (xhr.status === 200) {
            if (xhr.response === "Out of stock") {
                alert("Maximum quantity reached");
                return;
            }
            qty.innerText = qtyValue;
        }
    };
}

function deleteProduct(button) {
    let productCard = button.parentElement.parentElement.parentElement;
    let id = productCard.id;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/deleteCartItem", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(
        JSON.stringify({
            id: id,
        })
    );
    xhr.onload = () => {
        if (xhr.status === 200) {
            productCard.remove();
            // delete from productObject
            console.log(productObject, id);
            for (let i = 0; i < productObject.length; i++) {
                if (productObject[i].id === parseInt(id)) {
                    productObject.splice(i, 1);
                    break;
                }
            }
            console.log(productObject);
            if (productObject.length === 0) {
                document.getElementById("emptyCart").classList.remove("hidden");
            }
        }
    };
}