import express from 'express';
import TrackController from './controllers/Track';

const routes = express.Router();

const trackController = new TrackController();

routes.get('/track/:trackCode', trackController.track);

export default routes;