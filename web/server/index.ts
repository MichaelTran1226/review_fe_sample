import { app } from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Keystone CRM API server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoints available at http://localhost:${PORT}/api/v1`);
});
