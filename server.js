import express from 'express';
import cors from 'cors';
import apiHandler from './APIHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use(apiHandler);

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});