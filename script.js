document.addEventListener('DOMContentLoaded', () => {
    // 1. Cart Logic
    let cart = [];
    const cartIcon = document.getElementById('cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    
    // Grab the badge from the wishlist icon simply for demonstration (if desired)
    // Here we'll map cart count to the badge inside cart btn actually
    // Wait, the screenshot showed a badge on the heart. Let's create one on cart if it's missing,
    // or just update a global cart count.
    const wishlistBadge = document.querySelector('.wishlist-btn .badge');

    function toggleCart() {
        cartSidebar.classList.toggle('open');
        cartOverlay.classList.toggle('active');
    }

    cartIcon.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    function updateCart() {
        // We will update the generic wishlist badge as a mockup cart count
        wishlistBadge.textContent = cart.length;
        
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top: 2rem;">Your cart is currently empty.</p>';
        } else {
            cart.forEach((item, index) => {
                total += parseFloat(item.price);
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <img src="${item.img}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        ${item.options ? `<p style="font-size: 0.75rem; color: #777; margin-bottom: 0.3rem;">${item.options}</p>` : ''}
                        <p style="font-weight: 500;">$${item.price.toFixed(2)}</p>
                        <button class="remove-item" data-index="${index}">Remove</button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }
        cartTotalPrice.textContent = `$${total.toFixed(2)}`;

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                cart.splice(idx, 1);
                updateCart();
            });
        });
    }

    // 1.5 Mobile Menu Logic
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
    const closeMobileMenuBtn = document.getElementById('close-mobile-menu');

    function toggleMobileMenu() {
        mobileNavDrawer.classList.toggle('open');
        cartOverlay.classList.toggle('active');
    }

    if(mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        closeMobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // 2. Quick View Logic
    const quickviewModal = document.getElementById('quickview-modal');
    const closeQvBtn = document.getElementById('close-quickview');
    const qvImg = document.getElementById('qv-img');
    const qvTitle = document.getElementById('qv-title');
    const qvPrice = document.getElementById('qv-price');
    const qvAddCart = document.getElementById('qv-add-cart');
    let currentQvItem = null;

    document.querySelectorAll('.btn-quickview, .btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-item');
            if(!card) return;
            const originalCartBtn = card.querySelector('.btn-add-cart');
            
            const id = originalCartBtn.getAttribute('data-id');
            const name = originalCartBtn.getAttribute('data-name');
            const basePrice = parseFloat(originalCartBtn.getAttribute('data-price'));
            const img = originalCartBtn.getAttribute('data-img');
            const desc = card.getAttribute('data-desc') || 'Indulge in absolute luxury with this breathtaking piece. Carefully curated for its premium texture and timeless elegance, this item is an essential addition to any high-end wardrobe.';
            
            const qvDesc = document.getElementById('qv-desc');
            if(qvDesc) qvDesc.textContent = desc;
            
            currentQvItem = { id, name, basePrice, img };
            
            qvImg.src = img;
            qvTitle.textContent = name;
            
            const fallSelect = document.getElementById('qv-fall');
            const blouseSelect = document.getElementById('qv-blouse');
            const sizeSelect = document.getElementById('qv-size');
            fallSelect.value = 'No';
            blouseSelect.value = 'Unstitched';
            sizeSelect.value = 'Not Applicable';

            const updateQvPrice = () => {
                const bPrice = parseFloat(blouseSelect.options[blouseSelect.selectedIndex].getAttribute('data-price'));
                const fPrice = parseFloat(fallSelect.options[fallSelect.selectedIndex].getAttribute('data-price'));
                qvPrice.textContent = `$${(basePrice + bPrice + fPrice).toFixed(2)}`;
            };

            blouseSelect.addEventListener('change', updateQvPrice);
            fallSelect.addEventListener('change', updateQvPrice);
            updateQvPrice();
            
            quickviewModal.classList.add('active');
        });
    });

    closeQvBtn.addEventListener('click', () => { quickviewModal.classList.remove('active'); });

    qvAddCart.addEventListener('click', () => {
        if (currentQvItem) {
            const fSelect = document.getElementById('qv-fall');
            const bSelect = document.getElementById('qv-blouse');
            const sSelect = document.getElementById('qv-size');
            
            const fPrice = parseFloat(fSelect.options[fSelect.selectedIndex].getAttribute('data-price'));
            const bPrice = parseFloat(bSelect.options[bSelect.selectedIndex].getAttribute('data-price'));
            const finalPrice = currentQvItem.basePrice + fPrice + bPrice;
            
            cart.push({
                id: currentQvItem.id,
                name: currentQvItem.name,
                img: currentQvItem.img,
                price: finalPrice,
                options: `Size: ${sSelect.value} | Fall: ${fSelect.value} | Blouse: ${bSelect.value}`
            });
            updateCart();
            
            const origText = qvAddCart.textContent;
            qvAddCart.textContent = 'ADDING...';
            setTimeout(() => {
                qvAddCart.textContent = 'ADDED!';
                setTimeout(() => {
                    qvAddCart.textContent = origText;
                    quickviewModal.classList.remove('active');
                    toggleCart();
                }, 600);
            }, 500);
        }
    });

    // 3. Checkout Modal
    const checkoutBtn = document.getElementById('checkout-btn');
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentBtn = document.getElementById('close-payment');
    const processPayBtn = document.getElementById('process-pay-btn');
    const paymentBody = document.getElementById('payment-body');
    const paymentSuccess = document.getElementById('payment-success');
    const continueShoppingBtn = document.getElementById('continue-shopping');

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) { alert("Cart is empty."); return; }
        toggleCart();
        paymentModal.classList.add('active');
    });

    closePaymentBtn.addEventListener('click', () => { paymentModal.classList.remove('active'); });

    document.querySelectorAll('.pay-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.pay-btn').forEach(b => {
                b.classList.remove('active');
                b.style.background = '#fff';
                b.style.color = '#000';
            });
            e.target.classList.add('active');
            e.target.style.background = '#000';
            e.target.style.color = '#fff';
        });
    });

    processPayBtn.addEventListener('click', () => {
        const inputs = document.querySelectorAll('#payment-body .checkout-input[required]');
        let isValid = true;
        inputs.forEach(i => { if(!i.value.trim()) isValid = false; });
        
        if(!isValid) { alert("Please fill all required delivery details."); return; }

        processPayBtn.textContent = 'AUTHORIZING...';
        processPayBtn.disabled = true;

        setTimeout(() => {
            paymentBody.style.display = 'none';
            paymentSuccess.style.display = 'block';
            cart = [];
            updateCart();
        }, 1500);
    });

    continueShoppingBtn.addEventListener('click', () => {
        paymentModal.classList.remove('active');
        setTimeout(() => {
            paymentBody.style.display = 'block';
            paymentSuccess.style.display = 'none';
            processPayBtn.textContent = 'PAY NOW';
            processPayBtn.disabled = false;
            document.querySelectorAll('.checkout-input').forEach(i => i.value = '');
        }, 400);
    });

    // Modals & Drawers click outside check
    window.addEventListener('click', (e) => {
        if(e.target === quickviewModal) quickviewModal.classList.remove('active');
        if(e.target === paymentModal) paymentModal.classList.remove('active');
        // if cart overlay is clicked and mobile menu is open, close it
        if(e.target === cartOverlay && mobileNavDrawer.classList.contains('open')) {
            toggleMobileMenu();
        }
        // if cart overlay clicked and mobile filters open, close them
        if(e.target === cartOverlay && typeof sidebar !== 'undefined' && sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
        }
    });

    // 4. Shop Filters & Mobile Sidebar
    const sidebar = document.getElementById('sidebar');
    const mobileFilterBtn = document.getElementById('mobile-filter-btn');
    if (mobileFilterBtn && sidebar) {
        mobileFilterBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            cartOverlay.classList.toggle('active');
        });
    }

    // Filter Logic
    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
        const colorCheckboxes = document.querySelectorAll('.color-filter');
        const availCheckboxes = document.querySelectorAll('.avail-filter');
        const priceMinInput = document.getElementById('price-min');
        const priceMaxInput = document.getElementById('price-max');
        const products = document.querySelectorAll('.product-item');
        const productCountText = document.querySelector('.product-count');

        // Check URL Search Params for Global Search
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search') ? urlParams.get('search').toLowerCase() : '';

        function filterProducts() {
            // Gather color values
            const selectedColors = Array.from(colorCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
            
            // Gather avail values
            const selectedAvail = Array.from(availCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

            // Gather price boundary
            const minP = priceMinInput.value ? parseFloat(priceMinInput.value) : 0;
            const maxP = priceMaxInput.value ? parseFloat(priceMaxInput.value) : Infinity;

            let visibleCount = 0;

            products.forEach(prod => {
                const prodColor = prod.getAttribute('data-color');
                const prodStock = prod.getAttribute('data-stock');
                const prodPrice = parseFloat(prod.getAttribute('data-price'));

                let colorMatch = true;
                if (selectedColors.length > 0) {
                    colorMatch = selectedColors.includes(prodColor);
                }

                let availMatch = true;
                if (selectedAvail.length > 0) {
                     availMatch = selectedAvail.includes(prodStock);
                }

                let priceMatch = (prodPrice >= minP && prodPrice <= maxP);

                let textMatch = true;
                if (searchQuery) {
                    const prodName = prod.getAttribute('data-name') ? prod.getAttribute('data-name').toLowerCase() : '';
                    textMatch = prodName.includes(searchQuery);
                }

                if (colorMatch && availMatch && priceMatch && textMatch) {
                    prod.style.display = 'block';
                    visibleCount++;
                } else {
                    prod.style.display = 'none';
                }
            });

            if (productCountText) {
                productCountText.textContent = `${visibleCount} products`;
            }
        }

        // Attach events
        colorCheckboxes.forEach(cb => cb.addEventListener('change', filterProducts));
        availCheckboxes.forEach(cb => cb.addEventListener('change', filterProducts));
        if(priceMinInput) priceMinInput.addEventListener('input', filterProducts);
        if(priceMaxInput) priceMaxInput.addEventListener('input', filterProducts);
        
        // Initial filter run
        filterProducts();
    }

    // 5. Hero Slider Logic
    const slides = document.querySelectorAll('.hero-slide');
    const dotsContainer = document.getElementById('hero-dots');
    const prevBtn = document.getElementById('hero-prev');
    const nextBtn = document.getElementById('hero-next');
    
    if (slides.length > 0) {
        let currentSlide = 0;
        let slideInterval;

        // Create dots
        slides.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if(idx === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(idx));
            if(dotsContainer) dotsContainer.appendChild(dot);
        });
        
        const dots = document.querySelectorAll('.dot');

        function goToSlide(n) {
            slides[currentSlide].classList.remove('active');
            if(dots[currentSlide]) dots[currentSlide].classList.remove('active');
            currentSlide = (n + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            if(dots[currentSlide]) dots[currentSlide].classList.add('active');
        }

        function nextSlide() { goToSlide(currentSlide + 1); }
        function prevSlide() { goToSlide(currentSlide - 1); }

        if(nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
        if(prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });

        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        }
        resetInterval();
    }

    // 6. Global Search Overlay Logic
    const searchBtns = document.querySelectorAll('.search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const closeSearchBtn = document.getElementById('close-search');

    if (searchOverlay) {
        searchBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                searchOverlay.classList.add('active');
                const input = searchOverlay.querySelector('input');
                if(input) setTimeout(() => input.focus(), 100);
            });
        });
        
        if(closeSearchBtn) {
            closeSearchBtn.addEventListener('click', () => searchOverlay.classList.remove('active'));
        }
    }
});
