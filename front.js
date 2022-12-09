const url = "https://livejs-api.hexschool.io/api/livejs/v1/customer/uaena";

//const url = "https://livejs-api.hexschool.io/api/livejs/v1/customer/eunbin/products";
const selCategory = document.querySelector(".productSelect");
const productWrap = document.querySelector(".productWrap");
const btnDelCart = document.querySelector(".discardAllBtn");
const cartWrap = document.querySelector(".cartWrap");
let productList = [];
let cartList = [];
let cartProducts = [];
let totalPrice = 0;
const spantotalPrice = document.querySelector(".totalPrice");
init();
//取得產品列表
function getData() {
  axios.get(`${url}/products`).then((res) => {
    productList = res.data.products;
    render();
  });
}

//顯示產品
function render() {
  let str = "";
  let tempData = [];
  tempData = productList.filter((item) => {
    if (selCategory.value != "全部") {
      return item.category == selCategory.value;
    } else {
      return item;
    }
  });
  tempData.forEach((item) => {
    str += `<li class="productCard">
        <h4 class="productType">新品</h4>
        <img
          src=${item.images}
          alt=""
        />
        <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${moneyFormat(
          item.origin_price.toString()
        )}</del>
        <p class="nowPrice">NT$${moneyFormat(item.price.toString())}</p>
      </li>`;
  });
  productWrap.innerHTML = str;

  const btnAddCart = document.querySelectorAll(".addCardBtn");

  btnAddCart.forEach((item) => {
    item.addEventListener("click", function (e) {
      addProduct(e.target.dataset.id);
      e.preventDefault();
    });
  });
}
//取得購物車列表
function getCart() {
  axios.get(`${url}/carts`).then((res) => {
    cartList = res.data.carts;
    spantotalPrice.textContent = moneyFormat(res.data.finalTotal.toString());
    renderCart();
  });
}
//顯示購物車
function renderCart() {
  let str = "";
  cartList.forEach((item) => {
    str += `<tr>
    <td>
      <div class="cardItem-title">
        <img src="${item.product.images}" alt="" />
        <p>${item.product.title}</p>
      </div>
    </td>
    <td>NT$${moneyFormat(item.product.origin_price.toString())}</td>
    <td>${item.quantity}</td>
    <td>NT$${moneyFormat(item.product.price.toString())}</td>
    <td class="discardBtn">
      <a href="#" class="material-icons delSingleCart" data-id="${
        item.id
      }"> clear </a>
    </td>
  </tr>`;
  });

  cartWrap.innerHTML = str;

  if (cartList.length == 0) {
    btnDelCart.setAttribute("disabled", true);
  } else {
    btnDelCart.setAttribute("disabled", false);
  }
  //註冊單一刪除
  const btndelCart = document.querySelectorAll(".delSingleCart");
  btndelCart.forEach((item) => {
    item.addEventListener("click", function (e) {
      delProduct(e.target.dataset.id);
      e.preventDefault();
    });
  });
}
selCategory.addEventListener("change", function () {
  render();
});

function init() {
  getData();
  getCart();
}

//加入購物車
function addProduct(id) {

  let productIDList = [];
  cartList.forEach((item) => {
    productIDList.push(item.product.id);
  });


  if (productIDList.indexOf(id) < 0) {
    let data = {
      productId: id,
      quantity: 1,
    };
    
    axios.post(`${url}/carts`, { data }).then((res) => {
      cartList = res.data.carts;
      spantotalPrice.textContent = moneyFormat(res.data.finalTotal.toString());
      renderCart();
      
    });
  } else {
    let data = {
      id: cartList[productIDList.indexOf(id)].id,
      quantity: cartList[productIDList.indexOf(id)].quantity+1,
    };
    axios.patch(`${url}/carts`, { data }).then((res) => {
      cartList = res.data.carts;
      spantotalPrice.textContent = moneyFormat(res.data.finalTotal.toString());
      renderCart();

    });
  }


}
//刪除單一購物車
function delProduct(id) {
  axios.delete(`${url}/carts/${id}`).then((res) => {
    cartList = res.data.carts;
    spantotalPrice.textContent = res.data.finalTotal;
    renderCart();
  });
}
//刪除全部購物車
btnDelCart.addEventListener("click", function (e) {
  delCart();
  e.preventDefault();
});
function delCart() {
  axios.delete(`${url}/carts`).then((res) => {
    cartList = res.data.carts;
    spantotalPrice.textContent = res.data.finalTotal;
    renderCart();

    alert("已清空購物車!");
  });
}
//送出訂單

// const btnSendOrder = document.querySelector(".orderInfo-btn");
// btnSendOrder.addEventListener("click", function (e) {
//   checkaaa();
//   // e.preventDefault();

