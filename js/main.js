//default params
const baseImgPath = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2/';
const defaultImg = 'img/no-poster.jpg';
//DOM-elements
const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvShows = document.querySelector('.tv-shows');
const tvShowList = document.querySelector('.tv-shows__list');
const preloader = document.querySelector('.preloader');
const modal = document.querySelector('.modal');
const modalImg = modal.querySelector('.tv-card__img');
const modalTitle = modal.querySelector('.modal__title');
const modalRating = modal.querySelector('.rating');
const modalDesc = modal.querySelector('.description');
const modalLink = modal.querySelector('.modal__link');
const genresList = modal.querySelector('.genres-list');
const searchForm = document.querySelector('.search__form');
const searchFormInput = searchForm.querySelector('.search__form-input');
//server's params
const APIkey = 'bea4496b0fea5898c3bad2d6f8a301f5';
const baseAPIpath = 'https://api.themoviedb.org/3/';
const queryParams = {
    query: null,
    lang: 'ru-RU',
    page: 1
}
const DBservice = class {
    constructor() {

    }

    getData = (url, callback) => {
        return fetch(url)
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

const loading = document.createElement('div');
loading.classList.add('preloader');

const renderCard = data => {
    const {results: cards} = data;

    tvShowList.innerHTML = '';
    preloader.style.display = 'block';
    const cardsNode = cards
        .map(({
                  original_name: name,
                  backdrop_path: backdrop,
                  poster_path: poster,
                  vote_average: vote,
                  id
              }) =>
            (`
              <li class="tv-shows__item">
                <a href="#" class="tv-card" data-id-tv = "${id}">
                    ${vote ? `<span class="tv-card__vote">${vote}</span>` : ''}
                   <img class="tv-card__img" src=${poster && (baseImgPath + poster) || defaultImg} data-backdrop=${backdrop && (baseImgPath + backdrop) || defaultImg}
                        alt="${name}">
                   <h4 class="tv-card__head">${name}</h4>
                </a>
              </li>
            `)
        )
        .join('');

    tvShowList.innerHTML += cardsNode;
}

const updateModal = data => {
    modalImg.src = baseImgPath + data['poster_path'];
    modalTitle.innerHTML = data.name;
    modalRating.innerHTML = data['vote_average'];
    modalDesc.innerHTML = data.overview;
    modalLink.href = data.homepage;
    genresList.innerHTML = data.genres.reduce((acc, item) => `${acc} <li>${item.name}</li>`, '');
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
    e.preventDefault();
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
        const idTv = card.dataset.idTv;
        idTv && service.getData(`${baseAPIpath}tv/${idTv}?api_key=${APIkey}&language=${queryParams.lang}`, updateModal)
            .then(() => {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
            });
    }
});
tvShowList.addEventListener('mouseover', _toggleImgSrc);
tvShowList.addEventListener('mouseout', _toggleImgSrc);
modal.addEventListener('click', e => {
    if (e.target.closest('.cross') || e.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});
searchForm.addEventListener('submit', e => {
    e.preventDefault();
    queryParams.query = searchFormInput.value.trim();
    queryParams.query && service
        .getData(`${baseAPIpath}search/tv?api_key=${APIkey}&query=${searchFormInput.value}&language=${queryParams.lang}`, renderCard)
        .then(() => preloader.style.display = 'none');
});

