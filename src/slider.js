import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";


gsap.registerPlugin(Draggable, Flip, InertiaPlugin, Observer, ScrollTrigger);

function sliderInit() {
  const slides = [...document.querySelectorAll(".slide-v")];
  const thumbnails = [...document.querySelectorAll(".slider-t-slide")];
  const thumbList = document.querySelector(".slider-t-list");
  const track = document.querySelector(".slider-v-list");

  const textList = document.querySelector(".slider-text-list");
  const textSlides = textList ? [...textList.children] : [];

  const buttonList = document.querySelector(".slider-button-list");
  const buttonSlides = buttonList ? [...buttonList.children] : [];

  const isMobile = () => window.innerWidth <= 480;
  let initialIndex = isMobile() ? Math.floor(slides.length / 2) : 0;
  let current = initialIndex;

  let autoplayDelay = 5;
  let autoplayTimeline;
  let animating = false;
  let transitionGuard = false;

  const slideHeight = () => (slides[0] ? slides[0].offsetHeight : 0);
  const textSlideHeight = () => (textSlides[0] ? textSlides[0].offsetHeight : 0);
  const buttonSlideHeight = () => (buttonSlides[0] ? buttonSlides[0].offsetHeight : 0);

  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize || "16");
  const thumbOffset = () => (isMobile() ? rem * 3 : 0);


  thumbnails.forEach((thumb) => {
    const container = thumb.querySelector(".thumbnail-container");
    if (container && !container.querySelector(".thumbnail-overlay")) {
      const overlay = document.createElement("div");
      overlay.classList.add("thumbnail-overlay");
      container.appendChild(overlay);
    }
  });


  if (thumbList) thumbList.classList.add("thumbs-loading");


  if (textList) gsap.set(textList, { y: -(current * textSlideHeight()) });
  if (buttonList) gsap.set(buttonList, { y: -(current * buttonSlideHeight()) });
  if (thumbList) gsap.set(thumbList, { x: 0 });
  if (track) gsap.set(track, { y: -(current * slideHeight()) });


  slides.forEach((s, i) => s.classList.toggle("is-active", i === current));
  thumbnails.forEach((t, i) => t.classList.toggle("is-active", i === current));


  const updateOverlays = () => {
    thumbnails.forEach(t => {
      const overlay = t.querySelector(".thumbnail-overlay");
      if (overlay) {
        overlay.style.opacity = t.classList.contains("is-active") ? "0" : "1.0";
      }
    });
  };
  updateOverlays();

  const focusContainer = document.querySelector(".thumbnail-focus");
  if (focusContainer && thumbnails[current]) {
    thumbnails[current].appendChild(focusContainer);
  }

  const clearThumbLoading = () => {
    if (thumbList) thumbList.classList.remove("thumbs-loading");
  };
  if (document.readyState === "complete") {
    clearThumbLoading();
  } else {
    window.addEventListener("load", clearThumbLoading, { once: true });
    setTimeout(clearThumbLoading, 600);
  }

  startAutoplay();

  function startAutoplay() {
    if (autoplayTimeline) autoplayTimeline.kill();
    thumbnails.forEach(t => {
      const timerEl = t.querySelector(".bg-timer");
      if (timerEl) gsap.set(timerEl, { scaleX: 0, transformOrigin: "left center" });
    });

    const timer = thumbnails[current]?.querySelector(".bg-timer") || null;
    autoplayTimeline = gsap.timeline({ onComplete: next });
    if (timer) autoplayTimeline.to(timer, { scaleX: 1, duration: autoplayDelay, ease: "linear" });
  }

  function goTo(index) {
    if (index === current || transitionGuard) return;
    transitionGuard = true;
    setTimeout(() => (transitionGuard = false), 200);

    if (animating) {
      gsap.globalTimeline.getChildren().forEach(tl => tl.progress(1));
      if (autoplayTimeline) autoplayTimeline.kill();
    }

    animating = true;
    current = (index + slides.length) % slides.length;
    startAutoplay();

    if (focusContainer && thumbnails[current]) {
      const newFocusParent = thumbnails[current];
      const flipState = Flip.getState(focusContainer);
      newFocusParent.appendChild(focusContainer);
      Flip.from(flipState, { duration: 0.6, ease: "power2.inOut" });
    }

    if (track) {
      gsap.to(track, {
        y: -(current * slideHeight()),
        duration: 1.2,
        ease: "power3.inOut",
        onComplete() {
          animating = false;
          slides.forEach((s, i) => s.classList.toggle("is-active", i === current));
        }
      });
    }

    if (textList) gsap.to(textList, { y: -(current * textSlideHeight()), duration: 1, ease: "power3.inOut" });
    if (buttonList) gsap.to(buttonList, { y: -(current * buttonSlideHeight()), duration: 1, ease: "power3.inOut" });

    let xShift = 0;
    if (isMobile()) {
      if (current === 0) xShift = thumbOffset();
      else if (current === slides.length - 1) xShift = -thumbOffset();
    }
    if (thumbList) gsap.to(thumbList, { x: xShift, duration: 0.6, ease: "power2.out" });

    thumbnails.forEach((t, i) => t.classList.toggle("is-active", i === current));
    updateOverlays();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener("click", () => goTo(index));
  });

  Observer.create({
    target: document.querySelector(".slider-v-wrapper"),
    type: "touch,pointer",
    onUp: prev,
    onDown: next
  });

  window.addEventListener("resize", () => {
    if (track) gsap.set(track, { y: -(current * slideHeight()) });
    if (textList) gsap.set(textList, { y: -(current * textSlideHeight()) });
    if (buttonList) gsap.set(buttonList, { y: -(current * buttonSlideHeight()) });

    let xShift = 0;
    if (isMobile()) {
      if (current === 0) xShift = thumbOffset();
      else if (current === slides.length - 1) xShift = -thumbOffset();
    }
    if (thumbList) gsap.set(thumbList, { x: xShift });
  });

  return { next, prev, goTo, startAutoplay };
}

export default sliderInit;
