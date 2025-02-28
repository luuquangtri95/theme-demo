class CartManager {
  constructor({
    productCardSelector = ".product-card",
    cartPreviewSelector = ".cart-preview",
    addToCartSelector = ".add-cart",
    headingCartSelector = ".heading-cart input",
    descCartSelector = ".desc-cart input",
    addBtnSelector = ".btn-add-cart-item",
    formAddCartSelector = ".form-add-cart",
  } = {}) {
    this.formData = {
      heading: "",
      description: "",
      products: [],
    };

    this.selectors = {
      productCardSelector,
      cartPreviewSelector,
      addToCartSelector,
      headingCartSelector,
      descCartSelector,
      addBtnSelector,
      formAddCartSelector,
    };

    this.productCards = document.querySelectorAll(productCardSelector);
    this.cartPreview = document.querySelector(cartPreviewSelector);
    this.addToCartButton = document.querySelector(addToCartSelector);
    this.headingCart = document.querySelector(headingCartSelector);
    this.descCart = document.querySelector(descCartSelector);
    this.addButtons = document.querySelectorAll(addBtnSelector);
    this.formAddCart = document.querySelector(formAddCartSelector);

    this.bindInputEvents();

    this.initCart();

    this.setupAddToCart();
  }

  bindInputEvents() {
    if (this.headingCart) {
      this.headingCart.addEventListener(
        "change",
        this.handleHeadingChange.bind(this)
      );
    }
    if (this.descCart) {
      this.descCart.addEventListener(
        "change",
        this.handleDescChange.bind(this)
      );
    }
  }

  handleHeadingChange(e) {
    this.formData.heading = e.target.value;
  }

  handleDescChange(e) {
    this.formData.description = e.target.value;
  }

  initCart() {
    this.addButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.handleAddButtonClick(e, btn);
      });
    });
  }

  handleAddButtonClick(e, btn) {
    const productCard = btn.closest(this.selectors.productCardSelector);
    if (!productCard) return;

    const quantityInput = productCard.querySelector(".quantity");
    if (!quantityInput) return;

    const variantId = Number(productCard.getAttribute("data-variant-id"));
    const maxQuantity = Number(
      productCard.getAttribute("data-variant-quantity")
    );
    const quantityValue = Number(quantityInput.value);

    if (maxQuantity <= 0) {
      alert("Product sold out!");
      return;
    }
    if (quantityValue > maxQuantity) {
      alert("Quantity exceeds Max Quantity");
      return;
    }

    const existingItem = this.formData.products?.find(
      (item) => item.variantId === variantId
    );
    if (existingItem) {
      existingItem.quantity += quantityValue;
    } else {
      this.formData.products?.push({ variantId, quantity: quantityValue });
    }

    if (this.formData.products?.length) {
      this.formAddCart.classList.remove("hidden");
    } else {
      this.formAddCart.classList.add("hidden");
    }

    // Reset input số lượng về 1
    quantityInput.value = 1;

    this.updateCartPreview(maxQuantity);
  }

  handleRemoveCartItem(itemDelete) {
    this.formData = {
      ...this.formData,
      products: this.formData.products.filter(
        (_item) => _item.variantId !== itemDelete.variantId
      ),
    };

    this.updateCartPreview();
  }

  updateCartPreview(maxQuantity) {
    if (!this.cartPreview) return;

    // reset block html
    this.cartPreview.innerHTML = "";

    if (!this.formData.products.length) {
      this.formAddCart.classList.add("hidden");
      return;
    }

    const fragment = document.createDocumentFragment();
    this.formData.products?.forEach((itemData) => {
      if (itemData.quantity > maxQuantity) {
        alert("Quantity exceeds Max Quantity");
      }

      const itemDiv = document.createElement("div");
      const button = document.createElement("button");
      const p = document.createElement("p");
      itemDiv.className =
        "mt-3 cart-item-line flex justify-between items-center flex-rows";

      // p
      p.textContent = `Variant ID: ${itemData.variantId} - Quantity: ${itemData.quantity}`;

      // button
      button.textContent = "delete";
      button.className = "border boder-[#eee] bg-[#eee] px-2 rounded-md";
      button.addEventListener(
        "click",
        this.handleRemoveCartItem.bind(this, itemData)
      );

      itemDiv.append(p, button);

      fragment.appendChild(itemDiv);
    });
    this.cartPreview.appendChild(fragment);
  }

  setupAddToCart() {
    if (!this.addToCartButton) return;
    this.addToCartButton.addEventListener("click", () => {
      const payload = {
        items: this.formData.products?.map((item) => ({
          id: item.variantId,
          quantity: item.quantity,
        })),
      };

      console.log("Submitting payload:", payload);

      fetch(window.Shopify.routes.root + "cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Cart updated:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  }
}

if (document.readyState !== "loading") {
  new CartManager();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    new CartManager();
  });
}
