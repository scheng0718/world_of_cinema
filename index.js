const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const listMode = document.querySelector('#list-mode-button')
const cardMode = document.querySelector('#card-mode-button')
const heartIcon = document.querySelector('.fa-heart')

const targetStyle = "color: #1e90ff;"
const movies = []
let filteredMovies = []
let mode = 'card'
let page = 1

// Render paginator based on movies list
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}
// Render card mode and check if the id in favorite list
function renderCardMode(rawHTML, item) {
  if (isInFavoriteList(item.id)) {
    rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card" >
              <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id=${item.id}>More</button>
                <button class="btn btn-info btn-add-favorite" data-id=${item.id}>Add</button>
                <i class="fa-solid fa-heart fa-2xl card-mode-heart" id="heart${item.id}" data-id="${item.id}" style="color: #dc143c;"></i>               
              </div>
            </div>
          </div>
        </div>
      `
  } else {
    rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card" >
              <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id=${item.id}>More</button>
                <button class="btn btn-info btn-add-favorite" data-id=${item.id}>Add</button>
                <i class="fa-regular fa-heart fa-2xl card-mode-heart" id="heart${item.id}" data-id="${item.id}" style="color: #dc143c;"></i>               
              </div>
            </div>
          </div>
        </div>
      `
  }
  return rawHTML
}
// Render list mode and check if the id in favorite list
function renderListMode(rawHTML, item) {
  if (isInFavoriteList(item.id)) {
    rawHTML += `
        <div class="col-sm-12">
          <div class="mb-2">
            <ul class="list-group">
              <li class="list-group-item d-flex justify-content-between">
                <h5 class="card-title">${item.title}</h5>
                <div class="list-button">
                  <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id=${item.id}>More</button>
                  <button class="btn btn-info btn-add-favorite" data-id=${item.id}>Add</button>
                  <i class="fa-solid fa-heart fa-2xl list-mode-heart" id="heart${item.id}" data-id="${item.id}" style="color: #dc143c;"></i>
                </div>
              </li>
            </ul>
          </div>
        </div>
      `  
  } else {
    rawHTML += `
        <div class="col-sm-12">
          <div class="mb-2">
            <ul class="list-group">
              <li class="list-group-item d-flex justify-content-between">
                <h5 class="card-title">${item.title}</h5>
                <div class="list-button">
                  <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id=${item.id}>More</button>
                  <button class="btn btn-info btn-add-favorite" data-id=${item.id}>Add</button>
                  <i class="fa-regular fa-heart fa-2xl list-mode-heart" id="heart${item.id}" data-id="${item.id}" style="color: #dc143c;"></i>
                </div>
              </li>
            </ul>
          </div>
        </div>
      `
  }
  return rawHTML
}

function renderMovieList(data, mode) {
  let rawHTML = ''
  data.forEach(item => {
    //title, image
    if (mode === 'card') {
      rawHTML = renderCardMode(rawHTML, item)
    } else {
      rawHTML = renderListMode(rawHTML, item)
    }
  })
  // processing
  dataPanel.innerHTML = rawHTML
}
// Check if the id exists in favorite movie
function isInFavoriteList(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const favoriteMovie = list.find(movie => movie.id === id)
  return favoriteMovie === undefined ? false : true
}
// Determine how many data will be displayed by each page
function getMoviesByPages(page) {
  //page 1-> 0-11, page2 -> 12-23, page3-> 24-35
  // movies ? 'movies' ? "filteredMovies" considering either movies or filteredMovies
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}
// Display modal information
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    //response.data.results
    const data =response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date is ' + data.release_date 
    modalDescription.innerText = data.description
    modalImage.innerHTML = `
    <img src="${POSTER_URL + data.image}" alt="movie-poster" class="image-fluid">`
  })
}
function searchFormSubmitted(event) {
  event.preventDefault()
  const keywords = searchInput.value.trim().toLowerCase()
  // Use filter() to filter the movie lists based on input keyword
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keywords))
  if (filteredMovies.length === 0) {
    alert('Cannot find the movies based on keywords: ' + keywords)
    renderMovieList(movies, mode)
  } else {
    renderPaginator(filteredMovies.length)
    renderMovieList(getMoviesByPages(1), mode)
  }
}
function paginatorClicked(event) {
  if (event.target.tagName !== 'A') return 
  page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPages(page), mode)
}
function panelClicked(event) {
  if (event.target.matches('.btn-show-movie')){
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    const id = event.target.dataset.id
    const heartIcon = document.querySelector('#heart' + id)
    heartIcon.classList.replace('fa-regular', 'fa-solid')
    addToFavorite(Number(id))
  } else if (event.target.matches('.fa-heart')) {
    const id = event.target.dataset.id
    if (event.target.matches('.fa-regular')){
      event.target.classList.replace('fa-regular', 'fa-solid')
      addToFavorite(Number(id))
    } else if (event.target.matches('.fa-solid')){
      event.target.classList.replace('fa-solid', 'fa-regular')
      removeFromFavorite(Number(id))
    }
  } 
}
// Add to Favorite
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const favoriteMovie = movies.find(movie => movie.id === id)
  if (list.some(movie => movie.id === id)) {
    return alert('The movie is already in your favorite list')
  }
  list.push(favoriteMovie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}
// Remove movie from local storage
function removeFromFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies'))
  const removedMovieIndex = list.findIndex(movie => movie.id === id)
  if (removedMovieIndex === -1) return
  list.splice(removedMovieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}
// Display list mode
function changeToListMode(event) {
  cardMode.removeAttribute('style')
  listMode.setAttribute('style', targetStyle)
  mode = 'list'
  renderMovieList(getMoviesByPages(page), mode)
}
// Display card mode 
function changeToCardMode(event) {
  listMode.removeAttribute('style')
  cardMode.setAttribute('style', targetStyle)
  mode = 'card'
  renderMovieList(getMoviesByPages(page), mode)
}

// Show more info regarding clicked movie
dataPanel.addEventListener('click', panelClicked)
// Paginator clicked event
paginator.addEventListener('click', paginatorClicked)
// Search feature
searchForm.addEventListener('click', searchFormSubmitted)
// List Mode
listMode.addEventListener('click', changeToListMode)
// Card Mode
cardMode.addEventListener('click', changeToCardMode)
// TODO: pagination for favorite page 

// Send HTTP GET request and get the response through API
axios.get(INDEX_URL)
  .then((response) => {
  // use spread operator (...) instead of for-of method
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPages(1), mode)
  })
  .catch(err => console.log(err))