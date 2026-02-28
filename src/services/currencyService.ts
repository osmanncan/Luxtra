export const CurrencyService = {
    /**
     * Fetches the latest exchange rates for a given base currency.
     * Using a free open API that doesn't require an API key.
     */
    getRates: async (baseCurrency: string = 'TRY'): Promise<Record<string, number> | null> => {
        try {
            // open.er-api.com returns daily updated exchange rates for free without an API key
            const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
            const data = await response.json();

            if (data && data.result === 'success') {
                return data.rates;
            }
            return null;
        } catch (error) {
            console.error('Error fetching currency rates:', error);
            return null;
        }
    },

    /**
     * Converts a given amount from one currency to another using live rates.
     */
    convertAmount: async (amount: number, fromCurrency: string, toCurrency: string): Promise<number> => {
        if (fromCurrency === toCurrency) return amount;

        const rates = await CurrencyService.getRates(fromCurrency);
        if (rates && rates[toCurrency]) {
            return amount * rates[toCurrency];
        }

        // Fallback if API fails (just return the original amount to prevent app crash/data loss)
        return amount;
    }
};

