'use strict';

/**
 * Theme Toggle Functionality
 */

class ThemeToggle {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    // Set initial theme
    this.setTheme(this.currentTheme);
    
    // Get all theme toggle buttons
    this.toggleButtons = document.querySelectorAll('#theme-toggle, #mobile-theme-toggle');
    
    // Add event listeners
    this.toggleButtons.forEach(button => {
      button.addEventListener('click', () => this.toggleTheme());
    });
  }

  setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}

// Initialize theme toggle when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThemeToggle();
});