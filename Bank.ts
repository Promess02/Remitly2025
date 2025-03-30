interface Bank {
    address?: string;
    bankName?: string;
    countryISO2?: string;
    countryName?: string;
    isHeadquarter?: boolean;
    swiftCode?: string;
    branches?: Bank[];
}

export default Bank;

