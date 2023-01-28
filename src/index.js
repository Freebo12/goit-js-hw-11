import './css/styles.css';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const buttonLoadMore = document.querySelector('.load-more');

document.cookie = 'promo_shown=1; Max-Age=2600000; Secure';
('promo_shown=1; Max-Age=2600000; Secure');

const BASE_URL = 'https://pixabay.com/api/';
const keyApi = '33175218-249cfa9e0adbf794a9bfb1ae0';
const imageType = 'photo';
const orientationType = 'horizontal';
const safeSearch = 'true';
const perPage = '40';

searchForm.addEventListener('submit', onSearch);
buttonLoadMore.addEventListener('click', onClick);

let page = 1;
let searchImg = '';
let requestGallery = '';

async function onSearch(event) {
  event.preventDefault();
  gallery.innerHTML = '';
  buttonLoadMore.hidden = false;
  searchImg = event.currentTarget.searchQuery.value.trim();
  if (!searchImg) {
    buttonLoadMore.hidden = true;
    return;
  }
  if (searchImg === '') {
    buttonLoadMore.hidden = true;
    return;
  }

  console.log(searchImg);
  page = 1;
  await fetchImg(searchImg, page)
    .then(data => {
      requestGallery = createGalleryMarkup(data.hits);
      lightboxMarkup(requestGallery);
    })
    .catch(error => console.log(error));
}

async function fetchImg(searchImg, page) {
  const requestArr = await axios.get(
    `${BASE_URL}?key=${keyApi}&per_page=${perPage}&q=${searchImg}&page=${page}&image_type=${imageType}&orientation=${orientationType}&safesearch=${safeSearch}}`
  );
  console.log(requestArr);

  if (requestArr.data.hits.length === 0) {
    buttonLoadMore.hidden = true;
    Notiflix.Notify.warning(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  page += 1;
  return requestArr.data;
}

function createGalleryMarkup(array) {
  return array
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `
            <a class="gallery__item" href="${largeImageURL}">
            <div class="photo-card">
                <img class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" width="300px";/>
                <div class="info">
                  <p class="info-item">
                    <b>Likes ${likes}</b>
                  </p>
                  <p class="info-item">
                    <b>Views ${views}</b>
                  </p>
                  <p class="info-item">
                    <b>Comments ${comments}</b>
                  </p>
                  <p class="info-item">
                    <b>Downloads ${downloads}</b>
                  </p>
                </div>
            </div>
          </a>
          `
    )
    .join('');
}

function newLightbox() {
  let lightbox = new SimpleLightbox('.gallery .gallery__item', {
    scrollZoom: false,
    enableKeyboard: true,
    captionType: 'attr',
    captionsData: 'alt',
    captionPosition: 'bottom',
    captionDelay: 250,
  });
  lightbox.refresh();
}

function lightboxMarkup(markup) {
  gallery.insertAdjacentHTML('beforeend', markup);
  newLightbox(markup);
}

async function onClick() {
  page += 1;
  await fetchImg(searchImg, page)
    .then(data => {
      requestGallery = createGalleryMarkup(data.hits);
      lightboxMarkup(requestGallery);
      console.log(page);
      if (perPage * page > data.totalHits) {
        buttonLoadMore.hidden = true;
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }
    })
    .catch(error => console.log(error));
}
