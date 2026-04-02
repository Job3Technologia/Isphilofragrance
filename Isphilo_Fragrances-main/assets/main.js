/**
 * ISPHILO FRAGANCE - Shopify Main JavaScript
 * Handles global UI, Cart, Search, and Animations
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. MOBILE MENU TOGGLE
    document.addEventListener('click', function(e) {
        const menuToggle = e.target.closest('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (menuToggle && navMenu) {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = navMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
            }
        }
    });

    // 2. HEADER SCROLL EFFECT
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2.5. SEARCH OVERLAY LOGIC
    const searchOverlay = document.getElementById('searchOverlay');
    const searchToggles = document.querySelectorAll('.search-toggle');
    const closeSearch = document.getElementById('closeSearch');
    const searchInput = document.getElementById('searchInput');

    if (searchOverlay && searchToggles.length > 0) {
        searchToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                searchOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                setTimeout(() => searchInput.focus(), 300);
            });
        });

        closeSearch.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // 3. CART SYSTEM UPDATES (Shopify AJAX)
    async function updateCartUI() {
        try {
            const response = await fetch('/cart.js');
            const cart = await response.json();
            
            // Update counts
            const count = cart.item_count;
            const cartCountElements = document.querySelectorAll('.cart-count, .cart-count-badge');
            cartCountElements.forEach(el => {
                el.textContent = count;
                el.classList.remove('pulse');
                void el.offsetWidth;
                el.classList.add('pulse');
            });

            // Update Drawer
            const cartDrawerItems = document.getElementById('cartDrawerItems');
            const cartDrawerTotal = document.getElementById('cartDrawerTotal');
            
            if (cartDrawerItems && cartDrawerTotal) {
                cartDrawerTotal.textContent = Shopify.formatMoney(cart.total_price);
                
                if (count === 0) {
                    cartDrawerItems.innerHTML = '<div class="empty-cart-drawer text-center"><i class="fas fa-shopping-bag" style="font-size: 40px; color: var(--gray-light); margin-bottom: 20px;"></i><p>Your selection is currently empty.</p><a href="/collections/all" class="btn btn-outline" style="margin-top: 20px;">Browse Scents</a></div>';
                } else {
                    cartDrawerItems.innerHTML = cart.items.map(item => `
                        <div class="cart-drawer-item">
                            <div class="drawer-item-img">
                                <a href="${item.url}"><img src="${item.image}" alt="${item.title}"></a>
                            </div>
                            <div class="drawer-item-info">
                                <h4><a href="${item.url}">${item.product_title}</a></h4>
                                <p>${item.variant_title || ''} • Qty: ${item.quantity}</p>
                                <span class="drawer-item-price">${Shopify.formatMoney(item.line_price)}</span>
                            </div>
                            <div class="drawer-item-remove" onclick="removeCartItem(${item.id})">
                                <i class="fas fa-trash-alt"></i>
                            </div>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    }

    // 3.5. CART DRAWER LOGIC
    const cartDrawer = document.getElementById('cartDrawer');
    const cartToggles = document.querySelectorAll('.cart-pill, .cart-drawer-toggle');
    const closeCart = document.getElementById('closeCart');
    const closeCartOverlay = document.getElementById('closeCartOverlay');

    if (cartDrawer && cartToggles.length > 0) {
        cartToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                // If we are on the cart page, don't open drawer
                if (window.location.pathname === '/cart') return;
                
                e.preventDefault();
                cartDrawer.classList.add('active');
                document.body.style.overflow = 'hidden';
                updateCartUI();
            });
        });

        [closeCart, closeCartOverlay].forEach(el => {
            if (el) {
                el.addEventListener('click', () => {
                    cartDrawer.classList.remove('active');
                    document.body.style.overflow = 'auto';
                });
            }
        });
    }

    window.removeCartItem = async function(id) {
        try {
            const response = await fetch('/cart/change.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id.toString(), quantity: 0 })
            });
            if (response.ok) {
                updateCartUI();
            }
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    // Handle AJAX Add to Cart
    document.addEventListener('submit', async function(e) {
        if (e.target.matches('.add-to-cart-form') || e.target.matches('form[action="/cart/add"]')) {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            const btn = form.querySelector('button[type="submit"]');
            
            if (btn) {
                btn.classList.add('loading');
                btn.disabled = true;
            }

            try {
                const response = await fetch('/cart/add.js', {
                    method: 'POST',
                    body: formData
                });
                const item = await response.json();
                
                if (item.id) {
                    showNotification(`${item.title} added to cart!`, 'success');
                    updateCartUI();
                    // Open drawer automatically
                    if (cartDrawer && window.location.pathname !== '/cart') {
                        cartDrawer.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                } else {
                    showNotification(item.description || 'Error adding to cart', 'error');
                }
            } catch (error) {
                showNotification('Error adding to cart', 'error');
            } finally {
                if (btn) {
                    btn.classList.remove('loading');
                    btn.disabled = false;
                }
            }
        }
    });

    // 4. WISHLIST LOGIC (LocalStorage)
    window.toggleWishlist = function(handle, btn) {
        let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const index = wishlist.indexOf(handle);

        if (index > -1) {
            wishlist.splice(index, 1);
            if (btn) {
                btn.classList.remove('active');
                btn.querySelector('i').className = 'far fa-heart';
            }
            showNotification('Removed from wishlist', 'success');
        } else {
            wishlist.push(handle);
            if (btn) {
                btn.classList.add('active');
                btn.querySelector('i').className = 'fas fa-heart';
            }
            showNotification('Added to wishlist!', 'success');
        }

        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistCount();
    };

    function updateWishlistCount() {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const countElements = document.querySelectorAll('.wishlist-count');
        countElements.forEach(el => el.textContent = wishlist.length);
    }

    // Initialize buttons
    function initWishlistBtns() {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        document.querySelectorAll('.wishlist-toggle-btn').forEach(btn => {
            const handle = btn.dataset.handle;
            if (wishlist.includes(handle)) {
                btn.classList.add('active');
                btn.querySelector('i').className = 'fas fa-heart';
            }
        });
    }

    // Shopify formatMoney helper
    Shopify.formatMoney = function(cents, format) {
        if (typeof cents == 'string') { cents = cents.replace('.', ''); }
        var value = '';
        var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
        var formatString = (format || this.money_format || "R {{amount}}");

        function defaultOption(opt, defaultValue) {
            return (typeof opt == 'undefined' ? defaultValue : opt);
        }

        function formatWithDelimiters(number, precision, thousands, decimal) {
            precision = defaultOption(precision, 2);
            thousands = defaultOption(thousands, ',');
            decimal = defaultOption(decimal, '.');

            if (isNaN(number) || number == null) { return 0; }

            number = (number / 100.0).toFixed(precision);

            var parts = number.split('.'),
                dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
                cents = parts[1] ? (decimal + parts[1]) : '';

            return dollars + cents;
        }

        switch (formatString.match(placeholderRegex)[1]) {
            case 'amount':
                value = formatWithDelimiters(cents, 2);
                break;
            case 'amount_no_decimals':
                value = formatWithDelimiters(cents, 0);
                break;
            case 'amount_with_comma_separator':
                value = formatWithDelimiters(cents, 2, '.', ',');
                break;
            case 'amount_no_decimals_with_comma_separator':
                value = formatWithDelimiters(cents, 0, '.', ',');
                break;
        }

        return formatString.replace(placeholderRegex, value);
    };

    // 4. NOTIFICATION SYSTEM (Custom Toast)
    window.showNotification = function(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-msg ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    };

    // 5. REVEAL ANIMATIONS
    function reveal() {
        const reveals = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
        const windowHeight = window.innerHeight;
        const elementVisible = 80; // Slightly more visible for mobile

        reveals.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                el.classList.add("active");
            }
        });
    }

    // Use passive scroll listener for better mobile performance
    window.addEventListener("scroll", reveal, { passive: true });
    setTimeout(reveal, 100);

    // 5.5. SMOOTH SCROLL FOR MOBILE
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return; // Ignore empty links
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu) navMenu.classList.remove('active');
                const menuToggleIcon = document.querySelector('.mobile-menu-toggle i');
                if (menuToggleIcon) menuToggleIcon.className = 'fas fa-bars';
            }
        });
    });

    // 6. HERO SLIDESHOW
    const slides = document.querySelectorAll('.hero-slideshow .slide');
    if (slides.length > 1) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // 6.5. MOBILE BOTTOM NAV SCROLL EFFECT
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const bottomNav = document.querySelector('.mobile-bottom-nav');
        if (!bottomNav) return;
        
        let st = window.pageYOffset || document.documentElement.scrollTop;
        if (st > lastScrollTop && st > 100) {
            // Scroll down
            bottomNav.style.transform = 'translateY(100%)';
        } else {
            // Scroll up
            bottomNav.style.transform = 'translateY(0)';
        }
        lastScrollTop = st <= 0 ? 0 : st;
    }, { passive: true });

    // 7. INITIAL SETUP
    updateCartUI();
    updateWishlistCount();
    initWishlistBtns();
});
