# Shopr - eCommerce Website with Chat SDK

![Shopr Logo](assets/images/logo/logo.svg)

Shopr is a fully responsive eCommerce website built using HTML, CSS, and JavaScript. It features a modern design with a comprehensive product catalog, shopping cart functionality, and an innovative Chat SDK that allows users to search for products using text, image, or voice queries.

## Features

- **Modern UI/UX**: Clean, responsive design that works on all device sizes
- **Product Catalog**: Extensive product listings with categories, filtering, and search
- **Shopping Features**: Wishlist, cart functionality, and product quick view
- **Chat SDK**: Innovative chat interface for product search and recommendations:
  - Text-based product search
  - Image upload for visual product matching
  - Voice input support (multilingual)
  - Personalized recommendations based on user history
- **Multiple Categories**: Fashion, electronics, jewelry, cosmetics, and more
- **Special Offers**: Deal of the day, trending products, and new arrivals sections
- **Customer Testimonials**: Social proof to build trust
- **Service Information**: Clear presentation of company services

## Demo

![Shopr Desktop Demo](website-demo-image/desktop.png)
![Shopr Mobile Demo](website-demo-image/mobile.png)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- A modern web browser (Chrome, Firefox, Safari, Edge)

## Installation

To run Shopr locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/Xenonesis/Shopr.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Shopr
   ```

3. Open `index.html` in your preferred web browser

Alternatively, you can run a local server:
- With Python 3: `python -m http.server 8000`
- With Node.js: `npx serve`
- Then visit `http://localhost:8000` in your browser

## Chat SDK

The Chat SDK is a cutting-edge feature that enhances the shopping experience by allowing customers to search for products through multiple modalities:

- **Text Search**: Type your product queries in natural language
- **Image Search**: Upload an image to find visually similar products
- **Voice Search**: Speak your queries in English, Hindi, or Arabic
- **Personalized Recommendations**: Get product suggestions based on your order history and browsing behavior

The SDK is designed as a lightweight, reusable component that can be easily integrated into the Shopr frontend.

## Project Structure

```
shopr/
├── assets/
│   ├── css/
│   ├── images/
│   └── js/
├── index.html
└── README.md
```

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS)
- **Fonts**: Google Fonts (Poppins)
- **Icons**: Ionicons, Font Awesome
- **Chat SDK Backend** (planned):
  - Node.js + Express
  - Python for AI models (TensorFlow/PyTorch)
  - PostgreSQL, Redis, Elasticsearch

## Contributing

Contributions to Shopr are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Create a pull request

## Versioning

Current version: v0.10

## Authors

- Original design: codewithsadee
- Enhancements and Chat SDK integration: Xenonesis

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For support or queries, please contact the repository owner.

## Acknowledgements

- Thanks to codewithsadee for the original Anon eCommerce template
- Ionicons and Font Awesome for the icon libraries
- Google Fonts for the Poppins font family
