import { expect } from 'chai';
import sqlite3 from 'sqlite3';
import BankDAO from '../BankDAO.js';

// Setup an in-memory database for testing
const TEST_DB = ':memory:';

describe('BankDAO', function () {
    let bankDAO;

    const db = new sqlite3.Database(TEST_DB, (err) => {
        if (err) {
            console.error(`Failed to connect to database: ${err.message}`);
        } else {
            console.log('Connected to the database.');
        }
    });

    before((done) => {
        bankDAO = new BankDAO(db);
        bankDAO.db.serialize(() => {
            bankDAO.db.run(`CREATE TABLE Bank (
                id INTEGER PRIMARY KEY,
                swiftCode TEXT UNIQUE,
                bankName TEXT,
                countryISO2 TEXT,
                countryName TEXT,
                address TEXT,
                codeType TEXT,
                townName TEXT,
                timeZone TEXT
            )`, done);
        });
    });

    after((done) => {
        bankDAO.db.close(done);
    });

    beforeEach((done) => {
        bankDAO.db.run(`DELETE FROM Bank`, done);
    });

    it('should add a bank', async function () {
        const response = await bankDAO.addBank(
            'TESTCODEXXX', 'Test Bank', 'US', 'United States', '123 Test St', 'BIC11', 'New York', 'America/New_York'
        );
        expect(response).to.have.property('message', 'Bank added successfully.');
    });

    it('should retrieve a bank by SWIFT code', async function () {
        await bankDAO.addBank('TESTCODEXXX', 'Test Bank', 'US', 'United States', '123 Test St', 'BIC11', 'New York', 'America/New_York');
        const bank = await bankDAO.getBank('TESTCODEXXX');
        expect(bank).to.be.an('object');
        expect(bank).to.have.property('swiftCode', 'TESTCODEXXX');
        expect(bank).to.have.property('isHeadquarter', true);
    });

    it('should return a message if the bank is not found', async function () {
        const bank = await bankDAO.getBank('NONEXISTENT');
        expect(bank).to.have.property('message', 'Bank not found.');
    });

    it('should retrieve banks by country', async function () {
        await bankDAO.addBank('BANKUSXXX', 'US Bank', 'US', 'United States', '123 US St', 'BIC11', 'Los Angeles', 'America/Los_Angeles');
        await bankDAO.addBank('BANKUKXXX', 'UK Bank', 'UK', 'United Kingdom', '456 UK St', 'BIC11', 'London', 'Europe/London');
        
        const banks = await bankDAO.getBanksByCountry('US');
        expect(banks).to.be.an('object');
        expect(banks.countryISO2).to.equal('US');
        expect(banks.swiftCodes).to.have.lengthOf(1);
        expect(banks.swiftCodes[0].swiftCode).to.equal('BANKUSXXX');
    });

    it('should retrieve a headquarter bank with its branch banks correctly without beforeEach setup', async function () {
        // Insert a headquarter bank
        await db.run(`
            INSERT INTO Bank (countryISO2, swiftCode, codeType, bankName, address, townName, countryName, timeZone) 
            VALUES ('US', 'HEADUS33XXX', 'BIC11', 'Headquarter Bank', '123 Main St', 'New York', 'USA', 'America/New_York')
        `);

        // Insert branch banks
        await db.run(`
            INSERT INTO Bank (countryISO2, swiftCode, codeType, bankName, address, townName, countryName, timeZone) 
            VALUES ('US', 'HEADUS33ABC', 'BIC11', 'Branch 1', '456 Elm St', 'Los Angeles', 'USA', 'America/Los_Angeles')
        `);
        await db.run(`
            INSERT INTO Bank (countryISO2, swiftCode, codeType, bankName, address, townName, countryName, timeZone) 
            VALUES ('US', 'HEADUS33DEF', 'BIC11', 'Branch 2', '789 Pine St', 'Chicago', 'USA', 'America/Chicago')
        `);

        const result = await bankDAO.getBank('HEADUS33XXX');

        expect(result).to.be.an('object');
        expect(result.bankName).to.equal('Headquarter Bank');
        expect(result.isHeadquarter).to.be.true;
        expect(result.branches).to.be.an('array').with.lengthOf(2);

        const branchSwiftCodes = result.branches.map(branch => branch.swiftCode);
        expect(branchSwiftCodes).to.include('HEADUS33ABC');
        expect(branchSwiftCodes).to.include('HEADUS33DEF');
    });

    it('should return a message if no banks are found in a country', async function () {
        const banks = await bankDAO.getBanksByCountry('FR');
        expect(banks).to.have.property('message', 'No banks found for the given country.');
    });

    it('should delete a bank', async function () {
        await bankDAO.addBank('DELCODEXXX', 'Delete Bank', 'DE', 'Germany', '789 Del St', 'BIC11', 'Berlin', 'Europe/Berlin');
        const deleteResponse = await bankDAO.deleteBank('DELCODEXXX');
        expect(deleteResponse).to.have.property('message', 'Bank deleted successfully.');
        
        const bank = await bankDAO.getBank('DELCODEXXX');
        expect(bank).to.have.property('message', 'Bank not found.');
    });
});

