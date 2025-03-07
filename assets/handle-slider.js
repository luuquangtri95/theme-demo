// document.addEventListener("DOMContentLoaded", function () {
//   var mainSlider;
//   var thumbnailSlider;
//   const isDesktop = window.innerWidth >= 768;
//   const breakPoint = 768;

//   const productImageNavItems = document.querySelectorAll(
//     ".product-nav-item img",
//   );

//   function handleSliderChange(info) {
//     let currentSlide = info.index;

//     productImageNavItems.forEach((item, idx) => {
//       item.classList.toggle("active-thumb", idx === currentSlide);
//     });

//     thumbnailSlider.getInstance().goTo(currentSlide);
//   }

//   function initThumbnailSlider() {
//     thumbnailSlider = new Slider({
//       displayItemOnScreen: 4,
//       sliderContainerSelector: ".product-slider-nav",
//       globalConfig: {
//         axis: isDesktop ? "vertical" : "horizontal",
//         rewind: isDesktop ? true : false,
//       },
//     });
//   }

//   function initMainSlider() {
//     mainSlider = new Slider();
//   }

//   function init() {
//     initMainSlider();
//     initThumbnailSlider();

//     setTimeout(() => {
//       let currentSlide = mainSlider.getInstance().getInfo().index;

//       productImageNavItems.forEach((item, idx) => {
//         item.classList.toggle("active-thumb", idx === currentSlide);
//       });

//       thumbnailSlider.getInstance().goTo(currentSlide);
//     }, 100);

//     // handle slider change
//     mainSlider.getInstance().events.on("indexChanged", handleSliderChange);

//     // handle thumbnail slider click
//     productImageNavItems.forEach((thumb, index) => {
//       thumb.addEventListener("click", function () {
//         mainSlider.getInstance().goTo(index);

//         productImageNavItems.forEach((item) =>
//           item.classList.remove("active-thumb"),
//         );
//         thumb.classList.add("active-thumb");
//       });
//     });
//   }

//   init();
// });

document.addEventListener("DOMContentLoaded", function () {
  let currentTimeoutRef;

  function initSliders(sectionId, isDesktop = window.innerWidth >= 768) {
    let mainSlider, thumbnailSlider;

    const section = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!section) return;

    const productImageNavItems = section.querySelectorAll(
      ".product-nav-item img",
    );

    const sliderSize = section.dataset.itemShowing
      ? parseInt(section.dataset.itemShowing, 10)
      : 4;

    function handleSliderChange(info) {
      let currentSlide = info.index;

      productImageNavItems.forEach((item, idx) => {
        item.classList.toggle("active-thumb", idx === currentSlide);
      });

      if (thumbnailSlider) {
        const thumbInstance = thumbnailSlider.getInstance();
        if (thumbInstance) thumbInstance.goTo(currentSlide);
      }
    }

    function initThumbnailSlider() {
      thumbnailSlider = new Slider({
        displayItemOnScreen: sliderSize,
        sliderContainerSelector: ".product-slider-nav",
        globalConfig: {
          axis: isDesktop ? "vertical" : "horizontal",
          rewind: isDesktop ? true : false,
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
          handleSliderChange({ index: slideIndex });

          // handle main slider change
          if (mainSlider) {
            const mainInstance = mainSlider.getInstance();
            if (mainInstance) mainInstance.goTo(slideIndex);
          }
        }
      });
    }

    function initMainSlider() {
      mainSlider = new Slider();
    }

    function setupEventListeners() {
      setTimeout(() => {
        if (mainSlider) {
          const mainInstance = mainSlider.getInstance();
          if (mainInstance) {
            let currentSlide = mainInstance.getInfo().index;

            productImageNavItems.forEach((item, idx) => {
              item.classList.toggle("active-thumb", idx === currentSlide);
            });

            if (thumbnailSlider) {
              const thumbInstance = thumbnailSlider.getInstance();
              if (thumbInstance) thumbInstance.goTo(currentSlide);
            }
          }
        }
      }, 100);

      if (mainSlider) {
        const mainInstance = mainSlider.getInstance();
        if (mainInstance) {
          mainInstance.events.on("indexChanged", handleSliderChange);
        }
      }

      productImageNavItems.forEach((thumb, index) => {
        thumb.addEventListener("click", function () {
          if (mainSlider) {
            const mainInstance = mainSlider.getInstance();
            if (mainInstance) mainInstance.goTo(index);
          }

          productImageNavItems.forEach((item) =>
            item.classList.remove("active-thumb"),
          );
          thumb.classList.add("active-thumb");
        });
      });
    }

    initMainSlider();
    initThumbnailSlider();
    setupEventListeners();
  }

  // Khởi tạo slider cho tất cả section khi trang load
  document.querySelectorAll("[data-section-id]").forEach((section) => {
    initSliders(section.dataset.sectionId);
  });

  window.addEventListener("resize", () => {
    if (currentTimeoutRef) {
      clearTimeout(currentTimeoutRef);
    }

    currentTimeoutRef = setTimeout(() => {
      document.querySelectorAll("[data-section-id]").forEach((section) => {
        const newIsDesktop = window.innerWidth >= 768;
        const sectionId = section.dataset.sectionId;
        initSliders(sectionId, newIsDesktop);
      });
    }, 200);
  });

  document.addEventListener("shopify:section:load", function (event) {
    console.log("Section reloaded:", event.detail.sectionId);
    const sectionId = event.detail.sectionId;
    initSliders(sectionId);
  });
});
