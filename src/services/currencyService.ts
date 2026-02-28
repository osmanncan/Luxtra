export const CurrencyService = {
    
    getRates: async (baseCurrency: string = 'TRY'): Promise<Record<string, number> | null> => {
        try {
            
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
    convertAmount: async (amount: number, fromCurrency: string, toCurrency: string): Promise<number> => {
        if (fromCurrency === toCurrency) return amount;

        const rates = await CurrencyService.getRates(fromCurrency);
        if (rates && rates[toCurrency]) {
            return amount * rates[toCurrency];
        }
        return amount;
    }
};

