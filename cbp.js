const crypto = require("crypto");
const fetch = require("node-fetch");
const { stat } = require("fs");
const { type } = require("os");
class CBP {
  constructor() {
    this.secret = "1234567890";
    this.passphrase = "1234567890";
    this.url = "https://api-public.sandbox.pro.coinbase.com";
    //this.url = "https://api.pro.coinbase.com";
  }

  sign(message, path, method) {
    let timeStamp = Date.now() / 1000;
    let requestPath = path;
    let body = JSON.stringify(message);
    let full = timeStamp + method + requestPath + body;

    let key = Buffer(this.secret, "base64");
    let hmac = crypto.createHmac("sha256", key);
    let header = new fetch.Headers();
    header.append("Content-Type", "application/json");
    header.append("CB-ACCESS-KEY", this.secret);
    header.append("CB-ACCESS-SIGN", hmac.update(full).digest("base64"));
    header.append("CB-ACCESS-TIMESTAMP", timeStamp);
    header.append("CB-ACCESS-PASSPHRASE", this.passphrase);
    return header;
  }

  listAccounts() {
    const request = new fetch.Request(this.url, {
      method: "GET",
      header: this.sign("", "/accounts", "GET"),
    });
    return fetch(request);
  }

  getAccount(account) {
    const request = new fetch.Request(this.url, {
      method: "GET",
      header: this.sign("", "/accounts/" + account, "GET"),
    });
    return fetch(request);
  }

  getAccountHistory(account) {
    const request = new fetch.Request(this.url, {
      method: "GET",
      header: this.sign("", "/accounts/" + account + "/ledger", "GET"),
    });
    return fetch(request);
  }

  getHolds(account) {
    const request = new fetch.Request(this.url, {
      method: "GET",
      header: this.sign("", "/accounts/" + account + "/holds", "GET"),
    });
    return fetch(request);
  }

  placeOrder(
    clientId,
    type = "market",
    side,
    productId,
    stp,
    stop,
    stop_price,
    size,
    funds
  ) {
    let json = {};
    let list = [
      "clientId",
      "type",
      "side",
      "productId",
      "stp",
      "stop",
      "stop_price",
      "size",
      "funds",
    ];
    for (let i = 0; i < arguments.length; i++) {
      if (arguments[i].length > 0) {
        json[list[i]] = arguments[i];
      }
    }

    const request = new fetch.Request(this.url, {
      method: "POST",
      header: this.sign(JSON.stringify(json), "/orders", "POST"),
    });
    return fetch(request);
  }

  placeLimitOrder(
    clientId,
    type = "market",
    side,
    productId,
    stp,
    stop,
    stop_price,
    price,
    size,
    time_in_force,
    cancel_after,
    post_only
  ) {
    let json = {};
    let list = [
      "clientId",
      "type",
      "side",
      "productId",
      "stp",
      "stop",
      "stop_price",
      "size",
      "funds",
    ];
    for (let i = 0; i < arguments.length; i++) {
      if (arguments[i].length > 0) {
        json[list[i]] = arguments[i];
      }
    }
    const request = new fetch.Request(this.url, {
      method: "POST",
      header: this.sign(JSON.stringify(json), "/orders", "POST"),
    });
    return fetch(request);
  }

  cancelOrder(id, clientID = "", productID = "") {
    const request = new fetch.Request(this.url, {
      method: "DELETE",
      header: this.sign("", "/orders/" + (id ? id : clientID ? "client:" + clientID : "") + (productID ? "?product_id=" + productID : ""), "DELETE"),
    });
    return fetch(request);
  }

  cancelAllOrders(productID = "") {
    const request = new fetch.Request(this.url, {
      method: "DELETE",
      header: this.sign("", "/orders" + (productID ? "?product_id=" + productID : ""), "DELETE"),
    });
    return fetch(request);
  }

  listOrders(status, productID = "") {
    let queryParameters = "?status=";
    if (Array.isArray(status)) {
      for (let i = 0; i < status.length; i++) {
        queryParameters += status[i] + (i < status.length - 1 ? "&status=" : "");
      }
    } else if (typeof status === "string") {
      queryParameters += status + (productID ? "product_id=" + productID : "");
    }
    const request = new fetch.Request(this.url, {
      method: "GET",
      header: this.sign("", "/orders" + queryParameters, "GET"),
    });
    return fetch(request);
  }

  getOrder(id, clientID = "") {
    const request = new fetch.Request(this.url, {
      method: "GET",
      header: this.sign("", "/orders/" + (id ? id : clientID), "GET"),
    });
    return fetch(request);
  }

  listFills(orderID, productID = "") {
    const request = new fetch.Request(this.url, {
      method: "GET",
      header: this.sign("", "/orders/" + (orderID ? orderID : productID), "GET"),
    });
    return fetch(request);
  }

  getCurrentExchangeLimits() {
    const request = new fetch.Request(this.url, {
      method: "GET",
      header: this.sign("", "/users/self/exchange-limits", "GET"),
    });
    return fetch(request);
  }

  listDeposits(type = "deposit", profileID, before, after, limit) {
    let queryParameters = "";
    let list = ["type", "profile_id", "before", "after", "limit"];
    for (let i = 0; i < arguments.length; i++) {
      if (arguments[i].length > 0) {
        queryParameters += list[i] + "=" + arguments[i];
      }

      if (i < arguments.length - 1) {
        queryParameters += "&";
      }
    }

    const request = new fetch.Request(this.url, {
      method: "GET",
      header: this.sign("", "/transfers?" + queryParameters, "GET"),
    });
    return fetch(request);
  }

  getDeposit(transferID) {
    const request = new fetch.Request(this.url, {
      method: "GET",
      header: this.sign("", "/transfers/" + transferID, "GET"),
    });
    return fetch(request);
  }


  depositFundsFrom(amount, currency, paymentMethodID) {
    let json = {
      "amount": amount,
      "currency": currency,
      "payment_method_id": paymentMethodID
    };

    const request = new fetch.Request(this.url, {
      method: "POST",
      header: this.sign(JSON.stringify(json), "/deposits/payment-method", "POST"),
    });
    return fetch(request);
  }

  depositFundsFromCB(amount, currency, coinbaseAccountID) {
    let json = {
      "amount": amount,
      "currency": currency,
      "coinbase_account_id": coinbaseAccountID
    };

    const request = new fetch.Request(this.url, {
      method: "POST",
      header: this.sign(JSON.stringify(json), "/deposits/coinbase-account", "POST"),
    });
    return fetch(request);

  }

  generateCryptoAddress(cbAccountID) {
    const request = new fetch.Request(this.url, {
      method: "POST",
      header: this.sign("", "/coinbase-accounts/" + cbAccountID + "/addresses", "POST"),
    });
    return fetch(request);
  }

  listWithdrawals() {
    const request = new fetch.Request(this.url, {
      method: "GET",
      header: this.sign("", "/deposits/coinbase-account", "GET"),
    });

  }
}

let cbp = new CBP();

//cbp.listAccounts();
