import { getLocalStorage, setLocalStorage, alertMessage, removeAllAlerts } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

const services = new ExternalServices();

function formDataToJSON(formElement) {
    const formData = new FormData(formElement);
    const convertedJSON = {};
    formData.forEach((value, key) => {
        convertedJSON[key] = value;
    });
    return convertedJSON;
}

function packageItems(items) {
    const simplifiedItems = items.map((item) => {
        console.log(item);
        return {
            id: item.Id,
            price: item.FinalPrice,
            name: item.Name,
            quantity: item.quantity || 1,
        };
    });
    return simplifiedItems;
}

export class CheckoutProcess {
    constructor(key, outputSelector) {
        this.key = key;
        this.outputSelector = outputSelector;
        this.list = [];
        this.itemTotal = 0;
        this.shipping = 0;
        this.tax = 0;
        this.orderTotal = 0;
    }

    init() {
        const storedItems = getLocalStorage(this.key);
        this.list = Array.isArray(storedItems) ? storedItems : [storedItems];
        this.calculateItemSummary();
    }

    calculateItemSummary() {
        const summaryElement = document.querySelector(
            this.outputSelector + " #cartTotal"
        );
        const itemNumElement = document.querySelector(
            this.outputSelector + " #num-items"
        );
        // changing to account for multiple quantities
        const totalItems = this.list.reduce((sum, item) => sum + (item.quantity || 1), 0);
        itemNumElement.innerText = totalItems;

        //const amounts = this.list.map((item) => item.FinalPrice);
        this.itemTotal = this.list.reduce((sum, item) => sum + (item.FinalPrice * (item.quantity || 1)), 0);
        summaryElement.innerText = `$${this.itemTotal}`;
    }

    calculateOrderTotal() {
        this.tax = (this.itemTotal * .06);
        this.shipping = 10 + (this.list.length - 1) * 2;
        this.orderTotal = (parseFloat(this.itemTotal) + parseFloat(this.tax) + parseFloat(this.shipping));

        this.displayOrderTotals();
    }

    displayOrderTotals() {
        const tax = document.querySelector(`${this.outputSelector} #tax`);
        const shipping = document.querySelector(`${this.outputSelector} #shipping`);
        const orderTotal = document.querySelector(`${this.outputSelector} #orderTotal`);
        
        tax.innerText = `$${this.tax.toFixed(2)}`;
        shipping.innerText = `$${this.shipping.toFixed(2)}`;
        orderTotal.innerText = `$${this.orderTotal.toFixed(2)}`;
    }

    async checkout() {
        const formElement = document.forms.checkout;
        const order = formDataToJSON(formElement);

        order.orderDate = new Date().toISOString();
        order.orderTotal = this.orderTotal;
        order.tax = this.tax;
        order.shipping = this.shipping;
        order.items = packageItems(this.list);
        
        try{
            await services.checkout(order);
            setLocalStorage(this.key, []);
            window.location.assign("checkout/success.html");
        } catch (error) {
            removeAllAlerts();
            const messages = error.message && typeof error.message === "object"
                ? Object.values(error.message)
                :[error.message || "Unable to place order."];
            messages.forEach((message) => alertMessage(message));
        }
    }
}