describe('BankDAO Additional Tests', function () {
    let bankDAO;

    const db = new sqlite3.Database(TEST_DB, (err) => {
        if (err) {
            console.error(`Failed to connect to database: ${err.message}`);
        }
    });

    before((done) => {
        bankDAO = new BankDAO(db);
        bankDAO.db.serialize(() => {
            bankDAO.db.run(`CREATE TABLE Bank (
                id INTEGER PRIMARY KEY,
                swiftCode TEXT UNIQUE,
                bankName TEXT,
                countryISO2 TEXT,
                countryName TEXT,
                address TEXT,
                codeType TEXT,
                townName TEXT,
                timeZone TEXT
            )`, done);
        });
    });

    after((done) => {
        bankDAO.db.close(done);
    });

    beforeEach((done) => {
        bankDAO.db.run(`DELETE FROM Bank`, done);
    });

    it('should not allow adding a bank with a duplicate SWIFT code', async function () {
        await bankDAO.addBank('DUPLICATEXXX', 'Duplicate Bank', 'US', 'United States', '123 Duplicate St', 'BIC11', 'New York', 'America/New_York');
        try {
            await bankDAO.addBank('DUPLICATEXXX', 'Another Bank', 'US', 'United States', '456 Another St', 'BIC11', 'Los Angeles', 'America/Los_Angeles');
        } catch (err) {
            expect(err.message).to.include('SQLITE_CONSTRAINT');
        }
    });

    it('should handle invalid SWIFT code gracefully in getBank', async function () {
        const result = await bankDAO.getBank('');
        expect(result).to.have.property('message', 'Bank not found.');
    });

    it('should handle invalid countryISO2 gracefully in getBanksByCountry', async function () {
        const result = await bankDAO.getBanksByCountry('');
        expect(result).to.have.property('message', 'No banks found for the given country.');
    });

    it('should retrieve multiple banks for the same country', async function () {
        await bankDAO.addBank('BANKUSXXX', 'US Bank 1', 'US', 'United States', '123 US St', 'BIC11', 'New York', 'America/New_York');
        await bankDAO.addBank('BANKUSYYY', 'US Bank 2', 'US', 'United States', '456 US St', 'BIC11', 'Los Angeles', 'America/Los_Angeles');

        const banks = await bankDAO.getBanksByCountry('US');
        expect(banks).to.be.an('object');
        expect(banks.countryISO2).to.equal('US');
        expect(banks.swiftCodes).to.have.lengthOf(2);

        const swiftCodes = banks.swiftCodes.map(bank => bank.swiftCode);
        expect(swiftCodes).to.include('BANKUSXXX');
        expect(swiftCodes).to.include('BANKUSYYY');
    });

    it('should handle deleting a non-existent bank gracefully', async function () {
        const response = await bankDAO.deleteBank('NONEXISTENT');
        expect(response).to.have.property('message', 'Bank deleted successfully.');

        const bank = await bankDAO.getBank('NONEXISTENT');
        expect(bank).to.have.property('message', 'Bank not found.');
    });

    it('should retrieve a branch bank without branches', async function () {
        await bankDAO.addBank('BRANCHUSYYY', 'Branch Bank', 'US', 'United States', '789 Branch St', 'BIC11', 'Chicago', 'America/Chicago');

        const result = await bankDAO.getBank('BRANCHUSYYY');
        expect(result).to.be.an('object');
        expect(result.bankName).to.equal('Branch Bank');
        expect(result.isHeadquarter).to.be.false;
        expect(result).to.not.have.property('branches');
    });

    it('should handle a large number of banks efficiently', async function () {
        for (let i = 0; i < 1000; i++) {
            await bankDAO.addBank(`BANK${i}XXX`, `Bank ${i}`, 'US', 'United States', `${i} Test St`, 'BIC11', 'Test City', 'America/New_York');
        }

        const banks = await bankDAO.getBanksByCountry('US');
        expect(banks.swiftCodes).to.have.lengthOf(1000);
    });
});