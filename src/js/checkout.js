import { loadHeaderFooter } from "./utils.mjs";
import { CheckoutProcess } from "./CheckoutProcess.mjs";

loadHeaderFooter();

const order = new CheckoutProcess("so-cart", ".checkout-summary");
order.init();
order.calculateOrderTotal();

document
  .querySelector("#zip")
  .addEventListener("blur", order.calculateOrderTotal.bind(order));

document.forms.checkout.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.currentTarget.checkValidity()) {
    order.checkout();
  } else {
    event.currentTarget.reportValidity();
  }
  //const myForm = document.forms[0];
  //const chk_status = myForm.checkValidity();
  //myForm.reportValidity();
  //if(chk_status)
  //order.checkout();
});
