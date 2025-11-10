import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Observer } from "gsap/Observer";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(Draggable, Flip, InertiaPlugin, Observer, SplitText);

function sliderInit() {
  const slides = [...document.querySelectorAll(".slide-v")];
  let current = 0;
  let animating = false;

  let autoplayDelay = 3; // seconds
  let autoplayTimer;

  // Setup first slide
  slides[0].classList.add("is-active");
  gsap.set(slides[0].querySelector(".slider-v-content"), {
    clipPath: "inset(0% 0% 0% 0%)"
  });

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = gsap.delayedCall(autoplayDelay, next);
  }

  function stopAutoplay() {
    if (autoplayTimer) autoplayTimer.kill();
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
    gsap.set(nextContent, { clipPath: "inset(100% 0% 0% 0%)" }); // hidden from bottom

    const tl = gsap.timeline({
      defaults: { duration: 1.1, ease: "power3.inOut" },
      onComplete() {
        $prev.classList.remove("is-active");
        animating = false;
        startAutoplay();
      }
    });

    tl
      // Reveal next slide (bottom → top)
      .to(nextContent, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.6,
        ease:"power4.out"},
        0)

      // Hide previous slide (bottom → top)
      .to(prevContent,{
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 1.6,
        ease: "power4.out"
        },
         0.1)

      // Cinematic scale easing
      .fromTo(
        $next,
        { scale: 1 },
        { scale: 1, duration: 1.2, ease: "expo.out" },
        0
      );
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  // Swipe / touch navigation
  Observer.create({
    target: document.querySelector(".slider-v-wrapper"),
    type: "touch,pointer,wheel",
    onLeft: next,
    onRight: prev
  });

  // Start autoplay
  startAutoplay();

  return { next, prev, goTo, startAutoplay, stopAutoplay };
}

export default sliderInit;
