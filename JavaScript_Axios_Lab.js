import * as Carousel from "./Carousel.js";
import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

const API_KEY = "live_T3oZ8no0B62zhChZrtxFaEJIiz5qzf5YVlNT5p2OB420fn7HiGj2sySg9M2l4YBD";
const BASE_URL = 'https://api.thecatapi.com/v1';

// default Axios headers and base URL
axios.defaults.headers.common['x-api-key'] = API_KEY;
axios.defaults.baseURL = BASE_URL;

//request
axios.interceptors.request.use(config => {
    // Initialize metadata if it doesn't exist
    config.metadata = config.metadata || {};
    // Log the start time of the request
    config.metadata.startTime = new Date();
    console.log(`Request started at ${config.metadata.startTime}`);
    return config;
  }, error => {
    return Promise.reject(error);
  });
  
  axios.interceptors.response.use(response => {
    // Calculate the time difference between request and response
    const elapsedTime = new Date() - response.config.metadata.startTime;
    console.log(`Request finished in ${elapsedTime} milliseconds`);
    return response;
  }, error => {
    return Promise.reject(error);
  });

async function initialLoad() {
  try {
    // Fetch the list of cat breeds from the cat API
    const response = await axios.get('/breeds');
    const breeds = response.data;

    // Create options and append them to the breedSelect
    breeds.forEach(breed => {
      const option = document.createElement('option');
      option.value = breed.id;
      option.textContent = breed.name;
      breedSelect.appendChild(option);
    });

    // Initial load for the first breed in the list
    if (breeds.length > 0) {
      loadBreedInfo(breeds[0].id);
    }
  } catch (error) {
    console.error('Error fetching cat breeds:', error);
  }
}

/**
 * Function to load breed information and update the carousel
 */
async function loadBreedInfo(breedId) {
  try {
    const response = await axios.get(`/images/search?breed_id=${breedId}&limit=10`);
    const breedImages = response.data;

    // Clear existing carousel and infoDump
    Carousel.clear();
    infoDump.innerHTML = '';

    // Append new items to the carousel
    breedImages.forEach(imageData => {
      const carouselItem = Carousel.createCarouselItem(imageData.url, imageData.breeds[0]?.name || 'Unknown', imageData.id);
      Carousel.appendCarousel(carouselItem);
    });

    // Update information section
    if (breedImages.length > 0 && breedImages[0].breeds.length > 0) {
      const breed = breedImages[0].breeds[0];
      const breedInfo = `
        <h2>${breed.name}</h2>
        <p>${breed.description}</p>
        <p><strong>Temperament:</strong> ${breed.temperament}</p>
        <p><strong>Origin:</strong> ${breed.origin}</p>
        <p><strong>Life Span:</strong> ${breed.life_span} years</p>
      `;
      infoDump.innerHTML = breedInfo;
    }

    // Restart the carousel
    Carousel.start();
  } catch (error) {
    console.error('Error fetching breed information:', error);
  }
}

// Event listener for breed selection change
breedSelect.addEventListener('change', (event) => {
  const selectedBreedId = event.target.value;
  loadBreedInfo(selectedBreedId);
});

initialLoad();
