document.addEventListener("DOMContentLoaded", function () {
  var mainSlider;
  var thumbnailSlider;
  const isDesktop = window.innerWidth >= 768;
  const breakPoint = 768;

  const productImageNavItems = document.querySelectorAll(
    ".product-nav-item img",
  );

  function handleSliderChange(info) {
    let currentSlide = info.index;

    productImageNavItems.forEach((item, idx) => {
      item.classList.toggle("active-thumb", idx === currentSlide);
    });

    thumbnailSlider.getInstance().goTo(currentSlide);
  }

  function initThumbnailSlider() {
    thumbnailSlider = new Slider({
      displayItemOnScreen: 4,
      sliderContainerSelector: ".product-slider-nav",
      globalConfig: {
        axis: isDesktop ? "vertical" : "horizontal",
        rewind: isDesktop ? true : false,
      },
    });
  }

  function initMainSlider() {
    mainSlider = new Slider();
  }

  function init() {
    initMainSlider();
    initThumbnailSlider();

    setTimeout(() => {
      let currentSlide = mainSlider.getInstance().getInfo().index;

      productImageNavItems.forEach((item, idx) => {
        item.classList.toggle("active-thumb", idx === currentSlide);
      });

      thumbnailSlider.getInstance().goTo(currentSlide);
    }, 100);

    // handle slider change
    mainSlider.getInstance().events.on("indexChanged", handleSliderChange);

    // handle thumbnail slider click
    productImageNavItems.forEach((thumb, index) => {
      thumb.addEventListener("click", function () {
        mainSlider.getInstance().goTo(index);

        productImageNavItems.forEach((item) =>
          item.classList.remove("active-thumb"),
        );
        thumb.classList.add("active-thumb");
      });
    });
  }

  init();
});
