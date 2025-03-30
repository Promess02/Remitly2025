# SWIFT Code Application

This application provides an API to manage and retrieve bank information using SWIFT codes. It is built with Node.js, Express, and SQLite.

---

## Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

---

## Setup and Run the Application

1. Clone the repository:
    ```bash
    git clone https://github.com/Promess02/Remitly2025.git
    cd Remitly2025
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the application:
    ```bash
    node server.js
    ```
4. Access the app at [http://localhost:8080](http://localhost:8080)

---

## Run the Application in Docker
0. If you installed dependencies with "npm i", then you need to delete node_modules and package-lock.json to run
1. Run docker daemon
2. Build the Docker image:
    ```bash
    docker build -f app.dockerfile -t swift-app .
    ```
3. Run the Docker container:
    ```bash
    docker run -p 8080:8080 swift-app
    ```
4. Access the app at [http://localhost:8080](http://localhost:8080)

---

## Run Tests

1. Install dependencies:
    ```bash
    npm install --save-dev mocha chai supertest
    ```
2. Run tests:
    ```bash
    npx mocha test/APIHandler.test.mjs
    ```

---

## API Endpoints

### 1. Get Bank by SWIFT Code
- **URL:** `/v1/swift-codes/:code`
- **Method:** `GET`
- **Description:** Retrieves a bank by its SWIFT code.
- **Response:**
  ```json
  {
     "swiftCode": "BANKUSXXX",
     "bankName": "US Bank",
     "countryISO2": "US",
     "countryName": "United States",
     "address": "123 US St",
     "isHeadquarter": true,
     "branches": []
  }
  ```

### 2. Get Banks by Country
- **URL:** `/v1/swift-codes/country/:countryISO2code`
- **Method:** `GET`
- **Description:** Retrieves all banks in a specific country.
- **Response:**
  ```json
  {
     "countryISO2": "US",
     "countryName": "United States",
     "swiftCodes": [
        {
          "swiftCode": "BANKUSXXX",
          "bankName": "US Bank",
          "address": "123 US St",
          "isHeadquarter": true
        }
     ]
  }
  ```

### 3. Add a Bank
- **URL:** `/v1/swift-codes`
- **Method:** `POST`
- **Description:** Adds a new bank.
- **Request Body:**
  ```json
  {
     "swiftCode": "NEWBANKXXX",
     "bankName": "New Bank",
     "countryISO2": "US",
     "countryName": "United States",
     "address": "789 New St"
  }
  ```
- **Response:**
  ```json
  {
     "message": "Bank added successfully."
  }
  ```

### 4. Delete a Bank
- **URL:** `/v1/swift-codes/:code`
- **Method:** `DELETE`
- **Description:** Deletes a bank by its SWIFT code.
- **Response:**
  ```json
  {
     "message": "Bank deleted successfully."
  }
  ```
