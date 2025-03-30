import sqlite3 from 'sqlite3';
sqlite3.verbose();

class BankDAO {

    constructor(db) {
        this.db = db;
    }

    getBank(swiftCode) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM Bank WHERE swiftCode = ?`;
            this.db.get(query, [swiftCode], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    resolve({ message: 'Bank not found.' });
                } else {
                    const bank = {
                        address: row.address,
                        bankName: row.bankName,
                        countryISO2: row.countryISO2,
                        countryName: row.countryName,
                        isHeadquarter: row.swiftCode.endsWith("XXX"),
                        swiftCode: row.swiftCode,
                        branches: []
                    };

                    if (bank.isHeadquarter) {
                        const branchQuery = `SELECT * FROM Bank WHERE SUBSTR(swiftCode, 1, 8) = ? AND swiftCode != ?`;
                        this.db.all(branchQuery, [row.swiftCode.substring(0, 8), row.swiftCode], (err, branches) => {
                            if (err) {
                                reject(err);
                            } else {
                                bank.branches = branches.map(branch => ({
                                    address: branch.address,
                                    bankName: branch.bankName,
                                    countryISO2: branch.countryISO2,
                                    isHeadquarter: branch.swiftCode.endsWith("XXX"),
                                    swiftCode: branch.swiftCode
                                }));
                                resolve(bank);
                            }
                        });
                    } else {
                        const branch = {
                            address: row.address,
                            bankName: row.bankName,
                            countryISO2: row.countryISO2,
                            countryName: row.countryName,
                            isHeadquarter: row.swiftCode.endsWith("XXX"),
                            swiftCode: row.swiftCode
                        }
                        resolve(branch);
                    }
                }
            });
        });
    }
    

    getBanksByCountry(countryISO2) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM Bank WHERE countryISO2 = ?`;
            this.db.all(query, [countryISO2], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                if (rows.length > 0) {
                    const response = {
                        countryISO2: countryISO2,
                        countryName: rows[0].countryName,
                        swiftCodes: rows.map(row => ({
                            address: row.address,
                            bankName: row.bankName,
                            countryISO2: row.countryISO2,
                            isHeadquarter: row.swiftCode.endsWith("XXX"),
                            swiftCode: row.swiftCode
                        }))
                    };
                    resolve(response);
                } else {
                    resolve({ message: 'No banks found for the given country.' });
                }
            }
            });
        });
    }

    addBank(swiftCode, bankName, countryISO2, countryName,  address, codeType, townName, timeZone) {
        return new Promise((resolve, reject) => {
            const idQuery = `SELECT MAX(id) as maxId FROM Bank`;
            this.db.get(idQuery, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    const newId = (row.maxId || 0) + 1;
                    const query = `INSERT INTO Bank (id, swiftCode, bankName, countryISO2, countryName, address, codeType, townName, timeZone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    this.db.run(query, [newId, swiftCode, bankName, countryISO2, countryName, address, codeType, townName, timeZone], function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ message: 'Bank added successfully.' });
                        }
                    });
                }
            });
        });
    }

    deleteBank(swiftCode) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM Bank WHERE swiftCode = ?`;
            this.db.run(query, [swiftCode], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ message: 'Bank deleted successfully.' });
                }
            });
        });
    }
}

export default BankDAO;
