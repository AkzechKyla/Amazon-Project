// import {cart, deleteProductToCart, getCartQuantity, updateQuantity, updateDeliveryOption} from '../../data/cart.js';
import {cart} from '../checkout.js';
import {getProduct} from '../../data/products.js';
import {deliveryOptions, getDeliveryOption, calculateDeliveryDate} from '../../data/deliveryOptions.js';
import {generatePaymentSummary} from './paymentSummary.js';

export function generateOrderSummary() {
  let cartSummaryHTML = '';

  cart.cartItems.forEach((cartItem) => {
    const productId = cartItem.productId;
    const matchingProduct = getProduct(productId);
    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    let deliveryDate = calculateDeliveryDate(deliveryOption.deliveryDays).format('dddd, MMMM D');

    cartSummaryHTML += `
      <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
        <div class="delivery-date">
          Delivery date: ${deliveryDate}
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image"
            src="${matchingProduct.image}">

          <div class="cart-item-details">
            <div class="product-name">
              ${matchingProduct.name}
            </div>
            <div class="product-price">
              ${matchingProduct.getPrice()}
            </div>
            <div class="product-quantity">
              <span>
                Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}">${cartItem.quantity}</span>
              </span>
              <span
                class="update-quantity-link link-primary"
                onclick="window.updateItemQuantity('${matchingProduct.id}')"
              >
                Update
              </span>
              <input type="number" max="1000" min="1" value="${cartItem.quantity}" class="quantity-input js-quantity-input-${matchingProduct.id}">
              <span
                class="save-quantity-link link-primary js-save-quantity-link-${matchingProduct.id}"
                onclick="window.saveItemQuantity('${matchingProduct.id}')"
                >Save</span>
              <span
                class="delete-quantity-link link-primary"
                onclick="window.deleteCartProduct('${matchingProduct.id}')"
              >
                Delete
              </span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">
              Choose a delivery option:
            </div>
            ${generateDeliveryOptionsHTML(matchingProduct, cartItem)}
          </div>
        </div>
      </div>
    `
  });

  document.querySelector('.order-summary').innerHTML = cartSummaryHTML;
  updateCheckoutHeader();
}

function generateDeliveryOptionsHTML(matchingProduct, cartItem) {
  let deliveryOptionsHTML = '';

  deliveryOptions.forEach((deliveryOption) => {
    let deliveryDate = calculateDeliveryDate(deliveryOption.deliveryDays).format('dddd, MMMM D');
    let shippingPrice = `$${deliveryOption.priceCents / 100} - Shipping`;
    let isChecked = cartItem.deliveryOptionId === deliveryOption.id ? 'checked' : '' ;

    if (deliveryOption.priceCents === 0) {
      shippingPrice = 'FREE Shipping';
    }

    deliveryOptionsHTML += `
      <div
        class="delivery-option"
        data-product-id="${matchingProduct.id}"
        data-delivery-option-id="${deliveryOption.id}"
        onclick="window.updateDeliveryDate(this)"
      >
        <input type="radio" ${isChecked} class="delivery-option-input"
          name="delivery-option-${matchingProduct.id}">
        <div>
          <div class="delivery-option-date">
            ${deliveryDate}
          </div>
          <div class="delivery-option-price">
            ${shippingPrice}
          </div>
        </div>
      </div>
    `;
  });

  return deliveryOptionsHTML;
}

function updateCheckoutHeader() {
  let cartQuantity = cart.getCartQuantity();
  let itemText = cartQuantity === 0 ? "item" : "items";
  document.querySelector('.return-to-home-link').textContent = `${cartQuantity} ${itemText}`;
}

window.updateDeliveryDate = (option) => {
  const {productId, deliveryOptionId} = option.dataset;
  cart.updateDeliveryOption(productId, deliveryOptionId);
  generateOrderSummary();
  generatePaymentSummary();

}

window.deleteCartProduct = (productId) => {
  cart.deleteProductToCart(productId);
  generateOrderSummary();
  generatePaymentSummary();
  updateCheckoutHeader();
};

window.updateItemQuantity = (productId) => {
  const container = document.querySelector(`.js-cart-item-container-${productId}`);
  container.classList.add('is-editing-quantity');
}

window.saveItemQuantity = (productId) => {
  const inputQuantity = Number(document.querySelector(`.js-quantity-input-${productId}`).value);
  const container = document.querySelector(`.js-cart-item-container-${productId}`);

  if (inputQuantity >= 0 && inputQuantity < 1000) {
    cart.updateQuantity(productId, inputQuantity);
    updateCheckoutHeader();
    generateOrderSummary();
    generatePaymentSummary();
    container.classList.remove('is-editing-quantity');
  } else {
    alert('Quantity must be at least 0 and less than 1000');
  }
}
