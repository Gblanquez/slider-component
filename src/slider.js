import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(Draggable, Flip, InertiaPlugin, Observer);

function sliderInit() {
  const slides = [...document.querySelectorAll(".slide-v")];
  const thumbnails = [...document.querySelectorAll(".slider-t-slide")];
  const track = document.querySelector(".slider-v-list");

  // ---- NEW: Text list elements ----
  const textWrapper = document.querySelector(".slider-text-wrapper");
  const textList = document.querySelector(".slider-text-list");
  const textSlides = [...textList.children];

  let current = 0;
  let autoplayDelay = 3;
  let autoplayTimeline;
  let animating = false;
  let transitionGuard = false;

  // ---- INITIAL SETUP ----
  const slideHeight = () => slides[0].offsetHeight;
  const textSlideHeight = () => textSlides[0].offsetHeight;

  slides.forEach(slide => (slide.style.height = "100%"));
  track.style.display = "flex";
  track.style.flexDirection = "column";

  // Set initial text positions
  gsap.set(textList, { y: 0 });

  // Initialize buttons
  slides.forEach((slide, i) => {
    const btn = slide.querySelector(".slide-button");
    if (btn) {
      gsap.set(btn, { y: i === 0 ? 0 : "100%", opacity: i === 0 ? 1 : 0 });
    }
  });

  slides[0].classList.add("is-active");

  // Focus element for thumbnails
  const focusContainer = document.querySelector(".thumbnail-focus");
  thumbnails[0].appendChild(focusContainer);

  startAutoplay();

  // ---- AUTOPLAY ----
  function startAutoplay() {
    if (autoplayTimeline) autoplayTimeline.kill();

    thumbnails.forEach(t =>
      gsap.set(t.querySelector(".bg-timer"), { scaleX: 0, transformOrigin: "left center" })
    );

    const timer = thumbnails[current].querySelector(".bg-timer");

    autoplayTimeline = gsap.timeline({ onComplete: next });
    autoplayTimeline.to(timer, { scaleX: 1, duration: autoplayDelay, ease: "linear" });
  }

  // ---- SLIDE CHANGE ----
  function goTo(index) {
    if (index === current || transitionGuard) return;
    transitionGuard = true;
    setTimeout(() => (transitionGuard = false), 200);

    if (animating) {
      gsap.globalTimeline.getChildren().forEach(tl => tl.progress(1));
      if (autoplayTimeline) autoplayTimeline.kill();
    }
    animating = true;

    const prev = current;
    current = (index + slides.length) % slides.length;

    const $prev = slides[prev];
    const $next = slides[current];
    const $prevButton = $prev.querySelector(".slide-button");
    const $nextButton = $next.querySelector(".slide-button");

    // Restart autoplay
    startAutoplay();

    // FLIP highlight for thumbnail
    const newFocusParent = thumbnails[current];
    const flipState = Flip.getState(focusContainer);
    newFocusParent.appendChild(focusContainer);
    Flip.from(flipState, { duration: 0.6, ease: "power2.inOut" });

    // ---- MOVE SLIDER ----
    gsap.to(track, {
      y: -(current * slideHeight()),
      duration: 1.2,
      ease: "power3.inOut",
      onComplete() {
        animating = false;
        slides.forEach((s, i) => s.classList.toggle("is-active", i === current));
      }
    });

    // ---- MOVE TEXT LIST ----
    gsap.to(textList, {
      y: -(current * textSlideHeight()),
      duration: 1,
      ease: "power3.inOut"
    });

    // ---- BUTTONS ----
    if ($prevButton) {
      gsap.to($prevButton, { y: "100%", opacity: 0, duration: 0.6, ease: "expo.in" });
    }
    if ($nextButton) {
      gsap.fromTo(
        $nextButton,
        { y: "100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.6, ease: "expo.out", delay: 0.1 }
      );
    }

    thumbnails.forEach((t, i) => t.classList.toggle("is-active", i === current));
  }

  // ---- NEXT / PREV ----
  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // ---- CLICK THUMBNAILS ----
  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener("click", () => goTo(index));
  });

  // ---- SWIPE / TOUCH ----
  Observer.create({
    target: document.querySelector(".slider-v-wrapper"),
    type: "touch,pointer",
    onUp: prev,
    onDown: next
  });

  // ---- HANDLE RESIZE ----
  window.addEventListener("resize", () => {
    gsap.set(track, { y: -(current * slideHeight()) });
    gsap.set(textList, { y: -(current * textSlideHeight()) });
  });

  return { next, prev, goTo, startAutoplay };
}

export default sliderInit;
