//default params

const baseImgPath = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2/';
const defaultImg = './img/no-poster.jpg';

//DOM-elements

const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvShowList = document.querySelector('.tv-shows__list');
const preloader = document.querySelector('.preloader');

//popup's DOM-elements

const modal = document.querySelector('.modal');
const modalImg = modal.querySelector('.tv-card__img');
const modalTitle = modal.querySelector('.modal__title');
const modalRating = modal.querySelector('.rating');
const modalDesc = modal.querySelector('.description');
const modalLink = modal.querySelector('.modal__link');
const genresList = modal.querySelector('.genres-list');
const searchForm = document.querySelector('.search__form');
const searchFormInput = searchForm.querySelector('.search__form-input');
const pagination = document.querySelector('.pagination');

//server's params

const APIkey = 'bea4496b0fea5898c3bad2d6f8a301f5';
const baseAPIpath = 'https://api.themoviedb.org/3/';
const queryParams = {
    query: null,
    lang: 'ru-RU',
    page: 1
}

//server

const DBservice = class {
    constructor() {
        this.url = null;
        this.page = 1;
        this.totalPage = 1;
        this.getData = this.getData.bind(this);
        this.getDataByPageNumber = this.getDataByPageNumber.bind(this);
        this.getRequest = this.getRequest.bind(this);
    }

    getRequest = (url, callback) => {
        return fetch(url)
            .then(response => response.json())
            .then(data => callback && callback(data))
            .catch(() => console.error(`Не удалось получить запрос по адресу ${url}`));
    }

    getData = (url, callback) => {
        this.url = url;
        this.getRequest(url, callback)
            .then(totalPages => {
                if (totalPages > 1) {
                    this.totalPage = totalPages;
                    renderPagination(totalPages);
                }
            })
            .finally(() => preloader.style.display = 'none');
    }

    getDataByPageNumber = (page, callback) => {
        this.page = page;
        this.getRequest(`${this.url}&page=${page}`, callback)
            .finally(() => preloader.style.display = 'none');
    }

    getDataByPaginationArrow = (direction, callback) => {

        switch (direction) {
            case 'right': {
                this.page++;
                break
            }
            case 'left': {
                this.page--;
                break
            }
            default:
                break;
        }

        return this.getDataByPageNumber(this.page, callback);
    }
}
const service = new DBservice();

window.service = service;

//helpers

const toggleImgSrc = e => {
    const card = e.target.closest('.tv-card');

    if (card) {
        const cardImg = card.querySelector('.tv-card__img');

        if (!cardImg) return false;
        if (!cardImg.dataset.backdrop) return false;

        [cardImg.src, cardImg.dataset.backdrop] = [cardImg.dataset.backdrop, cardImg.src];
    }

};
const loading = () => {
    document.createElement('div');
    loading.classList.add('preloader');
};
const noResultsNode = text => (`
    <div class ="request-error">
        <h3 class="request-error__title">${text}</h3>
        <img class= "request-error__img" src="./img/404.png" />
    </div>
    `);
const renderPagination = pagesCount => {
    for (let i = 1; i < pagesCount; i++) {
        const page = document.createElement('li');
        page.textContent = `${i}`;
        pagination.appendChild(page);
        page.addEventListener('click', e => {
                service.getDataByPageNumber(i, renderCard);
            }
        );
    }
};
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

    tvShowList.innerHTML += cardsNode || noResultsNode('Нет результатов соответсвтующих вашему заросу');

    return data.total_pages
};
const updateModal = data => {
    modalImg.src = data['poster_path'] && (baseImgPath + data['poster_path']) || defaultImg;
    modalImg.alt = data.name;
    modalTitle.innerHTML = data.name;
    modalRating.innerHTML = data['vote_average'];
    modalDesc.innerHTML = data.overview;
    modalLink.href = data.homepage;
    genresList.innerHTML = data.genres.reduce((acc, item) => `${acc} <li>${item.name}</li>`, '');
};
const getDataForMenuItem = (e, items) => {
    Object.keys(items).some(id => _onCLickMenuItem(e, id));

    function _onCLickMenuItem(e, id) {
        if (e.target.closest(`#${id}`)) {
            service
                .getData(`${baseAPIpath}tv/${items[id]}?api_key=${APIkey}&query=${searchFormInput.value}&language=${queryParams.lang}`, renderCard);
        }
    }
};
const dropDownMenuItem = dropdown => {
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }
};

//events

hamburger.addEventListener('click', e => {
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
    const menuItems = {
        'search': '1111',
        'top-rated': 'top_rated',
        'popular': 'popular',
        'today': 'airing_today',
        'week': 'on_the_air'
    };

    dropDownMenuItem(dropdown);
    getDataForMenuItem(e, menuItems);
});
tvShowList.addEventListener('click', e => {
    e.preventDefault();
    const card = e.target.closest('.tv-card');
    if (card) {
        const idTv = card.dataset.idTv;
        idTv && service.getRequest(`${baseAPIpath}tv/${idTv}?api_key=${APIkey}&language=${queryParams.lang}`, updateModal)
            .finally(() => {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
            });
    }
});
tvShowList.addEventListener('mouseover', toggleImgSrc);
tvShowList.addEventListener('mouseout', toggleImgSrc);
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
        .getData(`${baseAPIpath}search/tv?api_key=${APIkey}&query=${searchFormInput.value}&language=${queryParams.lang}`, renderCard);
});
