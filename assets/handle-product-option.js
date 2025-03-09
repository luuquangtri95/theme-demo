class ProductOptions extends HTMLElement {
  constructor() {
    super();

    this.wrappers = this.querySelectorAll(".product-option-wrapper");
    this.selectVariant = this.querySelector('select[name="id"]');
    this.variantName = this.querySelectorAll(".variant-name");

    if (!this.selectVariant || this.wrappers.length === 0) return;
  }

  priceUpdateSubscriber = undefined;
  imageSliderUpdateSubscriber = undefined;

  connectedCallback() {
    console.log("connectedCallback running................");

    this.priceUpdateSubscriber = subscribe(
      PUB_SUB_EVENTS.priceUpdate,
      this.handleChangePrice.bind(this),
    );

    this.imageSliderUpdateSubscriber = subscribe(
      PUB_SUB_EVENTS.imageSliderUpdated,
      this.handleChangeCurrentImageSlider.bind(this),
    );

    this.init();
    this.syncWithURL();
  }

  disconnectedCallback() {
    console.log("disconnectedCallback running................");
    // remove all event pubsub
    if (this.priceUpdateSubscriber) {
      this.priceUpdateSubscriber.unsubscribe();
    }

    if (this.imageSliderUpdateSubscriber) {
      this.imageSliderUpdateSubscriber.unsubscribe();
    }

    // remove all event listeners
    this.wrappers.forEach((wrapper) => {
      wrapper.removeEventListener("change", this.handleOptionChange);
    });
  }

  init() {
    this.wrappers.forEach((wrapper, index) => {
      wrapper.addEventListener(
        "change",
        this.handleOptionChange.bind(this, wrapper, index),
      );
    });
  }

  handleOptionChange(wrapper, index) {
    const inputs = wrapper.querySelectorAll("input[type='radio']");

    inputs.forEach((input) => {
      input.toggleAttribute("checked", input.checked);

      if (input.checked) {
        this.variantName[index].innerHTML = input.value;
      }
    });

    const selectedOptions = this.getSelectedOptions();
    const matchingVariant = this.findMatchingVariant(selectedOptions);

    // handle change price and slider image
    this.handleChangePrice(matchingVariant);

    // handle change image slider
    this.handleChangeCurrentImageSlider(matchingVariant);

    if (matchingVariant) {
      this.updateURL(matchingVariant);
    }
  }

  handleChangePrice(variantId) {
    const findPriceOptionVariant = window.productData.variants.find(
      (variant) => variant.id === Number(variantId),
    );

    // if (findPriceOptionVariant) {
    //   document.dispatchEvent(
    //     new CustomEvent("price:updated", {
    //       detail: { newPrice: findPriceOptionVariant.price },
    //     }),
    //   );
    // }

    /**
     * PUBSUB
     */
    // if (findPriceOptionVariant) {
    //   if (!window.Shopify || !Shopify.currency || !Shopify.country) return;

    //   const currentCurrency = Shopify.currency.active;
    //   const country = Shopify.country;

    //   document.querySelector(".product-price p").textContent =
    //     new Intl.NumberFormat(countryToLocale[country], {
    //       style: "currency",
    //       currency: currentCurrency,
    //       minimumFractionDigits: 0,
    //     }).format(findPriceOptionVariant.price);

    //   publish(PUB_SUB_EVENTS.priceUpdated, {
    //     newPrice: findPriceOptionVariant.price,
    //   });
    // }
  }

  handleChangeCurrentImageSlider(variantId) {
    const findImageIdOfVariant = window.productData.variants.find(
      (variant) => variant.id === Number(variantId),
    );

    if (!findImageIdOfVariant) return;

    publish(PUB_SUB_EVENTS.imageSliderUpdated, {
      imageId: findImageIdOfVariant.featured_image.id,
    });
  }

  getSelectedOptions() {
    const selectedOptions = {};

    document
      .querySelectorAll(".product-options-list input:checked")
      .forEach((input) => {
        selectedOptions[input.name] = input.value;
      });
    return selectedOptions;
  }

  findMatchingVariant(selectedOptions) {
    let matchingVariant = null;

    this.selectVariant.querySelectorAll("option").forEach((option) => {
      const variantTitle = option.textContent.trim();
      const variantValues = variantTitle.split(" / ");

      const isMatch = Object.values(selectedOptions).every((value) =>
        variantValues.includes(value),
      );

      if (isMatch) {
        matchingVariant = option.value;
      }
    });

    return matchingVariant;
  }

  updateURL(variantId) {
    const newUrl = new URL(window.location);
    newUrl.searchParams.set("variant_id", variantId);
    window.history.replaceState({}, "", newUrl);
  }

  syncWithURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const variantId = urlParams.get("variant_id");

    if (!variantId) return;

    const variantOption = this.selectVariant.querySelector(
      `option[value="${variantId}"]`,
    );
    if (!variantOption) return;

    this.selectVariant.value = variantId;

    const variantValues = variantOption.textContent.trim().split(" / ");

    this.wrappers.forEach((wrapper, index) => {
      const inputs = wrapper.querySelectorAll("input[type='radio']");
      inputs.forEach((input) => {
        if (variantValues.includes(input.value)) {
          input.toggleAttribute("checked", input.value);

          this.variantName[index].textContent = input.value;
        } else {
          input.removeAttribute("checked");
        }
      });
    });
  }
}

// để đây xử lý csai này sau...
function getSectionsToRender() {
  return [
    {
      id: "main-cart-footer",
      section: document.getElementById("main-cart-footer").dataset.id,
      selector: ".js-contents",
    },
  ];
}

customElements.define("product-options", ProductOptions);
