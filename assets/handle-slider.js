const SCREEN = 1024;

class ProductSlider extends HTMLElement {
  constructor() {
    super();

    this.getSelectors();
    this.isDesktop = window.innerWidth >= SCREEN;

    this.mainSlider = null;
    this.thumbnailSlider = null;

    this.currentTimoutRef = null;
  }

  getSelectors() {
    this.productNavElement = this.querySelector(".product-slider-nav");
    this.productMainElement = this.querySelector(".product-slider-main");
    this.productImageNavItems = this.querySelectorAll(".product-nav-item img");
  }

  connectedCallback() {
    console.log("connectedCallback ProductSlider running................");
    this.init();

    // event shopify
    document.addEventListener(
      "shopify:section:load",
      this.handleSectionLoad.bind(this),
    );

    window.addEventListener("resize", () => {
      if (this.currentTimoutRef) {
        clearTimeout(this.currentTimoutRef);
      }

      this.currentTimoutRef = setTimeout(() => {
        this.updateConfigThumbSlider.call(this);
      }, 200);
    });
  }

  disconnectedCallback() {
    console.log("disconnectedCallback ProductSlider running................");
  }

  init() {
    const section = this.closest(`[data-section-id]`);

    if (!section) return;

    this.sliderSize = section.dataset.itemShowing
      ? parseInt(section.dataset.itemShowing, 10)
      : 4;

    this.initMainSlider();
    this.initThumbnailSlider();

    if (this.mainSlider) {
      const mainInstance = this.mainSlider.getInstance();
      if (mainInstance) {
        let currentSlide = mainInstance.getInfo().index;

        this.productImageNavItems.forEach((item, idx) => {
          item.classList.toggle("active-thumb", idx === currentSlide);
        });

        if (this.thumbnailSlider) {
          const thumbInstance = this.thumbnailSlider.getInstance();
          if (thumbInstance) thumbInstance.goTo(currentSlide);
        }
      }
    }

    if (this.mainSlider) {
      const mainInstance = this.mainSlider.getInstance();
      if (mainInstance) {
        mainInstance.events.on(
          "indexChanged",
          this.handleSliderChange.bind(this),
        );
      }
    }

    this.productImageNavItems.forEach((thumb, index) => {
      thumb.addEventListener("click", () => {
        if (this.mainSlider) {
          const mainInstance = this.mainSlider.getInstance();
          if (mainInstance) mainInstance.goTo(index);
        }

        this.productImageNavItems.forEach((item) =>
          item.classList.remove("active-thumb"),
        );
        thumb.classList.add("active-thumb");
      });
    });
  }

  initMainSlider() {
    if (typeof Slider !== "undefined") {
      this.mainSlider = new Slider();
    } else {
      console.error("Slider is not defined");
    }
  }

  initThumbnailSlider() {
    this.thumbnailSlider = new Slider({
      displayItemOnScreen: this.sliderSize,
      sliderContainerSelector: this.productNavElement,
      globalConfig: {
        axis: this.isDesktop ? "vertical" : "horizontal",
        rewind: this.isDesktop ? true : false,
      },
    });

    subscribe(PUB_SUB_EVENTS.imageSliderUpdated, (data) => {
      const { imageId } = data;

      const slideIndex = Array.from(
        document.querySelectorAll(".product-nav-item"),
      ).findIndex((item) => {
        return item.dataset.imageId === String(imageId);
      });

      if (slideIndex !== -1) {
        this.handleSliderChange.bind(this, { index: slideIndex });

        // handle main slider change
        if (this.mainSlider) {
          const mainInstance = this.mainSlider.getInstance();
          if (mainInstance) mainInstance.goTo(slideIndex);
        }
      }
    });
  }

  handleSliderChange(info) {
    let currentSlide = info.index;

    if (this.productImageNavItems) {
      this.productImageNavItems.forEach((item, idx) => {
        item.classList.toggle("active-thumb", idx === currentSlide);
      });
    }

    this.thumbnailSlider.getInstance().goTo(currentSlide);
  }

  handleSectionLoad(event) {
    const sectionId = event.detail.sectionId;

    if (this.closest("[data-section-id = '" + sectionId + "']")) {
      this.init();
    }
  }

  updateConfigThumbSlider() {
    if (this.isDesktop !== window.innerWidth >= SCREEN) {
      this.isDesktop = window.innerWidth >= SCREEN;
    }

    if (!this.productNavElement) {
      console.error("Thumbnail slider container not found!");
      return;
    }

    if (!this.thumbnailSlider || !this.mainSlider) return;

    const mainInstance = this.mainSlider.getInstance();
    const currentSlide = mainInstance ? mainInstance.getInfo().index : 0;

    this.mainSlider.destroy();
    this.thumbnailSlider.destroy();

    this.getSelectors();

    this.mainSlider = new Slider();

    this.thumbnailSlider = new Slider({
      displayItemOnScreen: this.sliderSize,
      sliderContainerSelector: this.productNavElement,
      globalConfig: {
        axis: this.isDesktop ? "vertical" : "horizontal",
        rewind: this.isDesktop,
      },
    });

    const thumbInstance = this.thumbnailSlider.getInstance();
    if (thumbInstance) {
      thumbInstance.goTo(currentSlide);
    }

    this.productImageNavItems.forEach((item, idx) => {
      item.classList.toggle("active-thumb", idx === currentSlide);
    });
  }
}

customElements.define("product-slider", ProductSlider);
