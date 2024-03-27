const express = require('express');
const bodyParser = require('body-parser');
const africastalking = require('africastalking');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const africastalkingConfig = {
  apiKey: '80b200282bbe8634c9c92ae89c747e05fa817bdc0000dd682a183adb28c638ec',
  username: 'airtimeapi',
};

const africastalkingClient = new africastalking(africastalkingConfig);
const sms = africastalkingClient.SMS;

// Define seed types and prices
const seedTypes = {
    maize: { pricePerKg: 10 },
    tomatoes: { pricePerGram: 0.007 }, // Adjusted price for tomatoes (per gram)
    beans: { pricePerKg: 8 },
};

// Define farming tips
const farmingTips = {
    soilPreparation: [
        'Till the soil to improve aeration and drainage.',
        'Incorporate organic matter like compost or manure to enrich the soil.',
        'Test the soil pH and adjust as needed for your crop.',
        'Prepare raised beds or ridges to improve drainage and root growth.',
    ],
    pestControl: [
        'Use natural pesticides like neem oil, garlic, or pepper spray.',
        'Encourage beneficial insects like ladybugs and lacewings.',
        'Practice crop rotation to disrupt pest life cycles.',
        'Remove and destroy infected plant parts to prevent spread.',
    ],
    irrigation: [
        'Use drip irrigation to conserve water and minimize evaporation.',
        'Water deeply and infrequently to encourage deep root growth.',
        'Mulch around plants to retain soil moisture.',
        'Consider using a timer or moisture sensor for efficient watering.',
    ],
};

// User balance
let userBalance = 1000; // Initial balance (replace with your logic)

// Define USSD session handlers
const ussdMenu = {
      text: 'CON Welcome to Farm Whisperer\n1. Check Balance\n2. Order Seeds\n3. Get Farming Tips',
      run: (sessionId, phoneNumber, text, callback) => {
            let response = '';
            switch (text) {
                  case '':
                  case '*':
                        response = 'CON Welcome to Farm Whisper USSD App\n';
                        response += '1. Check Balance\n';
                        response += '2. Order Seeds\n';
                        response += '3. Get Farming Tips';
                        break;
                  case '1':
                        response = `END Your balance is Ksh${userBalance.toFixed(2)}`;
                        break;
                  case '2':
                        response = 'CON Choose seed type:\n1. Maize\n2. Tomatoes\n3. Beans';
                        break;
                  case '2*1':
                        response = 'CON Enter quantity of maize seeds (in kg): \n 1. 2kg\n 2. 4kg\n 3. 10kg\n 4. 20kg\n 5. 30kg';
                        break;
                  case '2*2':
                        response = 'CON Enter quantity of tomato seeds (in grams): (Note: 1 gram = 0.001 kg)\n 1. 1000g\n 2. 2000g\n 3. 3000g\n 4. 4000g\n 5. 10000g';
                        break;
                  case '2*3':
                        response = 'CON Enter quantity of bean seeds (in kg):\n 1. 2kg\n 2. 4kg\n 3. 10kg\n 4. 20kg\n 5. 30kg';
                        break;
                  case '2*1*1': 
                  case '2*1*2':
                  case '2*1*3':
                  case '2*1*4':
                  case '2*1*5':
                    handleSeedOrder(sessionId, phoneNumber, text, 'maize', seedTypes.maize.pricePerKg, callback);
                    break;
                  case '2*2*1':
                  case '2*2*2':
                  case '2*2*3':
                  case '2*2*4':
                  case '2*2*5':
                    handleSeedOrder(sessionId, phoneNumber, text, 'tomatoes', seedTypes.tomatoes.pricePerGram, callback);
                    break;
                  case '2*3*1':
                  case '2*3*2':
                  case '2*3*3':
                  case '2*3*4':
                  case '2*3*5':
                    handleSeedOrder(sessionId, phoneNumber, text, 'beans', seedTypes.beans.pricePerKg, callback);
                    break;

                  case '2*1*1*1':
                  case '2*1*1*2':
                  case '2*1*2*1': 
                  case '2*1*2*2':
                  case '2*1*3*1':
                  case '2*1*3*2':
                  case '2*1*4*1':
                  case '2*1*4*2':
                  case '2*1*5*1':
                  case '2*1*5*2':
                    handleOrderConfirmation(sessionId, phoneNumber, text, 'maize', seedTypes.maize.pricePerKg, callback);
                    break;
                  case '2*2*1*1':
                  case '2*2*2*2':
                  case '2*2*3*1':
                  case '2*2*3*2':
                  case '2*2*4*1':
                  case '2*2*4*2':
                  case '2*2*5*1':
                  case '2*2*5*2':
                    handleOrderConfirmation(sessionId, phoneNumber, text, 'tomatoes', seedTypes.tomatoes.pricePerGram, callback);
                    break;
                    case '2*3*1*1':
                    case '2*3*2*2':
                    case '2*3*3*1':
                    case '2*3*3*2':
                    case '2*3*4*1':
                    case '2*3*4*2':
                    case '2*3*5*1':
                    case '2*3*5*2':
                    handleOrderConfirmation(sessionId, phoneNumber, text, 'beans', seedTypes.beans.pricePerKg, callback);
                    break;
                    case '3':
                        response = 'CON Choose a farming tip:\n1. Soil Preparation\n2. Pest Control\n3. Irrigation';
                        break;
                    case '3*1':
                        sendFarmingTips(phoneNumber, 'Soil Preparation Tips', farmingTips.soilPreparation.join('\n'), callback);
                        break;
                    case '3*2':
                        sendFarmingTips(phoneNumber, 'Pest Control Tips', farmingTips.pestControl.join('\n'), callback);
                        break;
                    case '3*3':
                        sendFarmingTips(phoneNumber, 'Irrigation Tips', farmingTips.irrigation.join('\n'), callback);
                        break;
                    default:
                        response = 'END Invalid input. Please try again.';
        }
        callback(null, response);
    },
};

