import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(Draggable, Flip, InertiaPlugin, Observer, ScrollTrigger);

function underlineAnimation() {
  const elements = document.querySelectorAll('[data-a="underline"]');

  elements.forEach(el => {

    const text = el.innerHTML;
    el.innerHTML = `<span class="underline-text">${text}</span>
                    <div class="underline-container">
                      <div class="underline-line"></div>
                      <div class="underline-line-hover"></div>
                    </div>`;


    el.style.position = "relative";
    el.style.display = "inline-block";

    const container = el.querySelector(".underline-container");
    const line1 = el.querySelector(".underline-line");
    const line2 = el.querySelector(".underline-line-hover");


    Object.assign(container.style, {
      position: "absolute",
      bottom: "0",
      left: "0",
      width: "100%",
      height: "0.04em",
      overflow: "hidden",
    });


    Object.assign(line1.style, {
      position: "absolute",
      bottom: "0",
      left: "0",
      height: "100%",
      width: "100%",
      backgroundColor: "currentColor",
      transformOrigin: "left center",
      transform: "scaleX(0)"
    });


    Object.assign(line2.style, {
      position: "absolute",
      bottom: "0",
      left: "0",
      height: "100%",
      width: "100%",
      backgroundColor: "currentColor",
      transformOrigin: "left center",
      transform: "translateX(-110%) scaleX(1)"
    });


    gsap.to(line1, {
      scaleX: 1,
      duration: 1.4,
      ease: "expo.out",
      scrollTrigger: {
        trigger: el,
        start: "bottom 90%", 
        toggleActions: "play none none none",
      }
    });


    el.addEventListener("mouseenter", () => {
      const tl = gsap.timeline();
      tl.to(line1, {
        scaleX: 0,
        transformOrigin: "right center",
        duration: 1.2,
        ease: "expo.out",
      }, 0);
      tl.to(line2, {
        transform: "translateX(0%) scaleX(1)",
        duration: 1.2,
        ease: "expo.out",
      }, 0.08); 
    });

    el.addEventListener("mouseleave", () => {
      const tleave = gsap.timeline();
      tleave.to(line1, {
        scaleX: 1,
        transformOrigin: "right center",
        duration: 1.2,
        ease: "expo.out",
      }, 0.08);
      tleave.to(line2, {
        transform: "translateX(-110%) scaleX(1)",
        duration: 1.2,
        ease: "expo.out",
      }, 0);
    });
  });
}

export default underlineAnimation;
