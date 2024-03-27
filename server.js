const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Africa's Talking
const africastalking = require('africastalking')({
  apiKey: '80b200282bbe8634c9c92ae89c747e05fa817bdc0000dd682a183adb28c638ec',
  username: 'airtimeapi',
});

// Create a USSD object
const ussd = africastalking.USSD;

// Define USSD session handlers directly when creating the USSD menu
const ussdMenu = ussd({
  phoneNumber: 'YOUR_PHONE_NUMBER', // Replace with your phone number
  text: 'CON Welcome to My USSD App\n1. Check Balance\n2. Transfer Money', // Initial menu
  session: (sessionId, phoneNumber, text, callback) => {
    let response = '';

    // Parse input text and generate response
    switch (text) {
      case '':
      case '*':
        response = 'CON Welcome to My USSD App\n';
        response += '1. Check Balance\n';
        response += '2. Transfer Money';
        break;
      case '1':
        response = 'END Your balance is $100';
        break;
      case '2':
        response = 'CON Enter recipient phone number:';
        break;
      case '2*':
        response = 'CON Enter amount:';
        break;
      // Handle further steps of the transaction
      // Add more cases as needed
      default:
        response = 'END Invalid input. Please try again.';
    }

    callback(null, response);
  },
});

// Handle incoming USSD requests
app.post('/ussd', (req, res) => {
  const { sessionId, phoneNumber, text, serviceCode } = req.body;

  // Process USSD request using the USSD menu
  ussdMenu.run(sessionId, phoneNumber, text, (error, response) => {
    if (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred.');
    } else {
      res.send(response);
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});