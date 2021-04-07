import cheerio from 'cheerio';
import axios from 'axios';
import iconv from 'iconv-lite';
import { isValidTrackCode } from '../utils/validations';
// import fs from 'fs';

interface Event {
	date: string;
	hour: string;
	description: string
	origin: object;
	destiny: object | null;
}

async function trackObject(trackCode: string) {
	if (!isValidTrackCode(trackCode)) return { message: "Track code is invalid." }

	try {
		const result = await getHtmlPage(trackCode);
		const html = iconv.decode(Buffer.from(result.data), "iso-8859-1");
		const extractedData = extractHTML(html);
		const parsedData = parseToJson(extractedData);
		return {
			ok: true,
			data: parsedData
		}
	}
	catch (error) {
		return { message: "Failed to track object." }
	}
	// MOCK
	// const data = fs.readFileSync('./rastreio.html', 'utf8');
}


async function getHtmlPage(trackCode: string) {
	const trackUrl = 'https://www2.correios.com.br/sistemas/rastreamento/resultado.cfm';

	const params = new URLSearchParams();
	params.append('objetos', trackCode);

	return await axios({
		method: 'POST',
		url: trackUrl,
		data: params,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		responseType: 'arraybuffer'
	});
}

function extractHTML(html: string) {
	const $ = cheerio.load(html);

	const tables = $(".listEvent").toArray(); //get .listEvent elements in DOM

	const logs = tables.map(table => {
		const data = new Array();
		const dtEvents = $(table)
			.find('.sroDtEvent')
			.text()
			.replace(/ \n/g, '|') //replace all whitespaces followed by line breaks to pipes
			.replace(/[\n\t]/g, '') //remove all remaining line breaks and tabs

		data.push(dtEvents);

		const lbEvents = $(table).find('.sroLbEvent'); //get .sroLbEvent element in DOM

		const title = $(lbEvents).find('strong').text(); //get event description
		data.push(title);

		const label = $(lbEvents)
			.text()
			.replace(/[\t\n]/g, "") //remove all tabs and line breaks
			.split('em')

		const destiny = label[label.length - 1]; //get last index of array

		if (destiny.includes('/')) {
			data.push(destiny.trim());
		}

		return data;
	})

	return logs;
}

function parseToJson(logs: any) {
	const events: Event[] = logs.map((log: any) => {
		const dtevents = log[0].split('|');
		const origin = dtevents[2].split('/');
		const destiny = log[2] ? log[2].split('/') : null;

		const destinyObj = destiny ?
			{
				city: destiny[0].trim(),
				state: destiny[1].trim()
			} : null;

		const event: Event = {
			date: dtevents[0],
			hour: dtevents[1].trim(),
			description: log[1],
			origin: {
				city: origin[0].trim(),
				state: origin[1].trim()
			},
			destiny: destinyObj
		};

		return event;
	});

	return events;
}

export { trackObject };