const path = require('path');
const dotenv = require('dotenv');
const http = require('http');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
const app = require('./app');
const { registerSocketServer } = require('./socket');

const PORT = Number(process.env.PORT || 5000);

function startServer() {
  const httpServer = http.createServer(app);
  const io = registerSocketServer(httpServer);

  app.set('io', io);

  httpServer.listen(PORT, () => {
    console.log(`API server ready on port ${PORT}`);
  });
}

startServer();
