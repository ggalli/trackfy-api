import express from 'express';
import TrackController from './controllers/Track';

const trackController = new TrackController();

const app = express();
const port = process.env.PORT || 3333;

app.use(express.json());

app.get('/track/:trackCode', trackController.track);

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));

export default app;