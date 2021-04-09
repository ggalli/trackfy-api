import express from 'express';
import cors from 'cors';
import TrackController from './controllers/Track';

const trackController = new TrackController();

const app = express();
const port = 3333;

app.use(cors());
app.use(express.json());

app.get('/track/:trackCode', trackController.track);

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));

module.exports = trackController.track;