import cheerio from 'cheerio';
import axios from 'axios';
import iconv from 'iconv-lite';
import { isValidTrackCode } from '../utils/validations';
// import fs from 'fs';

interface Event {
  date: string;
  hour: string;
  local: string;
  status: string;
  description: string;
}

async function trackObject(trackCode: string) {
  if (!isValidTrackCode(trackCode)) return { message: "Track code is invalid." }

  try {
    const html = await getHtmlPage(trackCode);
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

  const response = await axios({
    method: 'POST',
    url: trackUrl,
    data: params,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    responseType: 'arraybuffer'
  });

  return iconv.decode(Buffer.from(response.data), "iso-8859-1");
}

function extractHTML(html: string) {
  const $ = cheerio.load(html);

  const tables = $(".listEvent").toArray(); //get .listEvent elements in DOM

  const logs = tables.map(table => {
    const data = new Array();

    const dtEvents = $(table) //get and format .sroDtEvent element in DOM
      .find('.sroDtEvent')
      .text()
      .replace(/[\n\r\t]/g, '')
      .split(/\s\s+/g)

    data.push(dtEvents);

    const lbEvents = $(table).find('.sroLbEvent'); //get .sroLbEvent element in DOM

    const title = $(lbEvents).find('strong').text(); //get event title
    data.push(title);

    $(lbEvents).find('strong').remove(); //remove strong element from sroLbEvent

    const description = $(lbEvents) //get and format event description
      .text()
      .replace(/[\n\r\t]/g, '')
      .trim()

    data.push(description)

    return data;
  })

  return logs;
}

function parseToJson(logs: any) {
  const events = logs.map((log: any) => {
    const dateHour = log[0][0].split(' ');
    const date = dateHour[0];
    const hour = dateHour[1];
    const local = log[0][1];
    const status = log[1];
    const description = log[2] ? log[2].split('.')[0] : null;

    return {
      date,
      hour,
      status,
      local,
      description
    };
  });

  return events;
}

export { trackObject };