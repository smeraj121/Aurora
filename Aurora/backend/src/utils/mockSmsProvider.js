class MockSmsProvider {
  async sendOtp(phone, otp) {
    console.log('==============================');
    console.log(`OTP for ${phone}: ${otp}`);
    console.log('==============================');

    return {
      success: true,
      message: 'OTP sent (mock)',
    };
  }
}

module.exports = MockSmsProvider;