document.addEventListener("DOMContentLoaded", function () {
  const optionGroups = document.querySelectorAll('[name^="option-"]');
  const urlParams = new URLSearchParams(window.location.search);
  const variantIdFromURL = urlParams.get("variant_id");

  const product = window.productData;

  let selectedOptions = {};

  function selectVariant(variant) {
    variant.options.forEach((optionValue, index) => {
      const optionName = `option-${product.options[index].toLowerCase().replace(" ", "-")}`;
      const radio = document.querySelector(
        `input[name="${optionName}"][value="${optionValue}"]`,
      );
      if (radio) {
        radio.checked = true;
        selectedOptions[optionName] = optionValue;
      }
    });
  }

  function updateVariantInfo(variant) {
    const newUrl = new URL(window.location);
    newUrl.searchParams.set("variant_id", variant.id);
    window.history.replaceState({}, "", newUrl);
  }

  function handleVariantOptionChange(e) {
    selectedOptions[e.target.name] = e.target.value;

    const variant = product.variants.find((v) => {
      return v.options.every((option, index) => {
        const optionName = `option-${product.options[index].toLowerCase().replace(" ", "-")}`;
        return option === selectedOptions[optionName];
      });
    });

    if (variant) {
      updateVariantInfo(variant);
    }
  }

  function init() {
    beforeInit();

    document.querySelectorAll('[name^="option-"]').forEach((radio) => {
      radio.addEventListener("change", handleVariantOptionChange);
    });
  }

  function beforeInit() {
    optionGroups.forEach((group) => {
      if (group.checked) {
        selectedOptions[group.name] = group.value;
      }
    });

    if (variantIdFromURL) {
      const targetVariant = product.variants.find(
        (v) => v.id.toString() === variantIdFromURL,
      );

      if (targetVariant) {
        selectVariant(targetVariant);
        updateVariantInfo(targetVariant);
      }
    }
  }

  init();
});
