const transition = document.getElementById('transition');
const saver = document.getElementById('screensaver');
const modal = document.getElementById('contactModal');
const contactFooter = document.getElementById('contactFooter');
const contactClose = document.getElementById('contactClose');
const sleepImage = document.getElementById('sleepImage');
const sleepQuote = document.getElementById('sleepQuote');
const sleepTheme = document.getElementById('sleepTheme');

const IDLE_DELAY = 30000;
const SLIDE_DELAY = 9000;
const OPENING_HOLD = 900 * 1.05;
const OPENING_FADE = 650 * 1.05;
const WAKE_FACTOR = 0.95;
let idleTimer;
let slideTimer;
let slideIndex = 0;
let transitionTimer;
let transitionEndTimer;
let slideRenderTimer;
let transitioning = true;

const slides = [
  { image:'assets/media/PHX_YACHT_SUNSET.jpeg', quote:'Même sur une pierre froide, la persévérance finit par la réchauffer.', theme:'Persévérance et endurance' },
  { image:'assets/media/PHX_SUPERYACHT_AERIAL.jpeg', quote:'Tomber sept fois, se relever huit fois.', theme:'Résilience et dépassement' },
  { image:'assets/media/PHX_ENGINE_CAD.jpeg', quote:'Ne jamais oublier l’état d’esprit humble et sincère des débuts.', theme:'Humilité et maîtrise' },
  { image:'assets/media/PHX_ENGINE_ROOM.jpeg', quote:'Si l’on veut arriver vite, mieux vaut choisir la voie sûre plutôt que le raccourci risqué.', theme:'Prudence et fiabilité' },
  { image:'assets/media/PHX_PROCESSOR.jpeg', quote:'Étudier le passé pour faire émerger du nouveau.', theme:'Innovation et transmission' },
  { image:'assets/media/PHX_LAGOON.jpeg', quote:'Un voyage de mille lieues commence sous les pieds, par le premier pas.', theme:'Vision et exécution' },
  { image:'assets/media/PHX_ENGINEERING_ROOM.jpeg', quote:'À force de tomber, l’eau finit par percer la pierre ; la constance mène au résultat.', theme:'Persévérance et précision' },
  { image:'assets/media/PHX_SUPERYACHT_PROFILE.jpeg', quote:'Rester aussi attentif à la fin qu’au commencement ; rester constant jusqu’au bout.', theme:'Rigueur et constance' },
  { image:'assets/media/PHX_YACHT_HORIZON.jpeg', quote:'Déjà bon, chercher encore mieux : tendre vers le plus abouti.', theme:'Excellence et amélioration continue' },
  { image:'assets/media/PHX_ISLAND.jpeg', quote:'Une grande vertu permet de porter de grandes responsabilités.', theme:'Responsabilité et leadership' }
];

function hideTransition(){ transition?.classList.remove('active'); }
function playArrival(factor = 1){
  clearTimeout(transitionTimer);
  clearTimeout(transitionEndTimer);
  clearTimeout(idleTimer);
  transitioning = true;
  // Reprendre le même écran d’arrivée, sans fondu préalable depuis la veille.
  transition.style.transition = 'none';
  transition.classList.add('active');
  void transition.offsetWidth;
  transition.style.transition = `opacity ${OPENING_FADE * factor}ms`;
  transitionTimer = setTimeout(() => {
    hideTransition();
    transitionEndTimer = setTimeout(() => {
      transitioning = false;
      resetIdle();
    }, OPENING_FADE * factor);
  }, OPENING_HOLD * factor);
}
window.addEventListener('load', () => playArrival());

function openContact(){
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  clearTimeout(idleTimer);
}
function closeContact(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  resetIdle();
}
contactFooter?.addEventListener('click', openContact);
contactClose?.addEventListener('click', closeContact);
modal?.addEventListener('click', e => { if(e.target === modal) closeContact(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && modal.classList.contains('open')) closeContact(); });

function renderSlide(index){
  const slide = slides[index];
  sleepImage.style.opacity = '0';
  clearTimeout(slideRenderTimer);
  slideRenderTimer = setTimeout(() => {
    sleepImage.src = slide.image;
    sleepQuote.textContent = slide.quote;
    sleepTheme.textContent = slide.theme;
    sleepImage.style.opacity = '1';
  }, 250);
}
function nextSlide(){
  slideIndex = (slideIndex + 1) % slides.length;
  renderSlide(slideIndex);
}
function startSlides(){
  clearInterval(slideTimer);
  renderSlide(slideIndex);
  slideTimer = setInterval(nextSlide, SLIDE_DELAY);
}
function stopSlides(){ clearInterval(slideTimer); clearTimeout(slideRenderTimer); }
function openSaver(){
  if(transitioning || modal.classList.contains('open')) return;
  saver.classList.add('open');
  saver.setAttribute('aria-hidden','false');
  startSlides();
}
function closeSaver(){
  if(!saver.classList.contains('open')) return false;
  saver.classList.remove('open');
  saver.setAttribute('aria-hidden','true');
  stopSlides();
  return true;
}
function resetIdle(){
  clearTimeout(idleTimer);
  if(!transitioning && !saver.classList.contains('open') && !modal.classList.contains('open')){
    idleTimer = setTimeout(openSaver, IDLE_DELAY);
  }
}
function wake(){
  if(saver.classList.contains('open')){
    playArrival(WAKE_FACTOR);
    closeSaver();
    return;
  }
  resetIdle();
}
// Le geste qui ferme la veille ne doit pas activer un lien sous-jacent.
document.addEventListener('click', e => {
  if(transitioning || saver.classList.contains('open')){
    e.preventDefault();
    e.stopImmediatePropagation();
    wake();
  }
}, true);
['mousemove','mousedown','keydown','touchstart','scroll'].forEach(eventName => {
  document.addEventListener(eventName, wake, {passive:true});
});
resetIdle();
