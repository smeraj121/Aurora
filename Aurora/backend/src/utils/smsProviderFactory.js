// src/utils/smsProviderFactory.js
const MockSmsProvider = require('./mockSmsProvider');
const TwoFactorSmsProvider = require('./twoFactorSmsProvider');

function createSmsProvider() {
  const provider = process.env.SMS_PROVIDER || 'mock';

  switch (provider) {
    case 'twofactor':
      return new TwoFactorSmsProvider();
    case 'mock':
    default:
      return new MockSmsProvider();
  }
}

module.exports = createSmsProvider;