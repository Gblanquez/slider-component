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

  let current = 0;
  let autoplayDelay = 3; // seconds
  let autoplayTimeline;
  let animating = false;
  let transitionGuard = false; // NEW

  // ---- INITIAL SETUP ----
  slides[0].classList.add("is-active");
  gsap.set(slides[0].querySelector(".slider-v-content"), {
    clipPath: "inset(0% 0% 0% 0%)"
  });

  // Single moving focus element
  const focusContainer = document.querySelector(".thumbnail-focus");
  thumbnails[0].appendChild(focusContainer);

  startAutoplay();

  // ---- AUTOPLAY ----
  function startAutoplay() {
    if (autoplayTimeline) autoplayTimeline.kill();

    thumbnails.forEach(t =>
      gsap.set(t.querySelector(".bg-timer"), {
        scaleX: 0,
        transformOrigin: "left center"
      })
    );

    const timer = thumbnails[current].querySelector(".bg-timer");

    autoplayTimeline = gsap.timeline({ onComplete: next });
    autoplayTimeline.to(timer, {
      scaleX: 1,
      duration: autoplayDelay,
      ease: "linear"
    });
  }

  // ---- SLIDE CHANGE ----
  function goTo(index) {
    // Prevent spam-fast clicking from breaking transitions
    if (transitionGuard) return;
    transitionGuard = true;
    setTimeout(() => {
      transitionGuard = false;
    }, 380); // feels instant but safe

    // If animations are mid-flight, hard-finish them safely
    if (animating) {
      gsap.globalTimeline.getChildren().forEach(tl => tl.progress(1));
      if (autoplayTimeline) autoplayTimeline.kill();
    }
    animating = true;

    const prev = current;
    current = (index + slides.length) % slides.length;

    const $prev = slides[prev];
    const $next = slides[current];

    const prevContent = $prev.querySelector(".slider-v-content");
    const nextContent = $next.querySelector(".slider-v-content");

    $next.classList.add("is-active");
    gsap.set(nextContent, { clipPath: "inset(100% 0% 0% 0%)" });

    // Text animation setup
    const $nextText = $next.querySelector(".slide-text");
    const split = new SplitText($nextText, { type: "lines" });
    gsap.set(split.lines, { y: "110%", overflow: "hidden" });

    // Button
    const $nextButton = $next.querySelector(".slide-button");
    gsap.set($nextButton, { y: "110%", opacity: 0 });

    // Restart autoplay
    startAutoplay();

    // Move focus highlight using FLIP
    const newFocusParent = thumbnails[current];
    const flipState = Flip.getState(focusContainer);
    newFocusParent.appendChild(focusContainer);
    Flip.from(flipState, { duration: 0.6, ease: "power2.inOut" });

    // Slide transition timeline
    const tl = gsap.timeline({
      defaults: { duration: 1.1, ease: "power3.inOut" },
      onComplete() {
        $prev.classList.remove("is-active");
        animating = false;
      }
    });

    tl
      .to(nextContent, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power4.out" }, 0)
      .to(prevContent, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.6, ease: "power4.out" }, 0.1)
      .to(split.lines, { y: "0%", duration: 1.4, ease: "expo.out", stagger: 0.05 }, 0.2)
      .to($nextButton, { y: "0%", opacity: 1, duration: 0.8, ease: "expo.out" }, 0.2);

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
    type: "touch,pointer,wheel",
    onLeft: next,
    onRight: prev
  });

  return { next, prev, goTo, startAutoplay };
}

export default sliderInit;
