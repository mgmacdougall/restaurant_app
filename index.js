import {menuArray as menu} from "/data.js";
import {v4 as uuidv4} from "https://jspm.dev/uuid";
// console.log(uuidv4()); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

const menuItemEl = document.getElementById("menuItems");
let userOrder = [];
let orderTotal = [];
let htmlString = "";

function getIngredients(idx) {
  let ingredientsList = "";
  menu[idx].ingredients.forEach(function(ingredient) {
    ingredientsList += `${ingredient} `;
  });
  return ingredientsList.trim().replaceAll(" ", ", ");
}

function getCurrency(amount, locale = "USD") {
  if (locale === "USD") {
    let usdFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    });

    return usdFormatter.format(amount);
  }
}

function buildMenuList() {
  menu.forEach(function(menuItem, idx) {
    htmlString += `
      <div class="menuItem">
        <div>
          <p class="img-med">${menuItem.emoji}</p>
        </div>
        <div>
          <div><h3>${menuItem.name}</h3></div>
          <div><span class="item-name">${getIngredients(idx)}</span></div>
          <div><span class="item-price">${getCurrency(
            menuItem.price
          )}</span></div>
        </div>
        <div class="button-group">
          <button class="round-button background-gray" data-order="order_${menuItem.name}">+</button>
        </div>
      </div>
      <br class="seperator">
      `;
  });
}

// Dynamic portion to build menu
function getMenuItemDetails(item) {
  return menu.filter(function(_item) {
    return _item.name === item;
  })[0];
}

function unHideOrderPanel() {
  const orderElm = document.getElementById("order-container");
  if (orderElm.classList.contains("hidden")) {
    orderElm.classList.remove("hidden");
    orderElm.classList.add("visible");
  }
}

function hideOrderPanel() {
  const orderElm = document.getElementById("order-container");
  if (orderElm.classList.contains("visible")) {
    orderElm.classList.remove("visible");
    orderElm.classList.add("hidden");
  }
}

function renderOrderItem() {
  const orderDetailsEl = document.getElementById("order");
  unHideOrderPanel();
  let item = "";
  if (userOrder.length > 0) {
    userOrder.forEach(function(menuItem) {
      item = `
    <div class="order-item" data-orderID=${menuItem.uuid}>
    <div class="order-details" id="order-details">
    <p class="text-med bold order-details-text">${menuItem.name}</p>
    <button class="btn-flat remove" id=${menuItem.uuid}>remove</button>
    </div>
    <div class="order-price">
    <p class="text-med bold ">$${menuItem.price}</p>
    </div>
    </div>`;
    });
    orderDetailsEl.innerHTML += item;
  } else {
    orderDetailsEl.innerHTML = "";
    hideOrderPanel();
  }
}

function getOrderTotal() {
  let total = 0;
  for (let orderedItem of orderTotal) {
    console.log(orderedItem.price);
    total += orderedItem.price;
  }
  return total;
}

function renderOrderTotal() {
  const orderTotalEl = document.getElementById("orderTotal");
  const totalEl = document.getElementById("total-container");
  if (orderTotal.length === 0) {
    console.log("remove the total section");
    orderTotalEl.innerHTML = "";
  }
  if (totalEl == null && orderTotal.length > 0) {
    let totalSection = `
    <div id="total-container" class="order-item">
    <p>Total</p><p id="running-total">${getOrderTotal()}</p>
    </div>
    `;
    orderTotalEl.innerHTML += totalSection;
  } else if (totalEl && orderTotal.length === 0) {
    hideOrderPanel();
  } else {
    document.getElementById("running-total").innerHTML = getOrderTotal();
  }
}

function addToOrderTotal(itemOrdered) {
  itemOrdered.uuid = uuidv4();
  userOrder.push(itemOrdered);
}

function removeFromOrderTotal(itemUUID) {
  for (let index = 0; index < orderTotal.length; index++) {
    const element = orderTotal[index];
    console.log(element.uuid);
    if (element.uuid === itemUUID) {
      orderTotal.splice(index, 1);
    }
  }
}

function addItem(menuItem) {
  const t = getMenuItemDetails(menuItem);
  addToOrderTotal(t); // add to order
  renderOrderItem();
  orderTotal.push({uuid: t.uuid, price: getMenuItemDetails(menuItem).price});
  renderOrderTotal();
  const orderElm = document.getElementById("order-container");
  if (orderElm.classList.contains("hidden")) {
    orderElm.classList.toggle("visible");
  }
}

const orderContainerEl = document.getElementById("order-container");

function handleRemoveItemClick(uuid) {
  const t = document.querySelector(`[data-orderID="${uuid}"]`);
  t.remove();

  // update the array - by removing the found price from the array.
  removeFromOrderTotal(uuid);
  renderOrderTotal();
}

// Seperate Handlers to avoid bubbling into two handlers.
// Handler for the Total  portion

function renderOrderForm() {
  let t = document.querySelector(".parent");
  t.classList.remove("display-none");
  t.classList.toggle("visible");
}

orderContainerEl.addEventListener("click", function(e) {
  console.log(e.target.id);
  if (e.target.id === "orderButton") {
    console.log("Show order form");
    renderOrderForm();
  }
  if (e.target.id != "orderButton") {
    handleRemoveItemClick(e.target.id);
    if (userOrder.length === 0) {
      hideOrderPanel();
    }
  }
});

// Handler for the Order portion
menuItemEl.addEventListener("click", function(e) {
  if (e.target.dataset.order === "order_Pizza") {
    addItem("Pizza");
  } else if (e.target.dataset.order === "order_Hamburger") {
    addItem("Hamburger");
  } else if (e.target.dataset.order === "order_Beer") {
    addItem("Beer");
  } else {
    console.log("invalid item");
  }
  console.log(getOrderTotal());
});

document.getElementById("orderButton").addEventListener("click", function() {
  console.log("Display order form");
});

function renderOrderMessage(name) {
  // build the
  let message = `<div class="msg-center">
  <span>Thanks ${name}! Your order is on the way!</span>
</div>`;

  let messageEl = document.getElementById("message");
  let orderElm = document.getElementById("order-container");
  let modal = document.querySelector(".parent");

  orderElm.classList.toggle("display-none");
  modal.classList.toggle('display-none')
  messageEl.innerHTML = message;
  messageEl.classList.toggle("visible");
}

// Form control
document.getElementById("myForm").addEventListener("submit", function(e) {
  e.preventDefault();
  console.log(e.target.elements);
  renderOrderMessage('Mike')
});

function render() {
  buildMenuList();
  menuItemEl.innerHTML = htmlString;
}
render();
