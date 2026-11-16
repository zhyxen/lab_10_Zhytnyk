const loadCartBtn = document.getElementById('loadCartBtn');
const cartIdInput = document.getElementById('cartIdInput');
const testModeCheckbox = document.getElementById('testModeCheckbox');
const statusArea = document.getElementById('statusArea');
const errorArea = document.getElementById('errorArea');
const cartContainer = document.getElementById('cartContainer');

const cartIdDisplay = document.getElementById('cartIdDisplay');
const cartItemsList = document.getElementById('cartItemsList');
const cartTotal = document.getElementById('cartTotal');
const cartDiscountedTotal = document.getElementById('cartDiscountedTotal');

loadCartBtn.addEventListener('click', async () => {
    const cartId = cartIdInput.value.trim() || 1;
    const isTestMode = testModeCheckbox.checked;

    hideErrors();
    hideCart();
    loadCartBtn.disabled = true;

    try {
        const cartData = await requestWithRetry(cartId, isTestMode);
        displayCart(cartData);
    } catch (error) {
        showError(`Помилка: ${error.message}. Спробуйте пізніше.`);
    } finally {
        loadCartBtn.disabled = false;
        hideStatus();
    }
});

async function requestWithRetry(cartId, isTestMode) {
    const maxAttempts = 2;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            showStatus(`Спроба ${attempt} із ${maxAttempts}: завантаження...`);

            if (isTestMode && attempt === 1) {
                throw new Error("Тестова помилка першої спроби");
            }

            const response = await fetch(`https://dummyjson.com/carts/${cartId}?delay=3000`);

            if (!response.ok) {
                throw new Error(`HTTP статус: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (attempt < maxAttempts) {
                showStatus(`Спроба ${attempt} невдала. Пауза 1 сек...`);
                await new Promise(res => setTimeout(res, 1000));
            } else {
                throw error;
            }
        }
    }
}

function displayCart(cart) {
    cartIdDisplay.textContent = cart.id;
    cartItemsList.innerHTML = '';

    cart.products.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.title}</td>
            <td>${item.price} $</td>
            <td>${item.quantity}</td>
            <td><strong>${item.total} $</strong></td>
        `;
        cartItemsList.appendChild(row);
    });

    cartTotal.textContent = cart.total;
    cartDiscountedTotal.textContent = cart.discountedTotal;
    cartContainer.classList.remove('hidden');
}

function showStatus(msg) { statusArea.textContent = msg; statusArea.classList.remove('hidden'); }
function hideStatus() { statusArea.classList.add('hidden'); }
function showError(msg) { errorArea.textContent = msg; errorArea.classList.remove('hidden'); }
function hideErrors() { errorArea.classList.add('hidden'); }
function hideCart() { cartContainer.classList.add('hidden'); }