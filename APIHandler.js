import express from 'express';
import BankDAO from './BankDAO.js';
import sqlite3 from 'sqlite3';

const router = express.Router();

const db = new sqlite3.Database("bankApp.db", (err) => {
    if (err) {
        console.error(`Failed to connect to database: ${err.message}`);
    } else {
        console.log('Connected to the database.');
    }
});
const bankDAO = new BankDAO(db);

router.get('/v1/swift-codes/:code', async (req, res) => {
    const swiftCode = req.params['code'];
    try {
        const result = await bankDAO.getBank(swiftCode);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/v1/swift-codes/country/:countryISO2code', async (req, res) => {
    const countryISO2code = req.params['countryISO2code'];
    try {
        const result = await bankDAO.getBanksByCountry(countryISO2code);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/v1/swift-codes', async (req, res) => {
    const { swiftCode, bankName, countryISO2, countryName, address, codeType, isHeadquarter, townName, timeZone } = req.body;
    try {
        const result = await bankDAO.addBank(swiftCode, bankName, countryISO2, countryName, address,  codeType, townName, timeZone );
        res.status(201).json(result);
    } catch (error) {
        console.error('Error adding data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/v1/swift-codes/:code', async (req, res) => {
    const swiftCode = req.params['code'];
    try {
        const result = await bankDAO.deleteBank(swiftCode);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;