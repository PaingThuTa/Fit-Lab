const path = require('path');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const PORT = Number(process.env.PORT || 5000);

function startServer() {
  app.listen(PORT, () => {
    console.log(`API server ready on port ${PORT}`);
  });
}

startServer();
