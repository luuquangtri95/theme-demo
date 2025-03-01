class Slider {
  constructor({
    sliderContainerSelector = ".product-slider",
    sliderNavSelector = ".nav-inner",
    displayItemOnScreen = 1,
    responsiveConfig = {},
    globalConfig = {}
  } = {}) {
    this.selectors = {
      sliderContainerSelector,
      sliderNavSelector
    };

    this.settings = {
      displayItemOnScreen,
      responsiveConfig,
      globalConfig
    };

    this.instanceSlider;

    this.init();
  }

  init() {
    if (this.instanceSlider) {
      this.instanceSlider.destroy();
    }

    this.instanceSlider = tns({
      container: this.selectors.sliderContainerSelector,
      items: this.settings.displayItemOnScreen,
      loop: false,
      preventScrollOnTouch: true,
      mouseDrag: true,
      gutter: 2,
      startIndex: 0,
      ...this.settings.globalConfig,
      responsive: {
        ...this.settings.responsiveConfig
      }
    });
  }

  getInstance() {
    return this.instanceSlider;
  }
}
