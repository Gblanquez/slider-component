import './styles/style.css'
import sliderInit from './slider'
import underlineAnimation from './link'

document.addEventListener("DOMContentLoaded", () => {
    const elements = document.querySelectorAll('[data-a="underline"]');
    if (elements.length > 0) {

      requestAnimationFrame(() => {
        underlineAnimation();
      });
    }
    sliderInit();
  });
  


