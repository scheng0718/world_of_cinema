const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

// Render paginator based on movies list
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function renderMovieList(data) {
  let rawHTML = ''

  data.forEach(item => {
    //title, image
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
            </div>
          </div>
        </div>
      </div>
    `
  })
  // processing
  dataPanel.innerHTML = rawHTML
}
// Determine how many data will be displayed by each page
function getMoviesByPages(page) {
  //page 1-> 0-11, page2 -> 12-23, page3-> 24-35
  // movies ? 'movies' ? "filteredMovies" considering either movies or filteredMovies
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

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
    renderMovieList(movies)
  } else {
    renderPaginator(filteredMovies.length)
    renderMovieList(getMoviesByPages(1))
  }
}
function paginatorClicked(event) {
  if (event.target.tagName !== 'A') return 
  const page = Number(event.target.dataset.page)
  // console.log(event.target.dataset.page) 
  renderMovieList(getMoviesByPages(page))
}
function panelClicked(event) {
  if (event.target.matches('.btn-show-movie')){
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }  
}
// Add to Favorite
function addToFavorite(id) {
  // console.log(id)
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const favoriteMovie = movies.find(movie => movie.id === id)
  // console.log(favoriteMovie)
  if (list.some(movie => movie.id === id)) {
    return alert('The movie is already in your favorite list')
  }
  list.push(favoriteMovie)
  // console.log(list)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}
// Show more info regarding clicked movie
dataPanel.addEventListener('click', panelClicked)
// Paginator clicked event
paginator.addEventListener('click', paginatorClicked)
// Search feature
searchForm.addEventListener('click', searchFormSubmitted)
// TODO:search based on input 

// Send HTTP GET request and get the response through API
axios.get(INDEX_URL)
  .then((response) => {
  // use spread operator (...) instead of for-of method
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPages(1))
  })
  .catch(err => console.log(err))