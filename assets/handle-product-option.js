const countryToLocale = {
  AF: "fa-AF", // Afghanistan
  AL: "sq-AL", // Albania
  DZ: "ar-DZ", // Algeria
  AD: "ca-AD", // Andorra
  AO: "pt-AO", // Angola
  AR: "es-AR", // Argentina
  AM: "hy-AM", // Armenia
  AU: "en-AU", // Australia
  AT: "de-AT", // Austria
  AZ: "az-AZ", // Azerbaijan
  BH: "ar-BH", // Bahrain
  BD: "bn-BD", // Bangladesh
  BY: "be-BY", // Belarus
  BE: "nl-BE", // Belgium (Dutch)
  BG: "bg-BG", // Bulgaria
  BO: "es-BO", // Bolivia
  BA: "bs-BA", // Bosnia and Herzegovina
  BR: "pt-BR", // Brazil
  BN: "ms-BN", // Brunei
  KH: "km-KH", // Cambodia
  CA: "en-CA", // Canada
  CL: "es-CL", // Chile
  CN: "zh-CN", // China
  CO: "es-CO", // Colombia
  CR: "es-CR", // Costa Rica
  HR: "hr-HR", // Croatia
  CU: "es-CU", // Cuba
  CY: "el-CY", // Cyprus
  CZ: "cs-CZ", // Czech Republic
  DK: "da-DK", // Denmark
  DO: "es-DO", // Dominican Republic
  EC: "es-EC", // Ecuador
  EG: "ar-EG", // Egypt
  SV: "es-SV", // El Salvador
  EE: "et-EE", // Estonia
  FI: "fi-FI", // Finland
  FR: "fr-FR", // France
  GE: "ka-GE", // Georgia
  DE: "de-DE", // Germany
  GR: "el-GR", // Greece
  GT: "es-GT", // Guatemala
  HK: "zh-HK", // Hong Kong
  HN: "es-HN", // Honduras
  HU: "hu-HU", // Hungary
  IS: "is-IS", // Iceland
  IN: "hi-IN", // India
  ID: "id-ID", // Indonesia
  IR: "fa-IR", // Iran
  IQ: "ar-IQ", // Iraq
  IE: "en-IE", // Ireland
  IL: "he-IL", // Israel
  IT: "it-IT", // Italy
  JM: "en-JM", // Jamaica
  JP: "ja-JP", // Japan
  JO: "ar-JO", // Jordan
  KZ: "kk-KZ", // Kazakhstan
  KE: "sw-KE", // Kenya
  KR: "ko-KR", // South Korea
  KW: "ar-KW", // Kuwait
  LV: "lv-LV", // Latvia
  LB: "ar-LB", // Lebanon
  LY: "ar-LY", // Libya
  LT: "lt-LT", // Lithuania
  LU: "fr-LU", // Luxembourg
  MY: "ms-MY", // Malaysia
  MT: "mt-MT", // Malta
  MX: "es-MX", // Mexico
  MA: "ar-MA", // Morocco
  NL: "nl-NL", // Netherlands
  NZ: "en-NZ", // New Zealand
  NI: "es-NI", // Nicaragua
  NG: "en-NG", // Nigeria
  NO: "nb-NO", // Norway
  OM: "ar-OM", // Oman
  PK: "ur-PK", // Pakistan
  PA: "es-PA", // Panama
  PY: "es-PY", // Paraguay
  PE: "es-PE", // Peru
  PH: "en-PH", // Philippines
  PL: "pl-PL", // Poland
  PT: "pt-PT", // Portugal
  QA: "ar-QA", // Qatar
  RO: "ro-RO", // Romania
  RU: "ru-RU", // Russia
  SA: "ar-SA", // Saudi Arabia
  RS: "sr-RS", // Serbia
  SG: "en-SG", // Singapore
  SK: "sk-SK", // Slovakia
  SI: "sl-SI", // Slovenia
  ZA: "en-ZA", // South Africa
  ES: "es-ES", // Spain
  LK: "si-LK", // Sri Lanka
  SE: "sv-SE", // Sweden
  CH: "de-CH", // Switzerland
  TW: "zh-TW", // Taiwan
  TH: "th-TH", // Thailand
  TN: "ar-TN", // Tunisia
  TR: "tr-TR", // Turkey
  UA: "uk-UA", // Ukraine
  AE: "ar-AE", // United Arab Emirates
  GB: "en-GB", // United Kingdom
  US: "en-US", // United States
  UY: "es-UY", // Uruguay
  VN: "vi-VN", // Vietnam
  YE: "ar-YE", // Yemen
  ZW: "en-ZW", // Zimbabwe
};

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
      wrapper.removeEventListener("change", this.optionChangeHandler);
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
    if (findPriceOptionVariant) {
      if (!window.Shopify || !Shopify.currency || !Shopify.country) return;

      const currentCurrency = Shopify.currency.active;
      const country = Shopify.country;

      document.querySelector(".product-price p").textContent =
        new Intl.NumberFormat(countryToLocale[country], {
          style: "currency",
          currency: currentCurrency,
          minimumFractionDigits: 0,
        }).format(findPriceOptionVariant.price);

      publish(PUB_SUB_EVENTS.priceUpdated, {
        newPrice: findPriceOptionVariant.price,
      });
    }
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
