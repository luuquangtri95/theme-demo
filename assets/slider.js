class Slider {
  constructor({
    sliderContainerSelector = ".product-slider",
    sliderNavSelector = ".nav-inner",
    displayItemOnScreen = 1,
    responsiveConfig = {},
    globalConfig = {},
  } = {}) {
    this.selectors = {
      sliderContainerSelector,
      sliderNavSelector,
    };

    this.settings = {
      displayItemOnScreen,
      responsiveConfig,
      globalConfig,
    };

    this.instanceSlider;

    this.init();
  }

  init() {
    // when create new slider, always destroy old slider with function destroy()

    if (this.instanceSlider) {
      this.instanceSlider.destroy();
      this.instanceSlider = null;
    }

    this.instanceSlider = tns({
      container: this.selectors.sliderContainerSelector,
      items: this.settings.displayItemOnScreen,
      loop: false,
      preventScrollOnTouch: true,
      mouseDrag: true,
      gutter: 2,
      startIndex: 0,
      mouseDrag: true,
      ...this.settings.globalConfig,
      responsive: {
        ...this.settings.responsiveConfig,
      },
    });
  }

  getInstance() {
    return this.instanceSlider;
  }

  updateConfig(newConfig) {
    if (!this.instanceSlider) {
      console.error(
        "Slider instance not found. Please initialize the slider first.",
      );
      return;
    }

    this.settings.globalConfig = {
      ...this.settings.globalConfig,
      ...newConfig,
    };

    this.instanceSlider.rebuild(this.settings.globalConfig);
  }

  destroy() {
    if (this.instanceSlider) {
      this.instanceSlider.destroy();
      this.instanceSlider = null;
    }
  }
}
