import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export default class ProductDetails {

  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productId);
    this.renderProductDetails();
    document
      .getElementById("add-to-Cart")
      .addEventListener("click", this.addProductToCart.bind(this));
  }

  addProductToCart() {
    const cartItems = getLocalStorage("so-cart") || [];
    
    // Duplicate Items in cart
    const existingItem = cartItems.find(item => item.Id === this.product.Id);
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) +1;
    } else {
      cartItems.push(this.product);
    }
    setLocalStorage("so-cart", cartItems);
    animateCart();
  }

  renderProductDetails() {
    productDetailsTemplate(this.product);
  }
}

function productDetailsTemplate(product) {
    document.querySelector("h2").textContent = product.Category.charAt(0).toUpperCase() + product.Category.slice(1);
    document.querySelector("#productBrand").textContent = product.Brand.Name;
    document.querySelector("#productName").textContent = product.NameWithoutBrand;

    const productImage = document.querySelector("#productImage");
    productImage.src = product.Images.PrimaryExtraLarge;
    productImage.alt = product.NameWithoutBrand;

    document.querySelector("#productPrice").textContent = product.FinalPrice;
    document.querySelector("#productColor").textContent = product.Colors[0].ColorName;
    document.querySelector("#productDesc").innerHTML = product.DescriptionHtmlSimple;

    document.querySelector("#add-to-Cart").dataset.Id = product.Id;
}

function animateCart() {
  const cartIcon = document.querySelector(".cart");
  
  cartIcon.classList.remove("bounce");
  void cartIcon.offsetWidth;
  cartIcon.classList.add("bounce");
}


