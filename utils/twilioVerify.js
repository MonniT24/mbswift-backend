const twilio =
  require("twilio");

const client =
  twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

async function sendPhoneOtp(phone){

  return await client.verify.v2
    .services(
      process.env.TWILIO_VERIFY_SERVICE_SID
    )
    .verifications
    .create({
      to:phone,
      channel:"sms"
    });
}

async function checkPhoneOtp(phone,code){

  return await client.verify.v2
    .services(
      process.env.TWILIO_VERIFY_SERVICE_SID
    )
    .verificationChecks
    .create({
      to:phone,
      code:code
    });
}

module.exports = {
  sendPhoneOtp,
  checkPhoneOtp
};