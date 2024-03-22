const express = require("express");
const bodyParser = require("body-parser");
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");

const app = express();

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
        "AbCPtrR4iGxk83faIWtHx1ZseqQ_J2L6XQWNCJzLZ7yJeAo1djBwIFzJl0xtovxlzSjn4b5qsT_cur4K",
    client_secret:
        "EA8r-gNIa2ciKLf04leFluhxlBqCJ8o2t3SMGK1pwvMIfig_kg1tp0oCCdYSA1ua5ycpKfS3UKGH3Za2"
});

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/paypal", (req, res) => {
  const {total} = req.body;

  const create_payment_json = {
      intent: "sale",
      payer: {
          payment_method: "paypal"
      },
      redirect_urls: {
          return_url: "https://laundry-api-8guz.onrender.com/success",
          cancel_url: "https://laundry-api-8guz.onrender.com/cancel"
      },
      transactions: [
          {
              item_list: {
                  items: [
                      {
                        name: "item",
                        sku: "item",
                        price: total, // Use the total amount here
                        currency: "USD",
                        quantity: 1
                      }
                  ]
              },
              amount: {
                  currency: "USD",
                  total: total
              },
              description: "This is the payment description."
          }
      ]
  };

  paypal.payment.create(create_payment_json, function(error, payment) {
      if (error) {
          throw error;
      } else {
          console.log("Create Payment Response");
          console.log(payment);
          res.redirect(payment.links[1].href);
      }
  });
});

app.get("/success", (req, res) => {
  // res.send("Success");
  var PayerID = req.query.PayerID;
  var paymentId = req.query.paymentId;
  var execute_payment_json = {
      payer_id: PayerID,
      transactions: [
          {
              amount: {
                  currency: "USD",
                  total: "1.00"
              }
          }
      ]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function(
      error,
      payment
  ) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log("Get Payment Response");
          console.log(JSON.stringify(payment));
          res.render("success");
      }
  });
});

app.get("cancel", (req, res) => {
  res.render("cancel");
});

app.listen(3000, () => {
  console.log("Server is running");
});