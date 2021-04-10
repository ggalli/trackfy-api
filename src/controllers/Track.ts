import { Request, Response } from 'express';
import { trackObject } from '../services/scrap';

export default class TrackController {
	async track(req: Request, res: Response) {
		const { trackCode } = req.params;

		const result = await trackObject(trackCode);
		const { ok, data, message } = result;

		if (ok && data && data.length > 0) {
			return res.status(200).json(data);
		}
		else if (message) {
			return res.status(400).json({ error: message });
		}
		else {
			return res.status(404).end();
		}
	}
}