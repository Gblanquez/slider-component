import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Observer } from "gsap/Observer";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(Draggable, Flip, InertiaPlugin, Observer, SplitText);

function sliderInit() {
  const slides = [...document.querySelectorAll(".slide-v")];
  const thumbnails = [...document.querySelectorAll(".slider-t-slide")];
  const track = document.querySelector(".slider-v-list");

  let current = 0;
  let autoplayDelay = 3;
  let autoplayTimeline;
  let animating = false;
  let transitionGuard = false;

  // ---- INITIAL SETUP ----
  const slideHeight = () => slides[0].offsetHeight;

  slides.forEach(slide => (slide.style.height = "100%")); // Use wrapper height
  track.style.display = "flex";
  track.style.flexDirection = "column";

  // Initialize SplitText for all slides
  const allSplits = slides.map((slide, i) => {
    const textEl = slide.querySelector(".slide-text");
    if (!textEl) return null;
    const split = new SplitText(textEl, { type: "lines", mask: "lines" });
    gsap.set(split.lines, {
      y: i === 0 ? "0%" : "110%",
      opacity: i === 0 ? 1 : 0
    });
    return split;
  });

  // Initialize buttons
  slides.forEach((slide, i) => {
    const btn = slide.querySelector(".slide-button");
    if (btn) {
      gsap.set(btn, { y: i === 0 ? "0%" : "100%", opacity: i === 0 ? 1 : 0 });
    }
  });

  slides[0].classList.add("is-active");

  // Focus element
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
    const splitPrev = allSplits[prev];
    const splitNext = allSplits[current];
    const $nextButton = $next.querySelector(".slide-button");
    const prevButton = $prev.querySelector(".slide-button");

    // Restart autoplay
    startAutoplay();

    // FLIP highlight
    const newFocusParent = thumbnails[current];
    const flipState = Flip.getState(focusContainer);
    newFocusParent.appendChild(focusContainer);
    Flip.from(flipState, { duration: 0.6, ease: "power2.inOut" });

    // ---- LEAVING TEXT / BUTTON ----
    if (splitPrev) {
      gsap.killTweensOf(splitPrev.lines);
      gsap.to(splitPrev.lines, {
        y: "-100%",
        opacity: 0,
        duration: 0.6,
        ease: "expo.in",
        stagger: 0.02
      });
    }

    if (prevButton) {
      gsap.killTweensOf(prevButton);
      gsap.to(prevButton, { y: "100%", opacity: 0, duration: 0.6, ease: "expo.in" });
    }

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

    // ---- ENTERING TEXT / BUTTON ----
    if (splitNext) {
      gsap.killTweensOf(splitNext.lines);
      gsap.fromTo(
        splitNext.lines,
        { y: "110%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.6, ease: "expo.out", stagger: 0.02, delay: 0.1 }
      );
    }

    if ($nextButton) {
      gsap.killTweensOf($nextButton);
      gsap.fromTo(
        $nextButton,
        { y: "100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.6, ease: "expo.out", delay: 0.15 }
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
  });

  return { next, prev, goTo, startAutoplay };
}

export default sliderInit;
