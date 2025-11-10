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
  let animating = false;
  let autoplayDelay = 3; // seconds
  let autoplayTimeline;

  // Setup first slide
  slides[0].classList.add("is-active");
  gsap.set(slides[0].querySelector(".slider-v-content"), {
    clipPath: "inset(0% 0% 0% 0%)"
  });

  // Start the autoplay + bg-timer for first slide
  startAutoplay();

  function startAutoplay() {
    // Kill any previous timeline
    if (autoplayTimeline) autoplayTimeline.kill();

    // Reset all timers
    thumbnails.forEach(t =>
      gsap.set(t.querySelector(".bg-timer"), { scaleX: 0, transformOrigin: "left center" })
    );

    const timer = thumbnails[current].querySelector(".bg-timer");

    // Build a timeline: bg-timer fills + next slide after autoplayDelay
    autoplayTimeline = gsap.timeline({
      onComplete: next
    });

    autoplayTimeline.to(timer, {
      scaleX: 1,
      duration: autoplayDelay,
      ease: "linear"
    });
  }

  function goTo(index) {
    if (animating) return;
    animating = true;

    const prev = current;
    current = (index + slides.length) % slides.length;

    const $prev = slides[prev];
    const $next = slides[current];

    const prevContent = $prev.querySelector(".slider-v-content");
    const nextContent = $next.querySelector(".slider-v-content");

    // Prepare next slide
    $next.classList.add("is-active");
    gsap.set(nextContent, { clipPath: "inset(100% 0% 0% 0%)" });

    // Split the text for line animation
    const $nextText = $next.querySelector(".slide-text");
    const split = new SplitText($nextText, { type: "lines" });
    gsap.set(split.lines, { y: '110%', overflow: "hidden" });

    // Prepare the button
    const $nextButton = $next.querySelector(".slide-button");
    gsap.set($nextButton, { y: '110%', opacity: 0 });

    // Restart autoplay for new slide
    startAutoplay();

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
      .fromTo($next, { scale: 1 }, { scale: 1, duration: 1.2, ease: "expo.out" }, 0)
      .to(split.lines, { y: '0%', duration: 1.4, ease: "expo.out", stagger: 0.05 }, 0.2)
      .to($nextButton, { y: '0%', opacity: 1, duration: 0.8, ease: "expo.out" }, 0.2);

    // Highlight current thumbnail
    thumbnails.forEach((t, i) => t.classList.toggle("is-active", i === current));
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  // Clickable thumbnails
  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
      goTo(index);
    });
  });

  // Swipe / touch navigation
  Observer.create({
    target: document.querySelector(".slider-v-wrapper"),
    type: "touch,pointer,wheel",
    onLeft: next,
    onRight: prev
  });

  return { next, prev, goTo, startAutoplay };
}

export default sliderInit;
