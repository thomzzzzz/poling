document.addEventListener('DOMContentLoaded', function() {
    const productModal = document.getElementById('productModal');
    const closeButton = productModal.querySelector('.close-button');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const modalDescription = document.getElementById('modal-description');
    const modalAddToCartButton = document.getElementById('modal-add-to-cart');
    const cartCountElement = document.getElementById('cart-count');
    const bottomCartCountElement = document.getElementById('bottom-cart-count');
    const categoryLinks = document.querySelectorAll('.category-bar a[data-category]');
    const filterLinks = document.querySelectorAll('.category-bar a[data-filter]');
    const productList = document.querySelector('.product-list');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartIcon = document.querySelector('.cart-icon');
    const allProducts = Array.from(productList.children); // Simpan semua produk awal
    const searchInput = document.getElementById('searchInput'); // Dapatkan elemen input pencarian
    const loadingIndicator = document.getElementById('loading-indicator'); // Dapatkan elemen loading
    const carousel = document.querySelector('.promo-carousel');
    const carouselImages = carousel ? carousel.querySelectorAll('img') : [];
    let carouselCounter = 0;
    const carouselInterval = 3000; // Interval waktu antar slide (dalam milidetik)
    const carouselContainer = document.querySelector('.promo-carousel-container');
    let touchStartX = null;

    // Fungsi untuk mendapatkan keranjang dari localStorage
    function getCart() {
        return JSON.parse(localStorage.getItem('keranjang') || '[]');
    }
    // Fungsi untuk menyimpan keranjang ke localStorage
    function saveCart(cart) {
        localStorage.setItem('keranjang', JSON.stringify(cart));
        updateCartCount();
    }
    // Pop-up Selamat Datang
    const welcomePopup = document.getElementById('welcomePopup');
    const closeWelcomePopup = document.getElementById('closeWelcomePopup');

    welcomePopup.style.display = 'flex';

    closeWelcomePopup.addEventListener('click', () => {
        welcomePopup.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === welcomePopup) {
            welcomePopup.style.display = 'none';
        }
    });
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (cartIcon) {
                cartIcon.classList.add('drag-feedback');
                setTimeout(() => {
                    cartIcon.classList.remove('drag-feedback');
                }, 300);
            }
            // ... logika tambah ke keranjang yang sudah ada ...
        });
    });


    // Fungsi untuk memperbarui tampilan jumlah item di keranjang
    function updateCartCount() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.jumlah, 0);
        cartCountElement.textContent = totalItems;
        bottomCartCountElement.textContent = totalItems > 0 ? totalItems : 0;
        bottomCartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
        cartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }

    // Inisialisasi jumlah item keranjang saat halaman dimuat
    updateCartCount();

    // Fungsi untuk menampilkan detail produk (PERUBAHAN DI SINI untuk menampilkan baris baru)
    function showProductDetails(product) {
        console.log("Fungsi showProductDetails dipanggil dengan produk:", product); // Tambahan debugging

        modalImage.src = product.dataset.image;
        modalImage.alt = product.dataset.name;
        modalTitle.textContent = product.dataset.name;
        const priceElement = product.querySelector('.product-price');
        modalPrice.innerHTML = priceElement.innerHTML; // Ambil HTML dari elemen harga (termasuk coretan)

        // Ganti semua karakter newline dengan <br> dan set innerHTML
        modalDescription.innerHTML = product.dataset.description.replace(/\n/g, '<br>');
        console.log("Deskripsi modal setelah mengganti \\n dengan <br>:", modalDescription.innerHTML); // Tambahan debugging

        modalAddToCartButton.dataset.id = product.dataset.id;
        modalAddToCartButton.dataset.name = product.dataset.name;
        modalAddToCartButton.dataset.price = product.dataset.price; // Gunakan harga setelah diskon untuk tombol modal
        modalAddToCartButton.dataset.image = product.dataset.image;
        productModal.style.display = "block";
        console.log("Modal ditampilkan."); // Tambahan debugging
    }

    // Fungsi untuk menyembunyikan detail produk
    function hideProductDetails() {
        productModal.style.display = "none";
    }

    // Fungsi untuk menambahkan ke keranjang
    function tambahKeKeranjang(productId, namaProduk, hargaProduk, gambarProduk) {
        let cart = getCart();
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.jumlah++;
        } else {
            cart.push({
                id: productId,
                nama: namaProduk,
                harga: hargaProduk,
                gambar: gambarProduk,
                jumlah: 1
            });
        }

        saveCart(cart);
        const cartIcon = document.querySelector('.animate-cart');
        cartIcon.classList.add('animate-cart');
        setTimeout(() => {
            cartIcon.classList.remove('animate-cart');
        }, 300);
    }

    // Fungsi untuk menambahkan badge
    function addBadges(productCard) {
        if (productCard.dataset.bestSeller === 'true') {
            const badge = document.createElement('span');
            badge.classList.add('badge');
            badge.textContent = 'Best Seller';
            productCard.appendChild(badge);
        }
        if (productCard.dataset.promo === 'true') {
            const badge = document.createElement('span');
            badge.classList.add('badge', 'promo');
            const discount = productCard.dataset.discount ? ` (-${productCard.dataset.discount})` : '';
            badge.textContent = 'Promo' + discount;
            productCard.appendChild(badge);
        }
    }

    // Fungsi untuk memperbarui tampilan daftar produk
    function updateProductList(products) {
        productList.innerHTML = '';
        products.forEach((productData, index) => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.style.animationDelay = `${index * 0.1}s`;
            productCard.dataset.id = productData.dataset.id;
            productCard.dataset.name = productData.dataset.name;
            productCard.dataset.price = productData.dataset.price;
            productCard.dataset.image = productData.dataset.image;
            productCard.dataset.description = productData.dataset.description;
            if (productData.dataset.bestSeller) {
                productCard.dataset.bestSeller = productData.dataset.bestSeller;
            }
            if (productData.dataset.promo) {
                productCard.dataset.promo = productData.dataset.promo;
                if (productData.dataset.discount) {
                    productCard.dataset.discount = productData.dataset.discount;
                }
                if (productData.dataset.originalPrice) {
                    productData.dataset.originalPrice = productData.dataset.originalPrice;
                }
            }

            let priceDisplay = `Rp ${parseInt(productData.dataset.price).toLocaleString('id-ID')}`;
            if (productData.dataset.originalPrice && productData.dataset.promo === 'true') {
                priceDisplay = `<span style="text-decoration: line-through; color: #aaa; font-size: 0.9em;">Rp ${parseInt(productData.dataset.originalPrice).toLocaleString('id-ID')}</span> Rp ${parseInt(productData.dataset.price).toLocaleString('id-ID')}`;
            }

            productCard.innerHTML = `
                <img src="${productData.dataset.image}" alt="${productData.dataset.name}">
                <h3 class="product-title">${productData.dataset.name}</h3>
                <p class="product-price">${priceDisplay}</p>
                <button class="add-to-cart-btn" data-id="${productData.dataset.id}" data-name="${productData.dataset.name}" data-price="${productData.dataset.price}" data-image="${productData.dataset.image}">Tambahkan</button>
            `;

            addBadges(productCard); // Tambahkan badge ke card yang baru dibuat
            productList.appendChild(productCard);
        });
        productList.classList.remove('filtering');
    }

    // Panggil updateProductList di awal untuk menampilkan produk
    updateProductList(allProducts);

    // Delegasi event listener untuk menampilkan detail produk
    productList.addEventListener('click', function(event) {
        const target = event.target.closest('.product-card');
        if (target) {
            showProductDetails(target);
            const rect = target.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            target.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600); // Durasi animasi ripple
        }
    });

    // Delegasi event listener untuk tombol tambah ke keranjang
    productList.addEventListener('click', function(event) {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const button = event.target;
            const productId = button.dataset.id;
            const name = button.dataset.name;
            const price = button.dataset.price;
            const image = button.dataset.image;
            tambahKeKeranjang(productId, name, price, image);
        }
    });

    closeButton.addEventListener('click', hideProductDetails);
    window.addEventListener('click', function(event) {
        if (event.target === productModal) {
            hideProductDetails();
        }
    });

    modalAddToCartButton.addEventListener('click', function() {
        const productId = this.dataset.id;
        const name = this.dataset.name;
        const price = this.dataset.price;
        const image = this.dataset.image;
        tambahKeKeranjang(productId, name, price, image);
        hideProductDetails();
    });

    filterLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const selectedFilter = this.dataset.filter;

            filterLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            productList.classList.add('filtering');
            setTimeout(() => {
                let productsToShow = [];
                if (selectedFilter === 'promo') {
                    productsToShow = allProducts.filter(product => product.dataset.promo === 'true');
                } else if (selectedFilter === 'best-seller') {
                    productsToShow = allProducts.filter(product => product.dataset.bestSeller === 'true');
                } else if (selectedFilter === 'semua') {
                    productsToShow = allProducts;
                } else {
                    // Handle kategori lain jika ada, misalnya berdasarkan atribut data-category
                    productsToShow = allProducts.filter(product => product.dataset.category === selectedFilter);
                }
                updateProductList(productsToShow);
            }, 300);
        });
    });

    categoryLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const selectedCategory = this.dataset.category;

            categoryLinks.forEach(l => l.classList.remove('active'));
            filterLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            productList.classList.add('filtering');
            setTimeout(() => {
                let productsToShow = [];
                if (selectedCategory === 'semua') {
                    productsToShow = allProducts;
                } else {
                    productsToShow = allProducts.filter(product => product.dataset.name.toLowerCase().includes(selectedCategory.toLowerCase()));
                }
                updateProductList(productsToShow);
            }, 300);
        });
    });

    function cariProduk() {
        const searchTerm = searchInput.value.toLowerCase();
        productList.innerHTML = '';
        loadingIndicator.style.display = 'block';
        setTimeout(() => {
            const hasilPencarian = allProducts.filter(productCard => {
                const namaProduk = productCard.dataset.name.toLowerCase();
                const deskripsiProduk = productCard.dataset.description.toLowerCase();
                return namaProduk.includes(searchTerm) || deskripsiProduk.includes(searchTerm);
            });
            if (hasilPencarian.length === 0) {
                productList.innerHTML = '<p style="color:#eee; text-align:center;">Tidak ada produk yang sesuai dengan pencarian Anda.</p>';
            } else {
                updateProductList(hasilPencarian); // Gunakan fungsi updateProductList yang sudah diperbaiki
            }
            loadingIndicator.style.display = 'none';
        }, 500);
    }

    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            cariProduk();
        }
    });

    function nextCarouselSlide() {
        carouselCounter++;
        if (carouselCounter >= carouselImages.length) {
            carouselCounter = 0;
        }
        carousel.style.transform = `translateX(-${carouselCounter * 100}%)`;
    }

    if (carousel && carouselImages.length > 0) {
        setInterval(nextCarouselSlide, carouselInterval);

        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        carouselContainer.addEventListener('touchend', (e) => {
            if (touchStartX === null) {
                return;
            }
            const touchEndX = e.changedTouches[0].clientX;
            const diffX = touchStartX - touchEndX;

            if (diffX > 50) {
                nextCarouselSlide(); // Swipe ke kiri
            } else if (diffX < -50) {
                carouselCounter--;
                if (carouselCounter < 0) {
                    carouselCounter = carouselImages.length - 1;
                }
                carousel.style.transform = `translateX(-${carouselCounter * 100}%)`; // Swipe ke kanan
            }
            touchStartX = null;
        });
    }
});