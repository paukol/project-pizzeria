import{select, classNames, templates, settings} from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';


class Cart{
  constructor(element){
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    console.log('newCart', thisCart);
  }
  getElements(element){
    const thisCart = this;

    thisCart.dom ={};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
    });
    thisCart.dom.productList.addEventListener('remove',function(){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  update() {
    const thisCart = this;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }
    if (thisCart.totalNumber > 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    }
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

    if (thisCart.subtotalPrice > 0) {
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      for (let totalPrice of thisCart.dom.totalPrice) {
        totalPrice.innerHTML = thisCart.totalPrice;
        // console.log('totalPrice: ', totalPrice);
      }
    } else {
      thisCart.dom.deliveryFee.innerHTML = 0;
      for (let totalPrice of thisCart.dom.totalPrice) {
        totalPrice.innerHTML = 0;
      }
    }
  }
    
  add(menuProduct){
    const thisCart= this;
    // console.log('adding product', menuProduct);
    /*generate HTML based on template*/
    const generatedHTML = templates.cartProduct(menuProduct);
    /*create element using utils.createElementFromHTML*/
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    const cartContainer = document.querySelector(select.cart.productList);   
    /*add element to menu*/
    cartContainer.appendChild(generatedDOM);
      
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    // console.log('thisCart.products', thisCart.products);
    thisCart.update();
  }

  remove(cartProduct) {
    const thisCart = this;

    const index = thisCart.products.indexOf(CartProduct);
    thisCart.products.splice(index, 1);
    cartProduct.dom.wrapper.remove();
    thisCart.update();

  }

  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order;

    thisCart.payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: []
    };
      
    
    for(let prod of thisCart.products) {
      this.payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(thisCart.payload),
    };
      
    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
  }
}

export default Cart;