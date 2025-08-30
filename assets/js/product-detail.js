/**
 * Product Detail Page JavaScript
 * Handles product display, interactions, and dynamic content
 */

class ProductDetailPage {
  constructor() {
    this.currentProduct = null;
    this.selectedSize = 'M';
    this.selectedColor = 'black';
    this.quantity = 1;
    this.apiService = new window.MockAPIService();
    
    this.init();
  }

  init() {
    this.loadProductFromURL();
    this.setupEventListeners();
    this.initializeProductOptions();
  }

  loadProductFromURL() {
    // Get product ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
      this.loadProduct(parseInt(productId));
    } else {
      // Default to first product if no ID specified
      this.loadProduct(1);
    }
  }

  loadProduct(productId) {
    // Get product from API service
    const product = this.apiService.products.find(p => p.id === productId);
    
    if (product) {
      this.currentProduct = product;
      this.displayProduct(product);
      this.loadRelatedProducts(product);
      this.loadProductReviews(product);
    } else {
      this.showError('Product not found');
    }
  }

  displayProduct(product) {
    // Update page title
    document.title = `${product.name} - Shopr`;
    document.getElementById('product-title').textContent = product.name;

    // Update breadcrumb
    document.getElementById('breadcrumb-category').textContent = this.capitalizeFirst(product.category);
    document.getElementById('breadcrumb-product').textContent = product.name;

    // Update main product image
    const mainImage = document.getElementById('main-product-image');
    mainImage.src = product.image;
    mainImage.alt = product.name;

    // Update thumbnail images (use same image for demo, in real app would have multiple angles)
    for (let i = 1; i <= 4; i++) {
      const thumb = document.getElementById(`thumb-${i}`);
      if (thumb) {
        thumb.src = product.image;
        thumb.alt = `${product.name} view ${i}`;
      }
    }

    // Update product badges
    const badgeElement = document.getElementById('product-badge');
    if (product.trending) {
      badgeElement.textContent = '🔥 Trending';
      badgeElement.className = 'badge trending';
      badgeElement.style.display = 'inline-block';
    } else if (product.bestDeal || product.originalPrice) {
      const discount = product.originalPrice ? 
        Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
      badgeElement.textContent = `${discount}% OFF`;
      badgeElement.className = 'badge deal';
      badgeElement.style.display = 'inline-block';
    } else {
      badgeElement.style.display = 'none';
    }

    // Update product name
    document.getElementById('product-name').textContent = product.name;

    // Update rating
    this.updateRating(product.rating, product.reviews);

    // Update pricing
    this.updatePricing(product);

    // Update description
    document.getElementById('product-description-text').textContent = product.description;

    // Update features
    this.updateFeatures(product);

    // Update meta information
    this.updateMetaInfo(product);
  }

  updateRating(rating, reviewCount) {
    const starsContainer = document.getElementById('product-stars');
    const ratingText = document.getElementById('rating-text');
    
    // Clear existing stars
    starsContainer.innerHTML = '';
    
    // Add filled and empty stars
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('ion-icon');
      if (i <= Math.floor(rating)) {
        star.setAttribute('name', 'star');
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        star.setAttribute('name', 'star-half');
      } else {
        star.setAttribute('name', 'star-outline');
      }
      starsContainer.appendChild(star);
    }
    
    ratingText.textContent = `(${rating}) ${reviewCount} Reviews`;
  }

  updatePricing(product) {
    const currentPriceElement = document.getElementById('current-price');
    const originalPriceElement = document.getElementById('original-price');
    const discountElement = document.getElementById('discount-percent');
    
    currentPriceElement.textContent = `₹${product.price.toLocaleString()}`;
    
    if (product.originalPrice) {
      originalPriceElement.textContent = `₹${product.originalPrice.toLocaleString()}`;
      originalPriceElement.style.display = 'inline';
      
      const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      discountElement.textContent = `${discount}% OFF`;
      discountElement.style.display = 'inline';
    } else {
      originalPriceElement.style.display = 'none';
      discountElement.style.display = 'none';
    }
  }

  updateFeatures(product) {
    const featuresList = document.getElementById('product-features-list');
    
    // Generate features based on product tags and category
    const features = this.generateProductFeatures(product);
    
    featuresList.innerHTML = '';
    features.forEach(feature => {
      const li = document.createElement('li');
      li.textContent = feature;
      featuresList.appendChild(li);
    });
  }

  generateProductFeatures(product) {
    const baseFeatures = ['High-quality materials', 'Durable construction', 'Modern design'];
    const categoryFeatures = {
      'jackets': ['Weather resistant', 'Comfortable fit', 'Multiple pockets', 'Breathable fabric'],
      'shoes': ['Comfortable sole', 'Non-slip grip', 'Breathable material', 'Lightweight design'],
      'watches': ['Water resistant', 'Precise movement', 'Scratch resistant', 'Long battery life'],
      'clothing': ['Soft fabric', 'Easy care', 'Comfortable fit', 'Fade resistant'],
      'accessories': ['Premium finish', 'Versatile style', 'Durable hardware'],
      'beauty': ['Natural ingredients', 'Dermatologically tested', 'Long-lasting', 'Paraben-free'],
      'jewelry': ['Hypoallergenic', 'Tarnish resistant', 'Elegant design', 'Gift ready']
    };
    
    const specificFeatures = categoryFeatures[product.category] || [];
    return [...baseFeatures, ...specificFeatures.slice(0, 3)];
  }

  updateMetaInfo(product) {
    document.getElementById('product-sku').textContent = `SKU${product.id.toString().padStart(3, '0')}`;
    document.getElementById('product-category').textContent = this.capitalizeFirst(product.category);
    document.getElementById('product-tags').textContent = product.tags.join(', ');
    
    const availabilityElement = document.getElementById('product-availability');
    if (product.inStock) {
      availabilityElement.textContent = 'In Stock';
      availabilityElement.className = 'in-stock';
    } else {
      availabilityElement.textContent = 'Out of Stock';
      availabilityElement.className = 'out-of-stock';
    }
  }

  loadRelatedProducts(product) {
    // Get related products from same category
    const relatedProducts = this.apiService.products
      .filter(p => p.id !== product.id && p.category === product.category)
      .slice(0, 4);
    
    const container = document.getElementById('related-products-container');
    container.innerHTML = '';
    
    relatedProducts.forEach(relatedProduct => {
      const productCard = this.createRelatedProductCard(relatedProduct);
      container.appendChild(productCard);
    });
  }

  createRelatedProductCard(product) {
    const card = document.createElement('div');
    card.className = 'related-product-card';
    card.onclick = () => this.navigateToProduct(product.id);
    
    card.innerHTML = `
      <div class="related-product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="related-product-info">
        <h3 class="related-product-name">${product.name}</h3>
        <div class="related-product-price">₹${product.price.toLocaleString()}</div>
      </div>
    `;
    
    return card;
  }

  loadProductReviews(product) {
    // Generate mock reviews
    const reviews = this.generateMockReviews(product);
    
    // Update average rating
    document.getElementById('avg-rating').textContent = product.rating;
    document.getElementById('total-reviews').textContent = `Based on ${product.reviews} reviews`;
    
    // Update average stars
    const avgStarsContainer = document.getElementById('avg-stars');
    avgStarsContainer.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('ion-icon');
      if (i <= Math.floor(product.rating)) {
        star.setAttribute('name', 'star');
      } else if (i === Math.ceil(product.rating) && product.rating % 1 !== 0) {
        star.setAttribute('name', 'star-half');
      } else {
        star.setAttribute('name', 'star-outline');
      }
      avgStarsContainer.appendChild(star);
    }
    
    // Display reviews
    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = '';
    
    reviews.forEach(review => {
      const reviewElement = this.createReviewElement(review);
      reviewsContainer.appendChild(reviewElement);
    });
  }

  generateMockReviews(product) {
    const reviewTemplates = [
      {
        name: 'John Smith',
        rating: 5,
        text: 'Excellent quality and fast delivery. Highly recommended!',
        date: '2024-01-15'
      },
      {
        name: 'Sarah Johnson',
        rating: 4,
        text: 'Great product, exactly as described. Very satisfied with my purchase.',
        date: '2024-01-10'
      },
      {
        name: 'Mike Wilson',
        rating: 5,
        text: 'Outstanding value for money. Will definitely buy again.',
        date: '2024-01-08'
      },
      {
        name: 'Emily Davis',
        rating: 4,
        text: 'Good quality product. Shipping was quick and packaging was secure.',
        date: '2024-01-05'
      }
    ];
    
    return reviewTemplates.slice(0, Math.min(3, Math.floor(product.reviews / 10)));
  }

  createReviewElement(review) {
    const reviewDiv = document.createElement('div');
    reviewDiv.className = 'review-item';
    
    const starsHtml = Array.from({length: 5}, (_, i) => {
      const starName = i < review.rating ? 'star' : 'star-outline';
      return `<ion-icon name="${starName}"></ion-icon>`;
    }).join('');
    
    reviewDiv.innerHTML = `
      <div class="review-header">
        <span class="reviewer-name">${review.name}</span>
        <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
      </div>
      <div class="review-rating">${starsHtml}</div>
      <p class="review-text">${review.text}</p>
    `;
    
    return reviewDiv;
  }

  setupEventListeners() {
    // Thumbnail image clicks
    document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        this.switchMainImage(thumb.querySelector('img').src);
        this.setActiveThumbnail(index);
      });
    });

    // Size selection
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectSize(btn.dataset.size);
      });
    });

    // Color selection
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectColor(btn.dataset.color);
      });
    });

    // Quantity controls
    document.querySelector('.qty-btn.minus').addEventListener('click', () => {
      this.changeQuantity(-1);
    });

    document.querySelector('.qty-btn.plus').addEventListener('click', () => {
      this.changeQuantity(1);
    });

    document.querySelector('.qty-input').addEventListener('change', (e) => {
      this.setQuantity(parseInt(e.target.value));
    });

    // Action buttons
    document.querySelector('.add-to-cart').addEventListener('click', () => {
      this.addToCart();
    });

    document.querySelector('.add-to-wishlist').addEventListener('click', () => {
      this.addToWishlist();
    });

    document.querySelector('.buy-now').addEventListener('click', () => {
      this.buyNow();
    });

    // Main image zoom
    document.querySelector('.main-image').addEventListener('click', () => {
      this.openImageZoom();
    });
  }

  initializeProductOptions() {
    // Set default selections
    this.selectSize('M');
    this.selectColor('black');
    this.setQuantity(1);
  }

  switchMainImage(src) {
    document.getElementById('main-product-image').src = src;
  }

  setActiveThumbnail(index) {
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  }

  selectSize(size) {
    this.selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === size);
    });
  }

  selectColor(color) {
    this.selectedColor = color;
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color === color);
    });
  }

  changeQuantity(delta) {
    const newQuantity = Math.max(1, Math.min(10, this.quantity + delta));
    this.setQuantity(newQuantity);
  }

  setQuantity(quantity) {
    this.quantity = Math.max(1, Math.min(10, quantity));
    document.querySelector('.qty-input').value = this.quantity;
  }

  addToCart() {
    if (!this.currentProduct) return;

    const cartItem = {
      productId: this.currentProduct.id,
      name: this.currentProduct.name,
      price: this.currentProduct.price,
      image: this.currentProduct.image,
      size: this.selectedSize,
      color: this.selectedColor,
      quantity: this.quantity
    };

    // Add to cart (in real app, this would sync with backend)
    this.addToLocalCart(cartItem);
    
    // Show success message
    this.showSuccessMessage('Product added to cart successfully!');
    
    // Update cart count in header
    this.updateCartCount();

    // Track the action
    if (this.apiService) {
      this.apiService.trackProductClick(window.shoprChat?.config?.userId || 'anonymous', this.currentProduct.id);
    }
  }

  addToWishlist() {
    if (!this.currentProduct) return;

    // Add to wishlist (in real app, this would sync with backend)
    this.addToLocalWishlist(this.currentProduct);
    
    // Show success message
    this.showSuccessMessage('Product added to wishlist!');
    
    // Update wishlist count in header
    this.updateWishlistCount();
  }

  buyNow() {
    if (!this.currentProduct) return;

    // Add to cart first
    this.addToCart();
    
    // In real app, this would redirect to checkout
    this.showSuccessMessage('Redirecting to checkout... (Demo mode)');
    
    // Simulate redirect delay
    setTimeout(() => {
      console.log('Would redirect to checkout page');
    }, 1500);
  }

  addToLocalCart(item) {
    let cart = JSON.parse(localStorage.getItem('shopr_cart') || '[]');
    
    // Check if item already exists
    const existingIndex = cart.findIndex(cartItem => 
      cartItem.productId === item.productId && 
      cartItem.size === item.size && 
      cartItem.color === item.color
    );
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += item.quantity;
    } else {
      cart.push(item);
    }
    
    localStorage.setItem('shopr_cart', JSON.stringify(cart));
  }

  addToLocalWishlist(product) {
    let wishlist = JSON.parse(localStorage.getItem('shopr_wishlist') || '[]');
    
    // Check if product already exists
    if (!wishlist.find(item => item.id === product.id)) {
      wishlist.push(product);
      localStorage.setItem('shopr_wishlist', JSON.stringify(wishlist));
    }
  }

  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('shopr_cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.header-user-actions .count');
    if (cartCountElements.length >= 2) {
      cartCountElements[1].textContent = totalItems;
    }
  }

  updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('shopr_wishlist') || '[]');
    
    const wishlistCountElements = document.querySelectorAll('.header-user-actions .count');
    if (wishlistCountElements.length >= 1) {
      wishlistCountElements[0].textContent = wishlist.length;
    }
  }

  openImageZoom() {
    // In real app, this would open a modal with zoomable image
    console.log('Opening image zoom modal...');
  }

  navigateToProduct(productId) {
    // Navigate to product detail page with new product ID
    window.location.href = `product-detail.html?id=${productId}`;
  }

  showSuccessMessage(message) {
    // Create and show success message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    
    // Insert after product actions
    const productActions = document.querySelector('.product-actions');
    productActions.parentNode.insertBefore(messageDiv, productActions.nextSibling);
    
    // Remove after 3 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }

  showError(message) {
    // Create and show error message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    messageDiv.textContent = message;
    
    // Insert at top of product container
    const container = document.querySelector('.product-container .container');
    container.insertBefore(messageDiv, container.firstChild);
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize product detail page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize currency selector (from main script)
  if (typeof initCurrencySelector === 'function') {
    initCurrencySelector();
  }
  
  // Initialize product detail page
  window.productDetailPage = new ProductDetailPage();
});