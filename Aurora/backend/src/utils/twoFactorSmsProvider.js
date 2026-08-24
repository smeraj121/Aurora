// src/utils/twoFactorSmsProvider.js
const axios = require('axios'); // npm install axios if not already present

class TwoFactorSmsProvider {
  constructor() {
    this.apiKey = process.env.TWO_FACTOR_API_KEY;
    if (!this.apiKey) {
      throw new Error('TWO_FACTOR_API_KEY is not configured.');
    }
  }

  async sendOtp(phone, otp) {
    try {
      // 2Factor's OTP API sends its own OTP by default; AUTOGEN2 lets you pass yours
      // so it matches the one already stored by your otp.service.js
      const url = `https://2factor.in/API/V1/${this.apiKey}/SMS/${phone}/${otp}`;
      const response = await axios.get(url);

      if (response.data?.Status !== 'Success') {
        throw new Error(response.data?.Details || 'SMS provider returned failure');
      }

      return { success: true, message: 'OTP sent' };
    } catch (err) {
      // Don't leak provider error details to the client — log server-side instead
      console.error('SMS send failed:', err.message);
      throw new Error('Failed to send OTP. Please try again.');
    }
  }
}

module.exports = TwoFactorSmsProvider;