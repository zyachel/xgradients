//////////////////////////////////////////////////////////////////////////////////
//                                SELECTING ELEMENTS
//////////////////////////////////////////////////////////////////////////////////
const rootEl = document.documentElement;
const bodyEl = document.body;

const inputTheme = document.querySelector('.theme-switcher__input');
const linkAbout = document.querySelector('.link__about');
const linkCollection = document.querySelector('.link__collection');

const btnMenu = document.querySelector('.header__menu-button');
const btnChange = document.querySelector('.button__change');
const btnCopy = document.querySelector('.button__copy');
const btnBookmark = document.querySelector('.bookmark');
const btnCloseAbout = document.querySelector('.about__button-close');

const menu = document.querySelector('.header__nav');
const modal = document.querySelector('.modal');
const selector = document.querySelector('.selector');
const collection = document.querySelector('.collection');
const about = document.querySelector('.about');

//////////////////////////////////////////////////////////////////////////////////
//                                HELPER FUNCTIONS
//////////////////////////////////////////////////////////////////////////////////
const Helpers = class {
  // 1.) BOOKMARKS
  #bookmarks = JSON.parse(localStorage?.getItem('bookmarks')) || [];

  #updateBookmarks() {
    localStorage?.setItem('bookmarks', JSON.stringify(this.#bookmarks));
  }

  getBookmarks() {
    return this.#bookmarks;
  }

  addBookmark(bookmark) {
    this.#bookmarks = [...new Set([...this.#bookmarks, bookmark])];
    this.#updateBookmarks();
  }

  removeBookmark(bookmark) {
    this.#bookmarks = this.#bookmarks.filter(bm => bm !== bookmark);
    this.#updateBookmarks();
  }

  // 2.) GRADIENTS
  #getRandomNumBetween(min, max, round = true) {
    return round
      ? min + Math.round(Math.random() * (max - min))
      : (min + Math.random() * (max - min)).toFixed(1);
  }

  #getRandomRGB() {
    const [c1, c2, c3] = [
      this.#getRandomNumBetween(0, 255),
      this.#getRandomNumBetween(0, 255),
      this.#getRandomNumBetween(0, 255),
    ];

    return `rgb(${c1}, ${c2}, ${c3})`;
  }

  getRandomGradient(direction = 'bottom right') {
    return `linear-gradient(to ${direction}, ${this.#getRandomRGB()}, ${this.#getRandomRGB()})`;
  }

  getGradient(el) {
    return window.getComputedStyle(el).backgroundImage;
  }

  setGradient(el, gradient) {
    el.style.backgroundImage = gradient;
  }

  // 3.) VISIBILITY
  showElements(...els) {
    els.forEach(el => {
      const className = `${el.classList[0]}--hidden`;
      el.classList.remove(className);
    });
  }

  hideElements(...els) {
    els.forEach(el => {
      const className = `${el.classList[0]}--hidden`;
      el.classList.add(className);
    });
  }

  // 3.) MISC. (tightly coupled with DOM elements)
  updateBookmarkBtn() {
    this.#bookmarks.some(bookmark => bookmark === this.getGradient(bodyEl))
      ? btnBookmark.classList.add('bookmark--active')
      : btnBookmark.classList.remove('bookmark--active');
  }

  setTheme(theme) {
    if (theme === 'dark') {
      inputTheme.setAttribute('checked', '');
      rootEl.setAttribute('data-theme', 'dark');
    } else {
      inputTheme.removeAttribute('checked');
      rootEl.removeAttribute('data-theme');
    }
  }
};
const helpers = new Helpers();

//////////////////////////////////////////////////////////////////////////////////
//                                EVENT LISTENERS
//////////////////////////////////////////////////////////////////////////////////

// 1.) ELEMENTS ON HEADER
inputTheme.addEventListener('change', e => {
  // getting theme
  const curTheme = inputTheme.checked ? 'dark' : 'light';

  // setting and saving theme
  helpers.setTheme(curTheme);
  localStorage.setItem('theme', curTheme);

  // updating bookmark button(as default bg could be bookmarked)
  helpers.updateBookmarkBtn();
});

