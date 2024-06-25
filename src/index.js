const WebSocket = require('ws');
const axiosService = require('./services/axiosService');
const { config } = require('dotenv');
config();

const wss = new WebSocket.Server({ port: process.env.PORT || 5000 });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    if (JSON.parse(message) === 'trade') {
      try {
        // Fetch trade details from the lambda function
        const masterTrade = await axiosService(
          'https://pdzsl5xw2kwfmvauo5g77wok3q0yffpl.lambda-url.us-east-2.on.aws/',
        );

        // Use the MT4 API to replicate the trade
        const connectionId = await axiosService(
          'https://mt4.mtapi.io/Connect?user=44712225&password=tfkp48&host=18.209.126.198&port=443',
        );

        const tradeResponse = await axiosService(
          `https://mt4.mtapi.io/OrderSend?id=${connectionId}&symbol=${masterTrade.symbol}&operation=${masterTrade.operation}&volume=${masterTrade.volume}&takeprofit=${masterTrade.takeprofit}&comment=${masterTrade.comment}`,
        );

        // Send the replicated trade details back to the frontend
        ws.send(JSON.stringify(tradeResponse));
      } catch (error) {
        console.error('Error replicating trade:', error);
        ws.send(JSON.stringify({ error: 'Error replicating trade' }));
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.send('Connected to Backend...');
});

console.log(`WebSocket server is running on ${process.env.WEB_SOCKET_URL}`);