// Handle incoming USSD requests
app.post('/ussd', (req, res) => {
    const { sessionId, phoneNumber, text, serviceCode } = req.body;
    ussdMenu.run(sessionId, phoneNumber, text, (error, response) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).send('An error occurred.');
        } else {
            res.send(response);
        }
    });
});

// Handle seed order
function handleSeedOrder(sessionId, phoneNumber, text, seedType, price, callback) {
  const quantityStr = text.split(`*`).pop(); // Extract quantity string from text
  const quantity = parseFloat(quantityStr);
  if (isNaN(quantity)) {
      callback(null, 'END Invalid quantity. Please try again.');
  } else {
      const orderTotal = quantity * price;
      if (orderTotal > userBalance) {
          callback(null, 'END Insufficient balance. Please top up your account.');
      } else {
          let unit = 'kg';
          if (seedType === 'tomatoes') {
              unit = 'g';
          }
          const orderSummary = `CON Order Summary:\n${seedType.charAt(0).toUpperCase() + seedType.slice(1)} Seeds: ${quantity} ${unit}\nTotal: Ksh${orderTotal.toFixed(2)}\n\n1. Confirm Order\n2. Cancel Order`;
          callback(null, orderSummary);
          sendSMS(phoneNumber, `Order Summary:\n${seedType.charAt(0).toUpperCase() + seedType.slice(1)} Seeds: ${quantity} ${unit}\nTotal: Ksh${orderTotal.toFixed(2)}\n\nReply with '1' to confirm or '2' to cancel.`);

      }
  }
}


// Function to handle order confirmation
function handleOrderConfirmation(sessionId, phoneNumber, text, seedType, price, callback) {
    const quantity = parseFloat(text.split(`*`)[2], 10);
    const orderTotal = quantity * price;
    userBalance -= orderTotal;

    const orderDetails = `Thank you for your order!\n\nOrder Details:\n${seedType.charAt(0).toUpperCase() + seedType.slice(1)} Seeds: ${quantity} ${seedType === 'tomatoes' ? 'g' : 'kg'}\nTotal: $${orderTotal.toFixed(2)}\n\nYour new balance is $${userBalance.toFixed(2)}.`;

    callback(null, `END ${orderDetails}`);
    // Send SMS notification with order details and new balance

    sendSMS(phoneNumber, orderDetails);
}

// Function to send farming tips
function sendFarmingTips(phoneNumber, topic, tips, callback) {
    const message = `END ${topic}:\n${tips}\n\n*More tips available on our website*`;
    callback(null, message);
    // Send SMS notification with farming tips
    sendSMS(phoneNumber, `${topic}:\n${tips}`);
}

// Send SMS notification
function sendSMS(to, message) {
    const options = {
        to: [to],
        message: message,
    };

    sms.send(options)
        .then(response => {
            console.log('SMS sent successfully:', response);
        })
        .catch(error => {
            console.error('Error sending SMS:', error);
        });
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});