linkCollection.addEventListener('click', e => {
  e.preventDefault();

  // selecting cards collection and clearing it
  const cards = collection.querySelector('.collection__cards');
  cards.innerHTML = '';
  // getting bookmarks
  const bookmarks = helpers.getBookmarks();

  // if bookmarks exist, creating a new card for each bookmark and adding it to cards
  !bookmarks.length
    ? (cards.innerHTML = `<p class="collection__text"> add some bookmarks first</p>`)
    : bookmarks.forEach(gradient => {
        // creating element
        const card = document.createElement('button');
        card.classList.add('collection__card');
        // adding gradient
        helpers.setGradient(card, gradient);
        // adding element to cards div
        cards.insertAdjacentElement('afterbegin', card);
      });

  // finally showing collecion
  helpers.showElements(collection);
  helpers.hideElements(selector, about, menu);
});

linkAbout.addEventListener('click', e => {
  e.preventDefault();
  helpers.showElements(about);
  helpers.hideElements(selector, collection, menu);
});

btnMenu.addEventListener('click', e => {
  menu.classList.contains('header__nav--hidden')
    ? helpers.showElements(menu)
    : helpers.hideElements(menu);
});

// ELEMENTS ON SELECTOR:
btnChange.addEventListener('click', e => {
  const el = e.target.closest('.button__change');
  // getting a new gradient
  const color = helpers.getRandomGradient();
  // setting gradient
  helpers.setGradient(bodyEl, color);

  // updating the bookmark btn(as the new grad could already exist in the bookmarks)
  helpers.updateBookmarkBtn();
});

btnCopy.addEventListener('click', async e => {
  const modalContentArea = modal.querySelector('.modal__content');
  // text to copy
  const code = `background-image: ${helpers.getGradient(bodyEl)};`;

  //   trying to copy css to clipboard
  try {
    await navigator.clipboard.writeText(code);

    // if successful, adding success message;
    modalContentArea.innerHTML =
      '<h3 class="modal__heading modal__heading--success"> Copied successfully!</h3>';
    // showing modal and hiding it after one second
    helpers.showElements(modal);
    window.setTimeout(() => helpers.hideElements(modal), 1000);

    // if failure, showing error message
  } catch (e) {
    modalContentArea.innerHTML = `<button class="modal__button-close">&times;</button><h3 class="modal__heading modal__heading--error"> error while copying! please copy the code manually</h3><pre class="modal__text code__wrapper"><code class="code">${code}</code></pre>`;
    // showing the modal so that user can copy the code manually
    helpers.showElements(modal);
    console.log(e);
  }
});

btnBookmark.addEventListener('click', e => {
  const el = e.target.closest('.bookmark');
  // getting gradient
  const curGrad = helpers.getGradient(bodyEl);
  // checking if the bookmark button is active already
  const isActive = el.classList.contains('bookmark--active');

  // if btn is active, removing bookmark; else adding it
  isActive ? helpers.removeBookmark(curGrad) : helpers.addBookmark(curGrad);

  // refreshing the bookmark button state
  helpers.updateBookmarkBtn();
});

btnCloseAbout.addEventListener('click', e => {
  helpers.hideElements(collection, about);
  helpers.showElements(selector);
});

//  BIG VIEWS DIVS
collection.addEventListener('click', e => {
  const el = e.target;
  const isSelectClicked = el.classList.contains('collection__card');
  const isCloseClicked = el.classList.contains('collection__button-close');

  //  if neither card not x button is clicked, returning
  if (!isSelectClicked && !isCloseClicked) return;

  // if card is clicked, getting gradient from card and setting it on the body
  if (isSelectClicked) {
    const grad = helpers.getGradient(el);
    helpers.setGradient(bodyEl, grad);
    btnBookmark.classList.add('bookmark--active');
  }

  // closing the collecion and showing the main screen
  helpers.hideElements(collection, about);
  helpers.showElements(selector);
});

modal.addEventListener('click', e => {
  const elClass = e.target.classList;
  // hiding modal on clicking the 'x' or the background.
  if (elClass.contains('modal__button-close') || elClass.contains('modal'))
    helpers.hideElements(modal);
});

// hiding everything except main screen(selector) on pressing escape
bodyEl.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;

  helpers.hideElements(modal, collection, about, menu);
  helpers.showElements(selector);
});

//////////////////////////////////////////////////////////////////////////////////
//                                INITIALISATION
//////////////////////////////////////////////////////////////////////////////////
// IIFE: immediately invoked function expressions
(() => {
  // 1. getting theme
  const userTheme = typeof Storage ? localStorage.getItem('theme') : null;
  const browserTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
  // 2. setting theme
  if (userTheme) helpers.setTheme(userTheme);
  else if (browserTheme) helpers.setTheme(browserTheme);

  // 3. setting bookmark in active state if it is already bookmarked
  helpers.updateBookmarkBtn();
})();

// localStorage.removeItem('bookmarks');
