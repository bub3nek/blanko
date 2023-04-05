// Найти все ссылки начинающиеся на #
const anchors = document.querySelectorAll('a[href^="#"]');

// Цикл по всем ссылкам
for (let anchor of anchors) {
  anchor.addEventListener('click', function (e) {
    e.preventDefault(); // Предотвратить стандартное поведение ссылок
    // Атрибут href у ссылки, если его нет то перейти к body (наверх не плавно)
    const goto = anchor.hasAttribute('href')
      ? anchor.getAttribute('href')
      : 'body';
    // Плавная прокрутка до элемента с id = href у ссылки
    document.querySelector(goto).scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  });
}

const preloader = window.addEventListener('load', () => {
  /* Страница загружена, включая все ресурсы */
  const preloader =
    document.querySelector('.preloader'); /* находим блок Preloader */
  preloader.classList.add(
    'preloader_hidden'
  ); /* добавляем ему класс для скрытия */
});

// Решение на JS снятие класса при клике за зону
const box = document.querySelector('.box');
document.addEventListener('click', (e) => {
  const click = e.composedPath().includes(box);
  if (!click) {
    box.style.display = 'none';
  }
});

// Добавляет класс при клике
document.querySelector('.intro_btn').onclick = function () {
  document.querySelector('.main').classList.add('main--main-bg');
};
