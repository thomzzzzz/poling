document.addEventListener('DOMContentLoaded', function() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSummary = document.getElementById('cart-summary');
    const cartSubtotalElement = document.getElementById('cart-subtotal');
    const cartTotalElement = document.getElementById('cart-total');
    const bottomCartCountElement = document.getElementById('bottom-cart-count');

    function getCart() {
        return JSON.parse(localStorage.getItem('keranjang') || '[]');
    }

    function updateCartDisplay() {
        const cart = getCart();
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.classList.add('empty-cart');
            emptyMessage.textContent = 'Keranjang Anda kosong.';
            cartItemsContainer.appendChild(emptyMessage);
            cartSummary.style.display = 'none';
            bottomCartCountElement.style.display = 'none';
        } else {
            let subtotal = 0;
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <img src="../${item.gambar}" alt="${item.nama}">
                    <div class="item-details">
                        <h4 class="item-name">${item.nama}</h4>
                        <p class="item-price">Rp ${(item.harga * item.jumlah).toLocaleString('id-ID')}</p>
                        <div class="quantity-controls">
                            <button class="decrease-quantity" data-id="${item.id}">-</button>
                            <span class="item-quantity">${item.jumlah}</span>
                            <button class="increase-quantity" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <div class="cart-actions">
                        <button class="remove-button" data-id="${item.id}">Hapus</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
                subtotal += item.harga * item.jumlah;
            });

            cartSubtotalElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
            cartTotalElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
            cartSummary.style.display = 'block';
            bottomCartCountElement.textContent = cart.reduce((sum, item) => sum + item.jumlah, 0);
            bottomCartCountElement.style.display = cart.length > 0 ? 'inline-block' : 'none';
        }
    }

    // Event listener untuk tombol hapus
    cartItemsContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('remove-button')) {
            const productIdToRemove = event.target.dataset.id;
            let cart = getCart();
            cart = cart.filter(item => item.id !== productIdToRemove);
            localStorage.setItem('keranjang', JSON.stringify(cart));
            updateCartDisplay();
            updateCartCountInIndex();
        } else if (event.target.classList.contains('decrease-quantity')) {
            const productId = event.target.dataset.id;
            updateQuantity(productId, -1);
        } else if (event.target.classList.contains('increase-quantity')) {
            const productId = event.target.dataset.id;
            updateQuantity(productId, 1);
        }
    });

    function updateQuantity(productId, change) {
        let cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex !== -1) {
            cart[itemIndex].jumlah += change;
            if (cart[itemIndex].jumlah < 1) {
                cart.splice(itemIndex, 1); // Hapus item jika jumlahnya kurang dari 1
            }
            localStorage.setItem('keranjang', JSON.stringify(cart));
            updateCartDisplay();
            updateCartCountInIndex();
        }
    }

    function updateCartCountInIndex() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.jumlah, 0);
        const cartCountElements = document.querySelectorAll('#cart-count, #bottom-cart-count');
        cartCountElements.forEach(el => {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'inline-block' : 'none';
        });
    }

    // Panggil fungsi untuk menampilkan keranjang saat halaman dimuat
    updateCartDisplay();

    const checkoutButton = document.querySelector('.checkout-button');
    const paymentModal = document.getElementById('paymentModal');
    const paymentCloseButton = paymentModal.querySelector('.payment-close-button');
    const paymentSummary = document.getElementById('payment-summary');
    const paymentDetails = document.getElementById('payment-details');
    const qrisOptionBtn = document.getElementById('qris-option-btn');
    const ewalletOptionBtn = document.getElementById('ewallet-option-btn');
    const qrisPaymentDiv = document.getElementById('qris-payment');
    const ewalletPaymentDiv = document.getElementById('ewallet-payment');
    const ewalletChoices = document.querySelector('.ewallet-choices');
    const confirmPaymentButtons = document.querySelectorAll('.confirm-payment-button');

    let selectedPaymentMethod = null;
    let selectedEWallet = null;

    checkoutButton.addEventListener('click', function() {
        const cart = getCart();
        let summaryHTML = '<h3>Pesanan Anda:</h3><ul>';
        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.harga * item.jumlah;
            summaryHTML += `<li>${item.nama} (${item.jumlah} x Rp ${item.harga.toLocaleString('id-ID')}) = Rp ${itemTotal.toLocaleString('id-ID')}</li>`;
            total += itemTotal;
        });
        summaryHTML += `</ul><p><strong>Total: Rp ${total.toLocaleString('id-ID')}</strong></p>`;
        paymentSummary.innerHTML = summaryHTML;
        paymentModal.style.display = 'block';
        paymentDetails.style.display = 'none';
        qrisPaymentDiv.style.display = 'none';
        ewalletPaymentDiv.style.display = 'none';
        selectedPaymentMethod = null;
        selectedEWallet = null;
        selectedEWalletText.textContent = '';
    });

    paymentCloseButton.addEventListener('click', function() {
        paymentModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });

    qrisOptionBtn.addEventListener('click', function() {
        paymentDetails.style.display = 'block';
        qrisPaymentDiv.style.display = 'block';
        ewalletPaymentDiv.style.display = 'none';
        selectedPaymentMethod = 'qris';
    });

    ewalletOptionBtn.addEventListener('click', function() {
        paymentDetails.style.display = 'block';
        ewalletPaymentDiv.style.display = 'block';
        qrisPaymentDiv.style.display = 'none';
        selectedPaymentMethod = 'ewallet';
    });

    ewalletChoices.addEventListener('click', function(event) {
        if (event.target.classList.contains('ewallet-button')) {
            selectedEWallet = event.target.dataset.ewallet;
            selectedEWalletText.textContent = `Anda memilih: ${selectedEWallet.toUpperCase()}`;
        }
    });

    confirmPaymentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const method = this.dataset.method;
            const totalAmount = getTotalCartAmount().toLocaleString('id-ID');
            const cart = getCart();
            let productList = '';
            cart.forEach(item => {
                productList += `- ${item.nama} (${item.jumlah} x Rp ${item.harga.toLocaleString('id-ID')})\n`;
            });

            let whatsappMessage = `Konfirmasi Pembayaran\n\nProduk:\n${productList}\nNominal: Rp ${totalAmount}\n\nNote: Jangan lupa serahkan bukti transfer`;
            const whatsappLink = `https://wa.me/6283834510927?text=${encodeURIComponent(whatsappMessage)}`;

            if (method === 'qris' || method === 'ewallet') {
                window.open(whatsappLink, '_blank');
                // Setelah mengirim pesan WhatsApp (atau mencoba), Anda bisa mengosongkan keranjang
                localStorage.removeItem('keranjang');
                updateCartDisplay();
                updateCartCountInIndex();
                paymentModal.style.display = 'none';
            } else {
                alert('Terjadi kesalahan. Metode pembayaran tidak dikenali.');
            }
        });
    });

    function getTotalCartAmount() {
        const cart = getCart();
        let total = 0;
        cart.forEach(item => {
            total += item.harga * item.jumlah;
        });
        return total;
    }
});