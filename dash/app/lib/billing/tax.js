const _ = require('lodash');

const EU_TAX_RATES = [
  {code: 'AT', taxPercent: 20},
  {code: 'BE', taxPercent: 21},
  {code: 'BG', taxPercent: 20},
  {code: 'HR', taxPercent: 25},
  {code: 'CY', taxPercent: 19},
  {code: 'CZ', taxPercent: 21},
  {code: 'DK', taxPercent: 25},
  {code: 'EE', taxPercent: 20},
  {code: 'FI', taxPercent: 24},
  {code: 'FR', taxPercent: 20},
  {code: 'DE', taxPercent: 19},
  {code: 'EL', taxPercent: 24},
  {code: 'HU', taxPercent: 27},
  {code: 'IE', taxPercent: 23},
  {code: 'IT', taxPercent: 22},
  {code: 'LV', taxPercent: 21},
  {code: 'LT', taxPercent: 21},
  {code: 'LU', taxPercent: 17},
  {code: 'MT', taxPercent: 18},
  {code: 'NL', taxPercent: 21},
  {code: 'PL', taxPercent: 23},
  {code: 'PT', taxPercent: 23},
  {code: 'RO', taxPercent: 19},
  {code: 'SK', taxPercent: 20},
  {code: 'SI', taxPercent: 22},
  {code: 'ES', taxPercent: 21},
  {code: 'SE', taxPercent: 25},
  {code: 'UK', taxPercent: 20},
  ];

  function getTaxRate(country, vatId, organizationSize){
    
    const countryTax = _.find(EU_TAX_RATES, {code: country});
    if(!countryTax) return 0; // Country not in EU

    if(vatId && vatId.length > 0 && country !== "FI") return 0;
    if(organizationSize === "PRIVATE_PERSON") return countryTax.taxPercent;
    if(country == "FI") return countryTax.taxPercent;
    else return countryTax.taxPercent;

  }

  module.exports = { getTaxRate }