const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

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
              <button class="btn btn-info btn-add-favorite">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  // processing
  dataPanel.innerHTML = rawHTML
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
function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keywords = searchInput.value.trim().toLowerCase()
  let filteredMovie = []
  // Use filter() to filter the movie lists based on input keyword
  filteredMovie = movies.filter(movie => movie.title.toLowerCase().includes(keywords))
  if (filteredMovie.length == 0) {
    alert('Cannot find the movies based on keywords: ' + keywords)
    renderMovieList(movies)
  } else {
    renderMovieList(filteredMovie)
  }
}
// Show more info regarding clicked movie
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')){
    showMovieModal(Number(event.target.dataset.id))
  }  
})
// Search feature
searchForm.addEventListener('click', onSearchFormSubmitted)

// Send HTTP GET request and get the response through API
axios.get(INDEX_URL).then((response) => {
  // use spread operator (...) instead of for-of method
  movies.push(...response.data.results)
  renderMovieList(movies)
})