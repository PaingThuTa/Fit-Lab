const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
  app.listen(PORT, () => {
    console.log(`API server ready on port ${PORT}`);
  });
}

startServer();
