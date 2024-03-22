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

app.post('/paypal', async (req, res) => {
    try {
      const { total } = req.body;
      const create_payment_json = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        redirect_urls: {
          return_url: 'http://localhost:3000/success',
          cancel_url: 'http://localhost:3000/cancel',
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: 'Order Payment',
                  price: total.toString(), // Convert to string
                  currency: 'USD',
                  quantity: 1,
                },
              ],
            },
            amount: {
              currency: 'USD',
              total: total.toString(), // Convert to string
            },
            description: 'Payment for order',
          },
        ],
      };
  
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          console.error('Create Payment Error:', error);
          res.status(500).json({ error: 'Error creating PayPal payment' });
        } else {
          console.log('Create Payment Response:', payment);
          res.json({ paypalUrl: payment.links[1].href });
        }
      });
    } catch (error) {
      console.error('Error processing PayPal request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get("/success", (req, res) => {
    const PayerID = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: "1.00" // This needs to be adjusted according to your actual payment amount
                }
            }
        ]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
        }
    });
});

// Define route for order successful page
app.get("/order-success", (req, res) => {
  res.json({ success: true });  // Render the order successful page
});

app.get("cancel", (req, res) => {
    res.render("cancel");
});

app.listen(3000, () => {
    console.log("Server is running");
});
