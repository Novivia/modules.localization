//FIXME: Use https://github.com/jsor/locale-data instead
import currencies from "world-currencies";

const newCurrencies = Object.keys(currencies).reduce(
  (newCurrencies, currencyCCA3) => {
    const currency = currencies[currencyCCA3];

    newCurrencies[currencyCCA3] = {
      currency: {
        currency.iso.code,
      },
    };

    return newCurrencies;
  },
  {},
);

console.log("currencIES", newCurrencies);
