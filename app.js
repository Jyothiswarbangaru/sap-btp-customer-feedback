const express = require('express');
const hana = require('@sap/hana-client');

const app = express();
app.use(express.json());

const hanaConfig = {
  serverNode: process.env.HANA_SERVER,
  uid: process.env.HANA_USER,
  pwd: process.env.HANA_PASSWORD,
  encrypt: 'true'
};

// Endpoint to submit feedback
app.post('/feedback', (req, res) => {
  const { customerName, feedback } = req.body;
  const conn = hana.createConnection();

  conn.connect(hanaConfig, (err) => {
    if (err) {
      return res.status(500).send('Database connection error');
    }
    conn.exec(
      `INSERT INTO FEEDBACK (CUSTOMER_NAME, FEEDBACK_TEXT) VALUES (?, ?)`,
      [customerName, feedback],
      (err) => {
        conn.disconnect();
        if (err) {
          return res.status(500).send('Error inserting feedback');
        }
        res.send('Feedback submitted successfully');
      }
    );
  });
});

// Endpoint to retrieve feedback
app.get('/feedback', (req, res) => {
  const conn = hana.createConnection();
  conn.connect(hanaConfig, (err) => {
    if (err) {
      return res.status(500).send('Database connection error');
    }
    conn.exec('SELECT * FROM FEEDBACK', [], (err, rows) => {
      conn.disconnect();
      if (err) {
        return res.status(500).send('Error fetching feedback');
      }
      res.json(rows);
    });
  });
});

app.listen(3000, () => {
  console.log('Customer Feedback API listening on port 3000');
});