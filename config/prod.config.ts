export default {
  name: 'Production',
  baseURL: process.env.PROD_BASE_URL || 'https://rcm-db.nethealth.com',
  apiURL: process.env.PROD_API_URL || 'https://api-rcm-db.nethealth.com',
  timeout: 30000,
  retries: 3,
  users: {
    defaultUser: {
      username: process.env.PROD_USER || '',
      password: process.env.PROD_PASS || '',
    },
    admin: {
      username: process.env.PROD_ADMIN_USER || '',
      password: process.env.PROD_ADMIN_PASS || '',
    },
  },
};
