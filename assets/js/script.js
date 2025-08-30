'use strict';

// Currency conversion rates and symbols
const currencyData = {
  inr: { symbol: '<i class="fa-solid fa-indian-rupee-sign"></i>', rate: 1, name: 'INR' },
  usd: { symbol: '&dollar;', rate: 0.012, name: 'USD' },
  eur: { symbol: '&euro;', rate: 0.011, name: 'EUR' }
};

console.log('Currency data loaded:', currencyData);

// Currency switching functionality
function initCurrencySelector() {
  const currencySelect = document.querySelector('select[name="currency"]');
  const mobileCurrencyLinks = document.querySelectorAll('a[data-currency]');
  
  // Set current currency from localStorage or default to INR
  let currentCurrency = localStorage.getItem('selectedCurrency') || 'inr';
  
  // Update dropdown selection
  if (currencySelect) {
    currencySelect.value = currentCurrency;
    currencySelect.addEventListener('change', handleCurrencyChange);
  }
  
  // Handle mobile currency links
  mobileCurrencyLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const currency = this.getAttribute('data-currency');
      currentCurrency = currency;
      localStorage.setItem('selectedCurrency', currency);
      updateAllPrices(currency);
      updateDropdownSelection(currency);
      
      // Close mobile menu after selection
      const mobileMenu = document.querySelector('[data-mobile-menu]');
      const overlay = document.querySelector('[data-overlay]');
      if (mobileMenu && overlay) {
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
      }
    });
  });
  
  // Initialize prices with current currency
  updateAllPrices(currentCurrency);
  updateDropdownSelection(currentCurrency);
}

function handleCurrencyChange(event) {
  const selectedCurrency = event.target.value;
  console.log('Currency changed to:', selectedCurrency);
  localStorage.setItem('selectedCurrency', selectedCurrency);
  updateAllPrices(selectedCurrency);
  updateDropdownSelection(selectedCurrency);
}

function updateDropdownSelection(currency) {
  const currencySelect = document.querySelector('select[name="currency"]');
  if (currencySelect) {
    currencySelect.value = currency;
  }
  
  // Update mobile menu active state
  const mobileCurrencyLinks = document.querySelectorAll('a[data-currency]');
  mobileCurrencyLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-currency') === currency) {
      link.classList.add('active');
    }
  });
}

function updateAllPrices(currency) {
  const currencyInfo = currencyData[currency];
  
  // Update all price elements
  const priceElements = document.querySelectorAll('.price');
  const delPriceElements = document.querySelectorAll('del');
  const bannerPrices = document.querySelectorAll('.banner-text');
  const servicePrices = document.querySelectorAll('.service-desc');
  const headerAlert = document.querySelector('.header-alert-news p');
  const ctaText = document.querySelector('.cta-text');
  
  // Store original prices if not already stored
  if (!window.originalPrices) {
    window.originalPrices = {
      prices: [],
      delPrices: [],
      bannerPrices: [],
      servicePrices: [],
      headerAlert: headerAlert ? headerAlert.innerHTML : '',
      ctaText: ctaText ? ctaText.innerHTML : ''
    };
    
    priceElements.forEach(el => window.originalPrices.prices.push(el.innerHTML));
    delPriceElements.forEach(el => window.originalPrices.delPrices.push(el.innerHTML));
    bannerPrices.forEach(el => window.originalPrices.bannerPrices.push(el.innerHTML));
    servicePrices.forEach(el => window.originalPrices.servicePrices.push(el.innerHTML));
  }
  
  // Function to convert and format price
  function convertPrice(originalText, currency) {
    // Extract number from text (handles both comma-separated and decimal numbers)
    const priceMatch = originalText.match(/[\d,]+\.?\d*/);
    if (priceMatch) {
      const originalPrice = parseFloat(priceMatch[0].replace(/,/g, ''));
      let convertedPrice;
      
      if (currency === 'inr') {
        // If converting back to INR, use the original price
        convertedPrice = originalPrice;
      } else {
        // Convert from INR to other currencies
        convertedPrice = (originalPrice * currencyInfo.rate);
      }
      
      // Format the price based on currency
      const formattedPrice = currency === 'inr' ? 
        convertedPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 
        convertedPrice.toFixed(2);
      
      // Replace the symbol and price
      return originalText.replace(
        /<i[^>]*fa-indian-rupee-sign[^>]*><\/i>|&dollar;|\$|&euro;|€/g, 
        currencyInfo.symbol
      ).replace(/[\d,]+\.?\d*/, formattedPrice);
    }
    return originalText;
  }
  
  // Update prices using original stored values
  priceElements.forEach((element, index) => {
    if (window.originalPrices.prices[index]) {
      element.innerHTML = convertPrice(window.originalPrices.prices[index], currency);
    }
  });
  
  delPriceElements.forEach((element, index) => {
    if (window.originalPrices.delPrices[index]) {
      element.innerHTML = convertPrice(window.originalPrices.delPrices[index], currency);
    }
  });
  
  bannerPrices.forEach((element, index) => {
    if (window.originalPrices.bannerPrices[index]) {
      element.innerHTML = convertPrice(window.originalPrices.bannerPrices[index], currency);
    }
  });
  
  servicePrices.forEach((element, index) => {
    if (window.originalPrices.servicePrices[index] && window.originalPrices.servicePrices[index].includes('Order Over')) {
      element.innerHTML = convertPrice(window.originalPrices.servicePrices[index], currency);
    }
  });
  
  if (headerAlert && window.originalPrices.headerAlert) {
    headerAlert.innerHTML = convertPrice(window.originalPrices.headerAlert, currency);
  }
  
  if (ctaText && window.originalPrices.ctaText) {
    ctaText.innerHTML = convertPrice(window.originalPrices.ctaText, currency);
  }
}

