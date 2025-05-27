const CART_STORAGE_KEY = 'electronicsPodsCart_v1';

function getCart() {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    try {
        return cartJson ? JSON.parse(cartJson) : [];
    } catch (e) {
        console.error("Error al parsear el carrito desde localStorage:", e);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartIconCount();
}

function addToCart(product) {
    let cart = getCart();
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += product.quantity;
    } else {
        cart.push(product);
    }
    saveCart(cart);
    showCartFeedback(product.name); 
}

function updateCartItemQuantity(productId, newQuantity) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        if (newQuantity > 0 && newQuantity <= 10) {
            cart[itemIndex].quantity = newQuantity;
        } else if (newQuantity <= 0) {
            cart.splice(itemIndex, 1); 
        }
        saveCart(cart);
        if (document.body.classList.contains('cart-page')) { 
            renderCartPageContent();
        }
    }
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    if (document.body.classList.contains('cart-page')) {
        renderCartPageContent();
    }
}

function emptyCart() {
    saveCart([]);
    if (document.body.classList.contains('cart-page')) {
        renderCartPageContent();
    }
}

function calculateCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
}

function updateCartIconCount() {
    const cartCountElement = document.querySelector('.cart-icon .cart-item-count');
    if (cartCountElement) {
        const count = getCartItemCount();
        cartCountElement.textContent = count;
        cartCountElement.style.display = count > 0 ? 'flex' : 'none'; 
    }
}

function formatPrice(amount) {
    return `$${Math.round(amount).toLocaleString('es-CO')}`;
}

function showCartFeedback(productName) {
    const existingPopup = document.querySelector('.cart-feedback-popup');
    if(existingPopup) existingPopup.remove();

    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'cart-feedback-popup';
    feedbackDiv.innerHTML = `<i class="fas fa-check-circle"></i> <p><strong>${productName}</strong> añadido al carrito.</p><a href="carrito.html">Ver Carrito</a>`;
    document.body.appendChild(feedbackDiv);

    requestAnimationFrame(() => {
        feedbackDiv.classList.add('show');
    });

    setTimeout(() => {
        feedbackDiv.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(feedbackDiv)) {
                 document.body.removeChild(feedbackDiv);
            }
        }, 400); 
    }, 3500); 
}


function renderCartPageContent() {
    const cartContainer = document.getElementById('cart-container');
    if (!cartContainer) return; 

    const cart = getCart();
    cartContainer.innerHTML = ''; 

    if (cart.length === 0) {
        const emptyTemplate = document.getElementById('cart-empty-template');
        if (emptyTemplate) {
            cartContainer.appendChild(emptyTemplate.content.cloneNode(true));
        }
    } else {
        const contentTemplate = document.getElementById('cart-content-template');
        const itemRowTemplate = document.getElementById('cart-item-row-template');

        if (contentTemplate && itemRowTemplate) {
            const cartNode = contentTemplate.content.cloneNode(true);
            const tbody = cartNode.getElementById('cart-items-list');

            cart.forEach(item => {
                const rowNode = itemRowTemplate.content.cloneNode(true);
                const tr = rowNode.querySelector('.cart-item');
                tr.dataset.productId = item.id;

                rowNode.querySelector('.cart-item-image img').src = item.image;
                rowNode.querySelector('.cart-item-image img').alt = item.name;
                rowNode.querySelector('.item-name').textContent = item.name;
                rowNode.querySelector('.cart-item-unit-price').textContent = formatPrice(item.price);
                
                const quantityInput = rowNode.querySelector('.item-quantity');
                quantityInput.value = item.quantity;
                quantityInput.addEventListener('change', (e) => {
                    const newQty = parseInt(e.target.value);
                    updateCartItemQuantity(item.id, newQty);
                });

                rowNode.querySelector('.decrease-qty').addEventListener('click', () => {
                     updateCartItemQuantity(item.id, item.quantity - 1);
                });
                rowNode.querySelector('.increase-qty').addEventListener('click', () => {
                     updateCartItemQuantity(item.id, item.quantity + 1);
                });

                rowNode.querySelector('.cart-item-subtotal').textContent = formatPrice(item.price * item.quantity);
                rowNode.querySelector('.remove-item-btn').addEventListener('click', () => removeFromCart(item.id));

                tbody.appendChild(rowNode);
            });

            const totalAmount = calculateCartTotal();
            cartNode.getElementById('cart-subtotal').textContent = formatPrice(totalAmount);
            cartNode.getElementById('cart-total').textContent = formatPrice(totalAmount);

            cartContainer.appendChild(cartNode);

            document.getElementById('empty-cart-button')?.addEventListener('click', emptyCart);
            document.getElementById('checkout-button')?.addEventListener('click', () => {
                alert('Simulación de Checkout: Serías redirigido a la pasarela de pagos. ¡Gracias por tu compra en ElectronicsPods (EP)!');
            });
        }
    }
}


