import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(Draggable, Flip, InertiaPlugin, Observer);

function sliderInit() {
  const slides = [...document.querySelectorAll(".slide-v")];
  const thumbnails = [...document.querySelectorAll(".slider-t-slide")];
  const thumbList = document.querySelector(".slider-t-list"); 
  const track = document.querySelector(".slider-v-list");

  const textList = document.querySelector(".slider-text-list");
  const textSlides = [...textList.children];

  const buttonList = document.querySelector(".slider-button-list");
  const buttonSlides = [...buttonList.children];

  const isMobile = () => window.innerWidth <= 480;

  // Desktop starts at 0, mobile starts centered
  let current = isMobile() ? Math.floor(slides.length / 2) : 0;

  let autoplayDelay = 3;
  let autoplayTimeline;
  let animating = false;
  let transitionGuard = false;

  const slideHeight = () => slides[0].offsetHeight;
  const textSlideHeight = () => textSlides[0].offsetHeight;
  const buttonSlideHeight = () => buttonSlides[0].offsetHeight;

  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const thumbOffset = () => (isMobile() ? rem * 3 : 0); // responsive offset (3rem on mobile)

  gsap.set(textList, { y: -(current * textSlideHeight()) });
  gsap.set(buttonList, { y: -(current * buttonSlideHeight()) });
  gsap.set(thumbList, { x: 0 });  
  gsap.set(track, { y: -(current * slideHeight()) });

  slides.forEach((s, i) => s.classList.toggle("is-active", i === current));

  const focusContainer = document.querySelector(".thumbnail-focus");
  thumbnails[current].appendChild(focusContainer);

  startAutoplay();

  function startAutoplay() {
    if (autoplayTimeline) autoplayTimeline.kill();

    thumbnails.forEach(t =>
      gsap.set(t.querySelector(".bg-timer"), { scaleX: 0, transformOrigin: "left center" })
    );

    const timer = thumbnails[current].querySelector(".bg-timer");

    autoplayTimeline = gsap.timeline({ onComplete: next });
    autoplayTimeline.to(timer, { scaleX: 1, duration: autoplayDelay, ease: "linear" });
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

    const prev = current;
    current = (index + slides.length) % slides.length;

    startAutoplay();

    const newFocusParent = thumbnails[current];
    const flipState = Flip.getState(focusContainer);
    newFocusParent.appendChild(focusContainer);
    Flip.from(flipState, { duration: 0.6, ease: "power2.inOut" });

    gsap.to(track, {
      y: -(current * slideHeight()),
      duration: 1.2,
      ease: "power3.inOut",
      onComplete() {
        animating = false;
        slides.forEach((s, i) => s.classList.toggle("is-active", i === current));
      }
    });

    gsap.to(textList, {
      y: -(current * textSlideHeight()),
      duration: 1,
      ease: "power3.inOut"
    });

    gsap.to(buttonList, {
      y: -(current * buttonSlideHeight()),
      duration: 1,
      ease: "power3.inOut"
    });

    let xShift = 0;
    if (current === 0) {
      xShift = thumbOffset();
    } else if (current === slides.length - 1) {
      xShift = -thumbOffset(); 
    }

    gsap.to(thumbList, {
      x: xShift,
      duration: 0.6,
      ease: "power2.out"
    });

    thumbnails.forEach((t, i) => t.classList.toggle("is-active", i === current));
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
    gsap.set(track, { y: -(current * slideHeight()) });
    gsap.set(textList, { y: -(current * textSlideHeight()) });
    gsap.set(buttonList, { y: -(current * buttonSlideHeight()) });

    let xShift = 0;
    if (current === 0) xShift = thumbOffset();
    else if (current === slides.length - 1) xShift = -thumbOffset();
    gsap.set(thumbList, { x: xShift });
  });

  return { next, prev, goTo, startAutoplay };
}

export default sliderInit;
