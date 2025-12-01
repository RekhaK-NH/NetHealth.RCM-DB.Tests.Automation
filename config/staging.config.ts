export default {
  name: 'Staging',
  baseURL: process.env.STAGING_BASE_URL || 'https://staging-rcm-db.nethealth.com',
  apiURL: process.env.STAGING_API_URL || 'https://api-staging-rcm-db.nethealth.com',
  timeout: 30000,
  retries: 2,
  users: {
    defaultUser: {
      username: process.env.STAGING_USER || 'testuser@nethealth.com',
      password: process.env.STAGING_PASS || '',
    },
    admin: {
      username: process.env.STAGING_ADMIN_USER || 'admin@nethealth.com',
      password: process.env.STAGING_ADMIN_PASS || '',
    },
  },
};
