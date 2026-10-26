
/* =========================================
   SAVORA KITCHEN
   Main JavaScript
========================================= */


/* 1. UPDATE COPYRIGHT YEAR */

document.querySelectorAll(".current-year").forEach((element) => {
    element.textContent = new Date().getFullYear();
});


/* 2. MENU CATEGORY FILTERS */

const filterButtons = document.querySelectorAll(".filter-button");
const foodCards = document.querySelectorAll(".food-card[data-category]");

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {

        const selectedCategory = button.dataset.filter;

        // Update the active button.
        filterButtons.forEach((item) => {
            item.classList.remove("active");
            item.setAttribute("aria-pressed", "false");
        });

        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");

        // Show only matching food cards.
        foodCards.forEach((card) => {

            const cardCategory = card.dataset.category;

            if (
                selectedCategory === "all" ||
                cardCategory === selectedCategory
            ) {
                card.classList.remove("hidden");
            } else {
                card.classList.add("hidden");
            }

        });

    });
});


/* 3. SHOPPING CART */

const CART_STORAGE_KEY = "savoraKitchenCart";

let cart = [];

try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
            cart = parsedCart.filter((item) => {
                return (
                    item &&
                    typeof item.id === "string" &&
                    typeof item.name === "string" &&
                    Number.isSafeInteger(item.price) &&
                    item.price > 0 &&
                    Number.isSafeInteger(item.quantity) &&
                    item.quantity > 0 &&
                    item.quantity <= 100
                );
            });
        }
    }
} catch (error) {
    console.warn("Unable to load the saved cart.", error);
    cart = [];
}


function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.warn("Unable to save the cart.", error);
    }
}


function formatPrice(amount) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0
    }).format(amount);
}


function getCartCount() {
    return cart.reduce((total, item) => {
        return total + item.quantity;
    }, 0);
}


function getCartTotal() {
    return cart.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);
}


function updateCartCount() {
    const count = getCartCount();

    document.querySelectorAll(".cart-count").forEach((element) => {
        element.textContent = element.id === "cartCount"
            ? count
            : `${count} item${count === 1 ? "" : "s"}`;
    });
}


function addToCart(id, name, price) {

    const existingItem = cart.find((item) => item.id === id);

    if (existingItem) {

        if (existingItem.quantity >= 100) {
            alert("You have reached the quantity limit for this item.");
            return;
        }

        existingItem.quantity += 1;

    } else {

        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });

    }

    saveCart();
    renderCart();

    alert(`${name} added to your cart!`);
}


function changeQuantity(id, amount) {

    const item = cart.find((product) => product.id === id);

    if (!item) {
        return;
    }

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter((product) => product.id !== id);
    }

    saveCart();
    renderCart();
}


function removeFromCart(id) {

    cart = cart.filter((item) => item.id !== id);

    saveCart();
    renderCart();
}


function renderCart() {

    updateCartCount();

    const cartItemsContainer = document.querySelector(".cart-items");
    const cartTotalElement = document.getElementById("cartTotal");
    const checkoutButton = document.getElementById("checkoutButton");

    // The homepage and other pages may not contain the cart.
    if (!cartItemsContainer) {
        return;
    }

    cartItemsContainer.replaceChildren();

    if (cart.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "cart-empty";
        emptyMessage.textContent = "Your cart is empty.";

        cartItemsContainer.appendChild(emptyMessage);

    } else {

        cart.forEach((item) => {

            const cartItem = document.createElement("div");
            cartItem.className = "cart-item";

            const details = document.createElement("div");

            const name = document.createElement("h4");
            name.textContent = item.name;

            const price = document.createElement("p");
            price.textContent = `${formatPrice(item.price)} each`;

            details.append(name, price);

            const controls = document.createElement("div");
            controls.className = "cart-item-controls";

            const decreaseButton = document.createElement("button");
            decreaseButton.type = "button";
            decreaseButton.className = "quantity-button";
            decreaseButton.textContent = "−";
            decreaseButton.setAttribute(
                "aria-label",
                `Decrease quantity of ${item.name}`
            );

            decreaseButton.addEventListener("click", () => {
                changeQuantity(item.id, -1);
            });

            const quantity = document.createElement("span");
            quantity.textContent = item.quantity;

            const increaseButton = document.createElement("button");
            increaseButton.type = "button";
            increaseButton.className = "quantity-button";
            increaseButton.textContent = "+";
            increaseButton.setAttribute(
                "aria-label",
                `Increase quantity of ${item.name}`
            );

            increaseButton.disabled = item.quantity >= 100;

            increaseButton.addEventListener("click", () => {
                changeQuantity(item.id, 1);
            });

            const subtotal = document.createElement("strong");
            subtotal.textContent = formatPrice(
                item.price * item.quantity
            );

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "remove-item";
            removeButton.textContent = "Remove";

            removeButton.addEventListener("click", () => {
                removeFromCart(item.id);
            });

            controls.append(
                decreaseButton,
                quantity,
                increaseButton,
                subtotal,
                removeButton
            );

            cartItem.append(details, controls);
            cartItemsContainer.appendChild(cartItem);

        });

    }

    if (cartTotalElement) {
        cartTotalElement.textContent = formatPrice(getCartTotal());
    }

    if (checkoutButton) {
        checkoutButton.disabled = cart.length === 0;
    }

}


/* 4. CONNECT FOOD BUTTONS TO THE CART */

document.querySelectorAll(".add-to-cart[data-id]").forEach((button) => {

    button.addEventListener("click", () => {

        const id = button.dataset.id;
        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        if (
            !id ||
            !name ||
            !Number.isSafeInteger(price) ||
            price <= 0
        ) {
            alert("This food item has invalid product information.");
            return;
        }

        addToCart(id, name, price);

    });

});


/* 5. DEMONSTRATION CHECKOUT */

const checkoutButton = document.getElementById("checkoutButton");

if (checkoutButton) {

    checkoutButton.addEventListener("click", () => {

        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        const orderSummary = cart.map((item) => {
            return `${item.name} x ${item.quantity}`;
        }).join("\n");

        alert(
            "Demo Order Summary\n\n" +
            orderSummary +
            "\n\nTotal: " + formatPrice(getCartTotal()) +
            "\n\nThis is a frontend demonstration. " +
            "No order has been submitted and no payment has been made."
        );

    });

}


/* 6. CONTACT FORM VALIDATION */

const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

if (contactForm && formMessage) {

    contactForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const subject = document.getElementById("subject").value;
        const message = document.getElementById("message").value.trim();

        formMessage.textContent = "";
        formMessage.className = "form-message";

        if (
            name.length < 2 ||
            email.length === 0 ||
            subject.length === 0 ||
            message.length < 10
        ) {

            formMessage.textContent =
                "Please complete all fields correctly.";

            formMessage.classList.add("error");

            return;
        }

        formMessage.textContent =
            "Your form passed the browser checks, but this demo " +
            "does not send messages to the restaurant.";

        formMessage.classList.add("success");

    });

}


/* 7. SCROLL REVEAL ANIMATIONS */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.12
        }
    );

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });

} else {

    // Fallback for older browsers.
    revealElements.forEach((element) => {
        element.classList.add("visible");
    });

}


/* 8. INITIALISE CART DISPLAY */

renderCart();

