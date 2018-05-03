const SmsTransaction = require("../../models/sms-transaction");
const Organization = require('../../models/organization')

async function createSmsTransaction(opts) {
  // add Organization -pricing here
  let charge = -parseFloat(opts.charge);
  
  // add a margin of 44%.

  if(opts.currency === 'MXN'){
    const ratio = parseFloat(process.env.MXN_CURRENCY_RATIO || 0.0448110)
    charge = charge * 5.156
    charge = charge * ratio
  }
  else charge = charge*1.44;  

  const organization = await Organization.findById(opts.organization_id);
  const discount = organization.smsDiscount || 0; // this is 0.00-1.00

  charge = charge - (discount * charge)

  await SmsTransaction.create({
    organization_id: opts.organization_id,
    charge,
    details: { transactionType: "SMS", meta: { message_id: opts.messageId } }
  });
}

module.exports = { createSmsTransaction };
