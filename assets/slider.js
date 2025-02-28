class Slider {
  constructor({
    sliderContainerSelector = ".product-slider",
    sliderNavSelector = ".nav-inner",
    displayItemOnScreen = 1,
    responsiveConfig = {},
  } = {}) {
    this.selectors = {
      sliderContainerSelector,
      sliderNavSelector,
    };

    this.settings = {
      displayItemOnScreen,
      responsiveConfig,
    };

    this.instanceSlider;

    this.init();
  }

  init() {
    this.instanceSlider = tns({
      container: this.selectors.sliderContainerSelector,
      items: this.settings.displayItemOnScreen,
      loop: true,
      preventScrollOnTouch: true,
      mouseDrag: true,
      navContainer: this.selectors.sliderNavSelector,
      responsive: {
        ...this.settings.responsiveConfig,
      },
    });
  }

  getInstance() {
    return this.instanceSlider;
  }
}
