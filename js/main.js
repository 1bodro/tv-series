//values
const baseImgPath = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2/';
const defaultImg = 'img/no-poster.jpg';
const APIkey = 'bea4496b0fea5898c3bad2d6f8a301f5';
const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvShows = document.querySelector('.tv-shows');
const tvShowList = document.querySelector('.tv-shows__list');
const preloader = document.querySelector('.preloader');
const modal = document.querySelector('.modal');
const modalImg =modal.querySelector('.tv-card__img');
const modalTitle =modal.querySelector('.modal__title');
const modalRaiting =modal.querySelector('.rating');
const modalDesc =modal.querySelector('.description');
const modalLink =modal.querySelector('.modal__link');
const genresList =modal.querySelector('.genres-list');


const DBservice = class {
    getData = (url, callback) => {
        fetch(url)
            .then(response => response.json())
            .then(callback)
            .catch(() => console.error(`Не удалось получить запрос по адресу ${url}`));
        // if (res.ok) {
        //     res.json().then(callback);
        // } else {
        //     throw new Error(`Не удалось получить запрос по адресу ${url}`);
        // }

    }
}

const service = new DBservice();

//helpers

function _toggleImgSrc(e) {
    const card = e.target.closest('.tv-card');

    if (card) {
        const cardImg = card.querySelector('.tv-card__img');

        if (!cardImg) return false;
        if (!cardImg.dataset.backdrop) return false;

        [cardImg.src, cardImg.dataset.backdrop] = [cardImg.dataset.backdrop, cardImg.src];
    }

}

const loading  = document.createElement('div');
loading.classList.add('preloader');


const renderCard = data => {
    const {results: cards} = data;

    tvShowList.innerHTML = '';
    preloader.style.display = 'none';
    const cardsNode = cards
        .map(( {
               original_name: name,
               backdrop_path: backdrop,
               poster_path: poster,
               vote_average: vote
               }) =>
            (`
              <li class="tv-shows__item">
                <a href="#" class="tv-card">
                    ${vote? `<span class="tv-card__vote">${vote}</span>` : ''}
                   <img class="tv-card__img" src=${poster && (baseImgPath + poster)||defaultImg} data-backdrop=${backdrop && (baseImgPath + backdrop)||defaultImg}
                        alt="${name}">
                   <h4 class="tv-card__head">${name}</h4>
                </a>
              </li>
            `)
        )
        .join('');
    tvShowList.innerHTML += cardsNode;
}

//events

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
});

document.addEventListener('click', e => {
    e.preventDefault();
    if (!e.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
        leftMenu.querySelectorAll('.dropdown')
            .forEach(i => i.classList.remove('active'))
    }
})

leftMenu.addEventListener('click', e => {
    const dropdown = e.target.closest('.dropdown');

    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }
});

tvShowList.addEventListener('click', e => {
    e.preventDefault();
    const card = e.target.closest('.tv-card');

    if (card) {
        document.body.style.overflow = 'hidden';
        modal.classList.remove('hide');
    }
});

tvShowList.addEventListener('mouseover', _toggleImgSrc);
tvShowList.addEventListener('mouseout', _toggleImgSrc);

modal.addEventListener('click', e => {

    service.getData('.card.json', response => console.log(response));

    if (e.target.closest('.cross') || e.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});

//

preloader.style.display = 'block';

service.getData('test.json', renderCard);

