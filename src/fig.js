class Fig {
    constructor(options = {}) {
        this.config = Fig.mergeSettings(options);
        this.selector =
            typeof this.config.selector === 'string'
                ? document.querySelector(this.config.selector)
                : this.config.selector;
        this.slides = this.selector.children;
        this.currentSlide = 0;
        this.numberOfSlides = this.slides.length;

        ['scroll', 'mousedown', 'mouseup', 'mousemove'].forEach((method) => {
            this[method] = this[method].bind(this);
        });

        this.init();
    }

    static mergeSettings(options) {
        const defaults = {
            selector: '.fig',
            draggable: true,
            onInit: () => {},
            onChange: () => {},
        };

        return { ...defaults, ...options };
    }

    setStyles() {
        this.selector.style.display = 'flex';
        this.selector.style.overflowX = this.config.draggable ? 'auto' : 'hidden';
        this.selector.style.scrollSnapType = 'x mandatory';
        this.selector.style.scrollBehavior = 'smooth';
        this.selector.style.scrollbarWidth = 'none';
        this.selector.style['-webkit-overflow-scrolling'] = 'touch';
        this.selector.style['-ms-overflow-style'] = 'none';

        for (const slide of this.slides) {
            slide.style.width = '100%';
            slide.style.flexShrink = 0;
            slide.style.scrollSnapAlign = 'start';
        }
    }

    attachEvents() {
        this.pointerDown = false;
        this.scrolling = false;
        this.drag = {
            isDragging: false,
            startX: 0,
            endX: 0,
        };

        if (this.config.draggable) {
            this.selector.addEventListener('scroll', this.scroll);
            this.selector.addEventListener('mousedown', this.mousedown);
            this.selector.addEventListener('mousemove', this.mousemove);
            this.selector.addEventListener('mouseup', this.mouseup);
            this.selector.addEventListener('mouseleave', this.mouseup);
        }
    }

    init() {
        this.setStyles();
        this.attachEvents();
        this.selector.scrollLeft = 0;
        this.config.onInit.call(this);
    }

    getVisibleSlideIndex() {
        return [...this.slides].findIndex((slide) => {
            const sliderRect = this.selector.getBoundingClientRect();
            const slideRect = slide.getBoundingClientRect();

            return sliderRect.x === slideRect.x && sliderRect.y === slideRect.y;
        });
    }

    scroll() {
        window.clearTimeout(this.scrolling);

        this.scrolling = setTimeout(() => {
            const visibleSlideIndex = this.getVisibleSlideIndex();

            if (visibleSlideIndex !== -1 && visibleSlideIndex !== this.currentSlide) {
                this.currentSlide = visibleSlideIndex;

                this.config.onChange.call(this);
            }
        }, 66);
    }

    mousedown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.drag.isDragging = true;
        this.drag.startX = event.pageX;
    }

    mousemove(event) {
        event.preventDefault();
    }

    mouseup(event) {
        if (!this.drag.isDragging) {
            return;
        }

        event.stopPropagation();
        this.drag.endX = event.pageX;

        if (this.drag.endX < this.drag.startX) {
            this.next();
        }

        if (this.drag.endX > this.drag.startX) {
            this.prev();
        }

        this.drag.isDragging = false;
    }

    changeSlide() {
        this.slides[this.currentSlide].scrollIntoView();
        this.config.onChange.call(this);
    }

    prev() {
        if (this.currentSlide - 1 < 0) {
            return;
        }

        this.currentSlide = this.currentSlide - 1;
        this.changeSlide();
    }

    next() {
        if (this.currentSlide + 1 > this.numberOfSlides - 1) {
            return;
        }

        this.currentSlide = this.currentSlide + 1;
        this.changeSlide();
    }

    goTo(index = 0) {
        if (!this.slides[index] || index === this.currentSlide) {
            return;
        }

        this.currentSlide = index;
        this.changeSlide();
    }
}