// //   // Fetch all the forms we want to apply custom Bootstrap validation styles to
// //   var forms = document.querySelectorAll(".needs-validation");
// //   // console.log(cartWrapLength);
// //   // // Loop over them and prevent submission
// //   // Array.prototype.slice.call(forms).forEach(function (form) {
// //   //   form.addEventListener(
// //   //     "submit",
// //   //     function (event) {
// //   //       if (!form.checkValidity()) {
// //   //         event.preventDefault();
// //   //         event.stopPropagation();
// //   //       }
// //   //       form.classList.add("was-validated");
// //   //     },
// //   //     false);
// //   // // e.preventDefault();
// //   //     valid();
//   //  checkOrder();
// //   //     e.preventDefault();
// //   // });
// });

//檢查訂單
function checkOrder() {
  const cartWrapLength = document.querySelectorAll(".cartWrap tr").length;
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const tradeWay = document.querySelector("#tradeWay").value;

  if (cartWrapLength < 1) {
    alert("請至少一筆購物車資料!");
    return false;
  } else {
    let data = {
      user: {
        name: customerName,
        tel: customerPhone,
        email: customerEmail,
        address: customerAddress,
        payment: tradeWay,
      },
    };
    axios.post(`${url}/orders`, { data }).then((res) => {
      document.querySelector(".orderInfo-form").reset();
      cartWrap.innerHTML = "";
      spantotalPrice.textContent = "0";
      alert("已送出訂單，感謝您的訂購~");
    });
  }
}
//千分位
function moneyFormat(money) {
  return money.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}
//驗證

(function () {
  validate.extend(validate.validators.datetime, {
    parse: function (value, options) {
      return +moment.utc(value);
    },
    format: function (value, options) {
      var format = options.dateOnly ? "YYYY-MM-DD" : "YYYY-MM-DD hh:mm:ss";
      return moment.utc(value).format(format);
    },
  });
  var constraints = {
    email: {
      presence: {
        message: "是必填的欄位",
      }, // Email 是必填欄位
      email: true, // 需要符合 email 格式
    },
    姓名: {
      presence: {
        message: "是必填的欄位",
      }, // 必填使用者名稱
      // length: {
      //   minimum: 3, // 名稱長度要超過 3
      //   message: "是必填的欄位"
      // },
      // format: {
      //   pattern: "[a-z0-9]+", // 只能填入英文或數字
      //   flags: "i",// 大小寫不拘
      //   message: "只能包含 a-z 和 0-9"
      // }
    },
    電話: {
      presence: {
        message: "是必填的欄位",
      },
    },
    寄送地址: {
      presence: {
        message: "是必填的欄位",
      },
    },
  };

  // Hook up the form so we can prevent it from being posted
  var form = document.querySelector("form#main3");
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    handleFormSubmit(form);
  });

  // 監聽 input 值改變的狀況
  var inputs = document.querySelectorAll("input, textarea, select");
  for (var i = 0; i < inputs.length; ++i) {
    inputs.item(i).addEventListener("change", function (ev) {
      var errors = validate(form, constraints) || {};
      showErrorsForInput(this, errors[this.name]);
    });
  }

  // 沒有錯誤就顯示成功傳送
  function handleFormSubmit(form, input) {
    var errors = validate(form, constraints); // validate the form aainst the constraints
    showErrors(form, errors || {}); // then we update the form to reflect the results
    if (!errors) {
      showSuccess();
    }
  }

  // Updates the inputs with the validation errors
  function showErrors(form, errors) {
    // We loop through all the inputs and show the errors for that input
    _.each(
      form.querySelectorAll("input[name], select[name]"),
      function (input) {
        // Since the errors can be null if no errors were found we need to handle
        // that
        showErrorsForInput(input, errors && errors[input.name]);
      }
    );
  }

  // Shows the errors for a specific input
  function showErrorsForInput(input, errors) {
    // This is the root of the input
    var formGroup = closestParent(input.parentNode, "orderInfo-formGroup"),
      // Find where the error messages will be insert into
      messages = formGroup.querySelector(".messages");
    // First we remove any old messages and resets the classes
    resetFormGroup(formGroup);
    // If we have errors
    if (errors) {
      // we first mark the group has having errors
      formGroup.classList.add("has-error");
      // then we append all the errors
      _.each(errors, function (error) {
        addError(messages, error);
      });
    } else {
      // otherwise we simply mark it as success
      formGroup.classList.add("has-success");
    }
  }

  // Recusively finds the closest parent that has the specified class
  function closestParent(child, className) {
    if (!child || child == document) {
      return null;
    }
    if (child.classList.contains(className)) {
      return child;
    } else {
      return closestParent(child.parentNode, className);
    }
  }

  function resetFormGroup(formGroup) {
    // Remove the success and error classes
    formGroup.classList.remove("has-error");
    formGroup.classList.remove("has-success");
    // and remove any old messages
    _.each(formGroup.querySelectorAll(".help-block.error"), function (el) {
      el.parentNode.removeChild(el);
    });
  }

  // Adds the specified error with the following markup
  // <p class="help-block error">[message]</p>
  function addError(messages, error) {
    var block = document.createElement("p");
    block.classList.add("help-block");
    block.classList.add("error");
    block.innerText = error;
    console.log(block);
    messages.appendChild(block);
  }
  function showSuccess() {
    // alert("Success!"); // We made it \:D/
    checkOrder();
  }
})();
