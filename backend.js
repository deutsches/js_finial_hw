const api_path = "uaena";
const url = "https://livejs-api.hexschool.io/api/livejs/v1/admin/uaena";
const token = "tVPEUcxBRdQxsrkkt5jS814Egal2";
const orderWrap = document.querySelector(".orderWrap");
let orderList = [];

const btnDelOrders = document.querySelector(".discardAllBtn");
getOrder();

function getOrder() {
  axios
    .get(`${url}/orders`, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      console.log(res);
      orderList = res.data.orders;
      renderOrder();
    });
}

function renderOrder() {
  const orderWrap = document.querySelector(".orderWrap");
  let str = "";
  let totalProduct = [];
  let tempProductObj = {};
  orderList.forEach((item) => {
    let productList = "";
    item.products.forEach((item, index) => {
      productList += `<p>${index + 1}. ${item.title} X${item.quantity}</p>`;
      if (tempProductObj[item.title] == undefined) {
        tempProductObj[item.title] = item.quantity * item.price;
      } else {
        tempProductObj[item.title] += item.quantity * item.price;
      }
    });
    str += `<tr>
        <td>${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          <p>${productList}</p>
        </td>
        <td>${new Date(item.createdAt)}</td>
        <td class="orderStatus">
          <a href="#">${item.paid ? "已處理" : "未處理"}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn" data-id="${
            item.id
          }" value="刪除">
        </td>
    </tr>`;
  });
  orderWrap.innerHTML = str;

  renderPie(tempProductObj, totalProduct);
  const btnDelSignleOrder = document.querySelectorAll(".delSingleOrder-Btn");
  btnDelSignleOrder.forEach((item) => {
    item.addEventListener("click", function (e) {
      delSingleOrder(e.target.dataset.id);
    });
  });
}
function renderPie(tempProductObj, totalProduct) {
  // Object.keys(tempProductObj).forEach((key) => {
  //   let tempProduct = [];
  //   tempProduct.push(key);
  //   tempProduct.push(tempProductObj[key]);
  //   totalProduct.push(tempProduct);
  // });

  // 排序全部訂單金額
  const sortOrder = Object.keys(tempProductObj).sort((a, b) => {
    // console.log(tempProductObj[a]);
    // console.log(tempProductObj[b]);
    return tempProductObj[a] - tempProductObj[b];
  });
  let totalPrice = 0;
  for (let i = sortOrder.length - 1; i >= 0; i--) {
    let tempProduct = [];
    if (i == sortOrder.length - 1 || i == sortOrder.length - 2 || i == sortOrder.length - 3) {
      tempProduct.push(sortOrder[i]);
      tempProduct.push(tempProductObj[sortOrder[i]]);
      totalProduct.push(tempProduct);
    } else {
      totalPrice += tempProductObj[sortOrder[i]];
      if (i == 0) {
        tempProduct.push("其他");
        tempProduct.push(totalPrice);

        totalProduct.push(tempProduct);
      }
    }
  }
  // C3.js
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: totalProduct,
      colors: {
        "Charles 系列儲物組合": "#e6e6ff",
        "Charles 雙人床架": "#5434A7",
        "Antony 雙人床架": "#e6e6ff",
        "Antony 遮光窗簾": "#ccccff",
        "Antony 床邊桌": "#b3b3ff",
        "Jordan 雙人床架／雙人加大": "#301E5F",
        "Louvre 雙人床架／雙人加大": "#99e699",
        "Louvre 單人床架": "#248f24",
        其他: "brown",
      },
    },
  });
}

function delAllOrder() {
  axios
    .delete(`${url}/orders`, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      orderList = res.data.orders;
      renderOrder();
    });
}
function delSingleOrder(id) {
  axios
    .delete(`${url}/orders/${id}`, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      orderList = res.data.orders;
      renderOrder();
    });
}
btnDelOrders.addEventListener("click", function (e) {
  e.preventDefault();
  delAllOrder();
});
