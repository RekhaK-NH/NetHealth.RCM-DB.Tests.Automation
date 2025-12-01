export default {
  name: 'Development - RCM Direct Billing',
  baseURL: process.env.DEV_BASE_URL || 'https://basereg.therapy.nethealth.com',
  loginURL: process.env.DEV_LOGIN_URL || 'https://basereg.therapy.nethealth.com/Login/',
  apiURL: process.env.DEV_API_URL || 'https://api-dev-rcm-db.nethealth.com',
  timeout: 30000,
  retries: 1,
  users: {
    defaultUser: {
      username: process.env.DEV_USER || 'Optima.RambabuN',
      password: process.env.DEV_PASS || 'Password@123',
      role: 'Standard User',
    },
    admin: {
      username: process.env.DEV_ADMIN_USER || 'admin@nethealth.com',
      password: process.env.DEV_ADMIN_PASS || '',
      role: 'Administrator',
    },
    billing: {
      username: process.env.DEV_BILLING_USER || 'billing.user@nethealth.com',
      password: process.env.DEV_BILLING_PASS || '',
      role: 'Billing Specialist',
    },
  },
  modules: {
    patients: {
      enabled: true,
      endpoint: '/Financials#/patient/search',
    },
    revenue: {
      enabled: true,
      postCharges: '/Financials#/revenue/revenue',
      quickClaims: '/Financials#/revenue/quickclaims',
    },
    claims: {
      enabled: true,
      search: '/Financials#/claims/search',
      createClaims: '/Financials#/claims/generation',
      batchClaims: '/Financials#/claims/batch',
      manageBatches: '/Financials#/claims/managebatches',
      frpStatements: '/Financials#/claims/frp',
    },
  },
};
