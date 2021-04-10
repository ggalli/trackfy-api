import { Request, Response } from 'express';
import { trackObject } from '../services/scrap';

export default class TrackController {
	async track(req: Request, res: Response) {
		const { trackCode } = req.params;

		const result = await trackObject(trackCode);

		if (result.ok) {
			return res.status(200).json(result.data);
		}
		else if (result.message) {
			return res.status(400).json({ error: result.message });
		}
		else {
			return res.status(404).end();
		}
	}
}