document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('carrito.html')) {
        document.body.classList.add('cart-page');
    }

    updateCartIconCount(); 

    const menuToggle = document.querySelector('.menu-toggle');
    const mainNavUl = document.querySelector('.main-nav ul');
    if (menuToggle && mainNavUl) {
        menuToggle.addEventListener('click', () => {
            mainNavUl.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                mainNavUl.classList.contains('active') 
                    ? (icon.classList.remove('fa-bars'), icon.classList.add('fa-times'), menuToggle.setAttribute('aria-label', 'Cerrar menú'))
                    : (icon.classList.remove('fa-times'), icon.classList.add('fa-bars'), menuToggle.setAttribute('aria-label', 'Abrir menú'));
            }
        });
    }

    const siteHeader = document.querySelector('.site-header');
    const headerHeight = siteHeader ? siteHeader.offsetHeight : 80;
    const mainNavLinks = document.querySelectorAll('.main-nav ul li a');

    mainNavLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const hrefAttribute = this.getAttribute('href');
            
            if (!hrefAttribute.startsWith('#') && !hrefAttribute.includes('index.html#')) {
                if (mainNavUl && mainNavUl.classList.contains('active') && menuToggle && getComputedStyle(menuToggle).display !== 'none') {
                     mainNavUl.classList.remove('active');
                }
                return; 
            }
            
            let targetId = '';
            let onIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');

            if (hrefAttribute.includes('index.html#')) {
                if (onIndexPage) { 
                    targetId = hrefAttribute.substring(hrefAttribute.indexOf('#'));
                } else {
                    return; 
                }
            } else if (hrefAttribute.startsWith('#')) {
                targetId = hrefAttribute;
            }

            if (targetId) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault(); 
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - headerHeight;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

                    if (mainNavUl && mainNavUl.classList.contains('active') && menuToggle && getComputedStyle(menuToggle).display !== 'none') {
                        mainNavUl.classList.remove('active');
                        const icon = menuToggle.querySelector('i');
                        if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
                        if (menuToggle){ menuToggle.setAttribute('aria-label', 'Abrir menú'); }
                    }
                }
            }
        });
    });

    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        const navLinksForHighlighting = document.querySelectorAll('.main-nav ul li a'); 
        const sectionsFromMarkup = [];
    
        navLinksForHighlighting.forEach(link => {
            const href = link.getAttribute('href');
            let targetId;
            if (href) {
                if (href.startsWith('#')) {
                    targetId = href;
                } else if (href.includes('index.html#')) {
                    targetId = href.substring(href.indexOf('#'));
                }
            }
    
            if (targetId) {
                try {
                    const sectionElement = document.querySelector(targetId);
                    if (sectionElement) {
                        sectionsFromMarkup.push({
                            link: link,
                            section: sectionElement
                        });
                    }
                } catch (e) {
                }
            }
        });
    
        sectionsFromMarkup.sort((a, b) => a.section.offsetTop - b.section.offsetTop);
    
        function navHighlighter() {
            if (!sectionsFromMarkup || sectionsFromMarkup.length === 0 || !siteHeader) return;
    
            let scrollY = window.pageYOffset;
            let newActiveLink = null;
    
            navLinksForHighlighting.forEach(link => link.classList.remove('active'));
    
            for (let i = sectionsFromMarkup.length - 1; i >= 0; i--) {
                const item = sectionsFromMarkup[i];
                const sectionTop = item.section.offsetTop;
                
                if (scrollY >= sectionTop - headerHeight - 60) { 
                    newActiveLink = item.link;
                    break; 
                }
            }
            
            if (!newActiveLink && sectionsFromMarkup.length > 0) {
                newActiveLink = sectionsFromMarkup[0].link;
            }
    
            if (newActiveLink) {
                newActiveLink.classList.add('active');
            }
        }
    
        if (sectionsFromMarkup.length > 0) {
            window.addEventListener('scroll', navHighlighter);
            navHighlighter();
        }
    
    
    
    }


    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() { 
            this.classList.toggle('active');
            const icon = this.querySelector('i.fa-chevron-down, i.fa-chevron-up');
            if(icon) icon.classList.toggle('fa-chevron-up'); 

            const content = this.nextElementSibling;
            if (content && content.classList.contains('accordion-content')) {
                if (content.style.maxHeight && content.style.maxHeight !== "0px") {
                    content.style.maxHeight = null; content.classList.remove('active');
                } else {
                    content.style.maxHeight = content.scrollHeight + "px"; content.classList.add('active');
                }
            }
        });
    });

    const pdpQuantitySelectors = document.querySelectorAll('.product-detail-section .quantity-selector');
    pdpQuantitySelectors.forEach(selector => {
        const decreaseBtn = selector.querySelector('button[aria-label="Disminuir cantidad"]');
        const increaseBtn = selector.querySelector('button[aria-label="Aumentar cantidad"]');
        const quantityInput = selector.querySelector('input[type="number"]');
        if (decreaseBtn && increaseBtn && quantityInput) {
            decreaseBtn.addEventListener('click', () => {
                let currentValue = parseInt(quantityInput.value);
                if (currentValue > parseInt(quantityInput.min || "1")) quantityInput.value = currentValue - 1;
            });
            increaseBtn.addEventListener('click', () => {
                let currentValue = parseInt(quantityInput.value);
                if (currentValue < parseInt(quantityInput.max || "10")) quantityInput.value = currentValue + 1;
            });
        }
    });

    const pdpAddToCartButtons = document.querySelectorAll('.product-detail-section .add-to-cart-button');
    pdpAddToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productInfoDiv = this.closest('.product-info');
            if (!productInfoDiv) {
                console.error("'.product-info' no encontrado para el botón 'Añadir al Carrito'.");
                return;
            }
            
            const productName = productInfoDiv.querySelector('h1')?.textContent;
            const productPriceText = productInfoDiv.querySelector('.product-price-detail')?.textContent;
            const mainImageElement = document.getElementById('mainProductImage');
            const productImage = mainImageElement ? mainImageElement.src : 'https://via.placeholder.com/80x80?text=NoImg';
            const quantityInput = productInfoDiv.querySelector('.product-actions .quantity-selector input[type="number"]');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

            const productId = productName ? productName.trim().toLowerCase().replace(/\s+/g, '-') : `product-${Date.now()}`;
            
            let productPrice = 0;
            if (productPriceText) {
                try {
                    const cleanedPrice = String(productPriceText).replace(/\$|\s*COP|\./g, '').replace(',', '.').trim();
                    productPrice = parseFloat(cleanedPrice);
                    if (isNaN(productPrice)) throw new Error("Precio no es un número después de limpiar");
                } catch (e) {
                    console.error("Error parseando precio del producto:", productPriceText, e);
                    alert("Error al procesar el precio del producto. Intente de nuevo.");
                    return;
                }
            } else {
                 console.error("Precio del producto no encontrado.");
                 alert("Error: Precio del producto no disponible.");
                 return;
            }


            if (!productName) {
                console.error("Nombre del producto no encontrado.");
                 alert("Error: Nombre del producto no disponible.");
                return;
            }

            const productToAdd = {
                id: productId,
                name: productName,
                price: productPrice, 
                image: productImage,
                quantity: quantity
            };
            addToCart(productToAdd);
        });
    });

    if (document.body.classList.contains('cart-page')) {
        renderCartPageContent();
    }


});

function changeImage(newImageSrc, clickedThumbnailElement) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = newImageSrc;
    }

    const thumbnails = document.querySelectorAll('.thumbnail-images .thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    if (clickedThumbnailElement && clickedThumbnailElement.classList.contains('thumbnail')) {
        clickedThumbnailElement.classList.add('active');
    }
}