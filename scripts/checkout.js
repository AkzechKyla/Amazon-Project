import {cart, deleteProductToCart, updateCartQuantity, updateQuantity} from '../data/cart.js';
import {products} from '../data/products.js';
import {formatCurrency} from './utils/money.js';

function generateOrderSummary() {
  let cartSummaryHTML = '';

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;

    let matchingProduct;

    products.forEach((product) => {
         if (product.id === productId) {
            matchingProduct = product;
         }
    });

    cartSummaryHTML += `
          <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
            <div class="delivery-date">
              Delivery date: Tuesday, June 21
            </div>

            <div class="cart-item-details-grid">
              <img class="product-image"
                src="${matchingProduct.image}">

              <div class="cart-item-details">
                <div class="product-name">
                  ${matchingProduct.name}
                </div>
                <div class="product-price">
                  $${formatCurrency(matchingProduct.priceCents)}
                </div>
                <div class="product-quantity">
                  <span>
                    Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}">${cartItem.quantity}</span>
                  </span>
                  <span class="update-quantity-link link-primary" data-product-id="${matchingProduct.id}">
                    Update
                  </span>
                  <input type="number" max="1000" min="1" value="${cartItem.quantity}" class="quantity-input js-quantity-input-${matchingProduct.id}">
                  <span class="save-quantity-link link-primary js-save-quantity-link-${matchingProduct.id}">Save</span>
                  <span class="delete-quantity-link link-primary" data-product-id="${matchingProduct.id}">
                    Delete
                  </span>
                </div>
              </div>

              <div class="delivery-options">
                <div class="delivery-options-title">
                  Choose a delivery option:
                </div>
                ${generateDeliveryOptionsHTML(matchingProduct.id)}
              </div>
            </div>
          </div>
        `
  });

  deleteCartProduct();
  updateCartQuantity('.return-to-home-link');
  updateItemQuantity();
  document.querySelector('.order-summary').innerHTML = cartSummaryHTML;
}

function generateDeliveryOptionsHTML(productId) {
  let deliveryOptionsHTML = '';
  deliveryOptions.forEach((deliveryOption) => {
    deliveryOptionsHTML += `
                <div class="delivery-option">
                  <input type="radio" class="delivery-option-input"
                    name="delivery-option-${productId}">
                  <div>
                    <div class="delivery-option-date">
                      ${deliveryOption.deliveryDays}
                    </div>
                    <div class="delivery-option-price">
                      ${deliveryOption.priceCents}
                    </div>
                  </div>
                </div>
      `;
  });

  return deliveryOptionsHTML;
}

function deleteCartProduct() {
  document.querySelectorAll('.delete-quantity-link').forEach((deleteLink) => {
    deleteLink.addEventListener('click', () => {
      const {productId} = deleteLink.dataset;

      deleteProductToCart(productId);
      generateOrderSummary();
      updateCartQuantity('.return-to-home-link');
    });
  });
}

function updateItemQuantity() {
  document.querySelectorAll('.update-quantity-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      const container = document.querySelector(`.js-cart-item-container-${productId}`);

      container.classList.add('is-editing-quantity');

      document.querySelector(`.js-save-quantity-link-${productId}`).addEventListener('click', update);
      document.querySelector(`.js-quantity-input-${productId}`).addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          update();
        }
      });

      function update() {
        const inputQuantity = Number(document.querySelector(`.js-quantity-input-${productId}`).value);

        if (inputQuantity >= 0 && inputQuantity < 1000) {
          updateQuantity(productId, inputQuantity);
          updateCartQuantity('.return-to-home-link');
          generateOrderSummary();
          container.classList.remove('is-editing-quantity');
        } else {
          alert('Quantity must be at least 0 and less than 1000');
        }
      }
    });
  });
}

generateOrderSummary();