// Initialize currency selector when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Currency selector initialized');
  initCurrencySelector();
});

// modal variables
const modal = document.querySelector('[data-modal]');
const modalCloseBtn = document.querySelector('[data-modal-close]');
const modalCloseOverlay = document.querySelector('[data-modal-overlay]');

// modal function
const modalCloseFunc = function () { modal.classList.add('closed') }

// modal eventListener
modalCloseOverlay.addEventListener('click', modalCloseFunc);
modalCloseBtn.addEventListener('click', modalCloseFunc);





// notification toast variables
const notificationToast = document.querySelector('[data-toast]');
const toastCloseBtn = document.querySelector('[data-toast-close]');

// notification toast eventListener
toastCloseBtn.addEventListener('click', function () {
  notificationToast.classList.add('closed');
});





// mobile menu variables
const mobileMenuOpenBtn = document.querySelectorAll('[data-mobile-menu-open-btn]');
const mobileMenu = document.querySelectorAll('[data-mobile-menu]');
const mobileMenuCloseBtn = document.querySelectorAll('[data-mobile-menu-close-btn]');
const overlay = document.querySelector('[data-overlay]');

for (let i = 0; i < mobileMenuOpenBtn.length; i++) {

  // mobile menu function
  const mobileMenuCloseFunc = function () {
    mobileMenu[i].classList.remove('active');
    overlay.classList.remove('active');
  }

  mobileMenuOpenBtn[i].addEventListener('click', function () {
    mobileMenu[i].classList.add('active');
    overlay.classList.add('active');
  });

  mobileMenuCloseBtn[i].addEventListener('click', mobileMenuCloseFunc);
  overlay.addEventListener('click', mobileMenuCloseFunc);

}





// accordion variables
const accordionBtn = document.querySelectorAll('[data-accordion-btn]');
const accordion = document.querySelectorAll('[data-accordion]');

for (let i = 0; i < accordionBtn.length; i++) {

  accordionBtn[i].addEventListener('click', function () {

    const clickedBtn = this.nextElementSibling.classList.contains('active');

    for (let i = 0; i < accordion.length; i++) {

      if (clickedBtn) break;

      if (accordion[i].classList.contains('active')) {

        accordion[i].classList.remove('active');
        accordionBtn[i].classList.remove('active');

      }

    }

    this.nextElementSibling.classList.toggle('active');
    this.classList.toggle('active');

  });

}