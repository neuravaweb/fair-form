class ImageCarousel {
    constructor(container, options = {}) {
        this.container = container;
        this.slides = container.querySelectorAll('.carousel-slide');
        this.prevBtn = container.querySelector('.carousel-btn-prev');
        this.nextBtn = container.querySelector('.carousel-btn-next');
        this.dotsContainer = container.querySelector('.carousel-dots');
        this.currentIndex = 0;
        this.interval = options.interval || 2000; // Default 2 seconds
        this.autoplayTimer = null;
        
        this.init();
    }
    
    init() {
        // Create dots
        this.createDots();
        
        // Set initial slide
        this.showSlide(this.currentIndex);
        
        // Event listeners
        this.prevBtn.addEventListener('click', () => this.goToPrevious());
        this.nextBtn.addEventListener('click', () => this.goToNext());
        
        // Start autoplay
        this.startAutoplay();
    }
    
    createDots() {
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
        });
        this.updateDots();
    }
    
    showSlide(index) {
        // Remove active class from all slides
        this.slides.forEach(slide => slide.classList.remove('active'));
        
        // Add active class to current slide
        if (this.slides[index]) {
            this.slides[index].classList.add('active');
        }
        
        this.updateDots();
    }
    
    updateDots() {
        const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            if (index === this.currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    goToNext() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.showSlide(this.currentIndex);
        this.resetAutoplay();
    }
    
    goToPrevious() {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.showSlide(this.currentIndex);
        this.resetAutoplay();
    }
    
    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.currentIndex = index;
            this.showSlide(this.currentIndex);
            this.resetAutoplay();
        }
    }
    
    startAutoplay() {
        this.autoplayTimer = setInterval(() => {
            this.goToNext();
        }, this.interval);
    }
    
    resetAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
        }
        this.startAutoplay();
    }
    
    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        new ImageCarousel(carouselContainer, {
            interval: 2000 // 2 seconds
        });
    }
});
