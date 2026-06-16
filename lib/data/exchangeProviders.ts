import { ExchangeProvider } from "@/lib/types";

export interface TravelCountry {
  code: string;
  name: string;
  currency: string;
  flag: string;
}

/** Destination countries travelers commonly exchange into */
export const travelCountries: TravelCountry[] = [
  { code: "TH", name: "Thailand", currency: "THB", flag: "🇹🇭" },
  { code: "JP", name: "Japan", currency: "JPY", flag: "🇯🇵" },
  { code: "US", name: "United States", currency: "USD", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { code: "EU", name: "Eurozone", currency: "EUR", flag: "🇪🇺" },
  { code: "AE", name: "UAE", currency: "AED", flag: "🇦🇪" },
  { code: "SG", name: "Singapore", currency: "SGD", flag: "🇸🇬" },
  { code: "AU", name: "Australia", currency: "AUD", flag: "🇦🇺" },
  { code: "HK", name: "Hong Kong", currency: "HKD", flag: "🇭🇰" },
  { code: "IN", name: "India", currency: "INR", flag: "🇮🇳" },
  { code: "KR", name: "South Korea", currency: "KRW", flag: "🇰🇷" },
  { code: "CH", name: "Switzerland", currency: "CHF", flag: "🇨🇭" },
  { code: "CA", name: "Canada", currency: "CAD", flag: "🇨🇦" },
  { code: "MX", name: "Mexico", currency: "MXN", flag: "🇲🇽" },
  { code: "BR", name: "Brazil", currency: "BRL", flag: "🇧🇷" },
  { code: "CN", name: "China", currency: "CNY", flag: "🇨🇳" },
  { code: "NZ", name: "New Zealand", currency: "NZD", flag: "🇳🇿" },
  { code: "SE", name: "Sweden", currency: "SEK", flag: "🇸🇪" },
  { code: "NO", name: "Norway", currency: "NOK", flag: "🇳🇴" },
  { code: "ZA", name: "South Africa", currency: "ZAR", flag: "🇿🇦" },
];

export const currencyToCountry = Object.fromEntries(
  travelCountries.map((c) => [c.currency, c])
) as Record<string, TravelCountry>;

function bank(
  id: string,
  name: string,
  country: string,
  countryCode: string,
  spreadPercent: number,
  flatFee: number,
  rating: number,
  url: string,
  branches?: string
): ExchangeProvider {
  return {
    id,
    name,
    type: "bank",
    country,
    countryCode,
    spreadPercent,
    flatFee,
    rating,
    branches,
    url,
  };
}

function agent(
  id: string,
  name: string,
  country: string,
  countryCode: string,
  city: string,
  spreadPercent: number,
  flatFee: number,
  rating: number,
  hours: string,
  url: string
): ExchangeProvider {
  return {
    id,
    name,
    type: "agent",
    country,
    countryCode,
    city,
    spreadPercent,
    flatFee,
    rating,
    hours,
    url,
  };
}

const banksByCountry: Record<string, ExchangeProvider[]> = {
  TH: [
    bank("th-bbl", "Bangkok Bank", "Thailand", "TH", 0.65, 20, 4.7, "https://www.bangkokbank.com", "1,100+ branches"),
    bank("th-kbank", "Kasikornbank", "Thailand", "TH", 0.7, 20, 4.6, "https://www.kasikornbank.com", "900+ branches"),
    bank("th-scb", "Siam Commercial Bank", "Thailand", "TH", 0.75, 20, 4.6, "https://www.scb.co.th", "1,000+ branches"),
    bank("th-krungthai", "Krungthai Bank", "Thailand", "TH", 0.8, 15, 4.4, "https://www.krungthai.com", "800+ branches"),
    bank("th-ttb", "TMBThanachart", "Thailand", "TH", 0.85, 20, 4.3, "https://www.ttbbank.com", "500+ branches"),
    bank("th-gsb", "Government Savings Bank", "Thailand", "TH", 0.9, 10, 4.2, "https://www.gsb.or.th", "1,000+ branches"),
    bank("th-bay", "Bank of Ayudhya", "Thailand", "TH", 0.95, 20, 4.4, "https://www.krungsri.com", "600+ branches"),
    bank("th-uob", "UOB Thailand", "Thailand", "TH", 1.0, 25, 4.3, "https://www.uob.co.th", "80+ branches"),
    bank("th-cimb", "CIMB Thai", "Thailand", "TH", 1.05, 20, 4.1, "https://www.cimbthai.com", "150+ branches"),
    bank("th-lh", "Land and Houses Bank", "Thailand", "TH", 1.1, 15, 4.0, "https://www.lhbank.co.th", "50+ branches"),
  ],
  JP: [
    bank("jp-mufg", "MUFG Bank", "Japan", "JP", 0.5, 0, 4.7, "https://www.bk.mufg.jp", "700+ branches"),
    bank("jp-smfg", "Sumitomo Mitsui", "Japan", "JP", 0.55, 0, 4.7, "https://www.smbc.co.jp", "600+ branches"),
    bank("jp-mizuho", "Mizuho Bank", "Japan", "JP", 0.6, 0, 4.6, "https://www.mizuhobank.co.jp", "500+ branches"),
    bank("jp-resona", "Resona Bank", "Japan", "JP", 0.7, 0, 4.4, "https://www.resonabank.co.jp", "500+ branches"),
    bank("jp-yucho", "Japan Post Bank", "Japan", "JP", 0.75, 0, 4.5, "https://www.jp-bank.japanpost.jp", "24,000+ branches"),
    bank("jp-shinsei", "Shinsei Bank", "Japan", "JP", 0.8, 0, 4.3, "https://www.shinseibank.com", "30+ branches"),
    bank("jp-rakuten", "Rakuten Bank", "Japan", "JP", 0.65, 0, 4.5, "https://www.rakuten-bank.co.jp", "Online only"),
    bank("jp-sony", "Sony Bank", "Japan", "JP", 0.7, 0, 4.4, "https://moneykit.net", "Online only"),
    bank("jp-sbi", "SBI Sumishin Net Bank", "Japan", "JP", 0.72, 0, 4.4, "https://www.netbk.co.jp", "Online only"),
    bank("jp-seven", "Seven Bank", "Japan", "JP", 0.85, 0, 4.2, "https://www.sevenbank.co.jp", "26,000+ ATMs"),
  ],
  US: [
    bank("us-chase", "Chase", "United States", "US", 0.9, 5, 4.5, "https://www.chase.com", "4,700+ branches"),
    bank("us-boa", "Bank of America", "United States", "US", 1.0, 5, 4.4, "https://www.bankofamerica.com", "3,900+ branches"),
    bank("us-wells", "Wells Fargo", "United States", "US", 1.05, 5, 4.3, "https://www.wellsfargo.com", "4,200+ branches"),
    bank("us-citi", "Citibank", "United States", "US", 0.95, 0, 4.4, "https://www.citi.com", "650+ branches"),
    bank("us-capital", "Capital One", "United States", "US", 1.1, 0, 4.3, "https://www.capitalone.com", "300+ branches"),
    bank("us-pnc", "PNC Bank", "United States", "US", 1.15, 5, 4.2, "https://www.pnc.com", "2,300+ branches"),
    bank("us-truist", "Truist", "United States", "US", 1.2, 5, 4.1, "https://www.truist.com", "2,000+ branches"),
    bank("us-usaa", "USAA", "United States", "US", 0.85, 0, 4.6, "https://www.usaa.com", "Online + select"),
    bank("us-hsbc", "HSBC USA", "United States", "US", 0.9, 0, 4.3, "https://www.us.hsbc.com", "150+ branches"),
    bank("us-td", "TD Bank", "United States", "US", 1.0, 0, 4.2, "https://www.td.com", "1,100+ branches"),
  ],
  GB: [
    bank("gb-hsbc", "HSBC UK", "United Kingdom", "GB", 0.6, 0, 4.5, "https://www.hsbc.co.uk", "500+ branches"),
    bank("gb-barclays", "Barclays", "United Kingdom", "GB", 0.65, 0, 4.5, "https://www.barclays.co.uk", "450+ branches"),
    bank("gb-lloyds", "Lloyds Bank", "United Kingdom", "GB", 0.7, 0, 4.4, "https://www.lloydsbank.com", "1,200+ branches"),
    bank("gb-natwest", "NatWest", "United Kingdom", "GB", 0.75, 0, 4.4, "https://www.natwest.com", "900+ branches"),
    bank("gb-santander", "Santander UK", "United Kingdom", "GB", 0.8, 0, 4.3, "https://www.santander.co.uk", "450+ branches"),
    bank("gb-nationwide", "Nationwide", "United Kingdom", "GB", 0.7, 0, 4.6, "https://www.nationwide.co.uk", "600+ branches"),
    bank("gb-monzo", "Monzo", "United Kingdom", "GB", 0.55, 0, 4.7, "https://monzo.com", "Online only"),
    bank("gb-revolut", "Revolut", "United Kingdom", "GB", 0.5, 0, 4.6, "https://www.revolut.com", "Online only"),
    bank("gb-starling", "Starling Bank", "United Kingdom", "GB", 0.58, 0, 4.5, "https://www.starlingbank.com", "Online only"),
    bank("gb-tsb", "TSB", "United Kingdom", "GB", 0.85, 0, 4.1, "https://www.tsb.co.uk", "200+ branches"),
  ],
  EU: [
    bank("eu-bnp", "BNP Paribas", "Eurozone", "EU", 0.55, 0, 4.5, "https://www.bnpparibas.com", "France & EU"),
    bank("eu-deutsche", "Deutsche Bank", "Eurozone", "EU", 0.6, 0, 4.4, "https://www.deutschebank.de", "Germany"),
    bank("eu-ing", "ING", "Eurozone", "EU", 0.5, 0, 4.6, "https://www.ing.com", "Pan-EU"),
    bank("eu-societe", "Société Générale", "Eurozone", "EU", 0.65, 0, 4.3, "https://www.societegenerale.com", "France"),
    bank("eu-ca", "Crédit Agricole", "Eurozone", "EU", 0.62, 0, 4.4, "https://www.credit-agricole.com", "France"),
    bank("eu-santander", "Santander", "Eurozone", "EU", 0.68, 0, 4.3, "https://www.santander.com", "Spain & EU"),
    bank("eu-unicredit", "UniCredit", "Eurozone", "EU", 0.7, 0, 4.2, "https://www.unicreditgroup.eu", "Italy & EU"),
    bank("eu-bbva", "BBVA", "Eurozone", "EU", 0.72, 0, 4.2, "https://www.bbva.com", "Spain"),
    bank("eu-n26", "N26", "Eurozone", "EU", 0.48, 0, 4.5, "https://n26.com", "Online only"),
    bank("eu-revolut", "Revolut EU", "Eurozone", "EU", 0.45, 0, 4.6, "https://www.revolut.com", "Online only"),
  ],
  AE: [
    bank("ae-enbd", "Emirates NBD", "UAE", "AE", 0.4, 0, 4.7, "https://www.emiratesnbd.com", "200+ branches"),
    bank("ae-adcb", "ADCB", "UAE", "AE", 0.45, 0, 4.6, "https://www.adcb.com", "50+ branches"),
    bank("ae-fab", "First Abu Dhabi Bank", "UAE", "AE", 0.42, 0, 4.6, "https://www.bankfab.com", "UAE-wide"),
    bank("ae-mashreq", "Mashreq Bank", "UAE", "AE", 0.5, 0, 4.5, "https://www.mashreq.com", "40+ branches"),
    bank("ae-dib", "Dubai Islamic Bank", "UAE", "AE", 0.48, 0, 4.4, "https://www.dib.ae", "60+ branches"),
    bank("ae-rak", "RAKBANK", "UAE", "AE", 0.55, 0, 4.3, "https://www.rakbank.ae", "30+ branches"),
    bank("ae-cbd", "Commercial Bank of Dubai", "UAE", "AE", 0.52, 0, 4.4, "https://www.cbd.ae", "Dubai"),
    bank("ae-hsbc", "HSBC UAE", "UAE", "AE", 0.5, 0, 4.5, "https://www.hsbc.ae", "25+ branches"),
    bank("ae-standard", "Standard Chartered UAE", "UAE", "AE", 0.55, 0, 4.3, "https://www.sc.com/ae", "UAE"),
    bank("ae-citi", "Citibank UAE", "UAE", "AE", 0.58, 0, 4.2, "https://www.citibank.ae", "Dubai & AD"),
  ],
  SG: [
    bank("sg-dbs", "DBS Bank", "Singapore", "SG", 0.35, 0, 4.7, "https://www.dbs.com.sg", "Singapore"),
    bank("sg-ocbc", "OCBC Bank", "Singapore", "SG", 0.38, 0, 4.6, "https://www.ocbc.com", "Singapore"),
    bank("sg-uob", "UOB", "Singapore", "SG", 0.4, 0, 4.6, "https://www.uob.com.sg", "Singapore"),
    bank("sg-maybank", "Maybank Singapore", "Singapore", "SG", 0.45, 0, 4.4, "https://www.maybank.com.sg", "Singapore"),
    bank("sg-citi", "Citibank Singapore", "Singapore", "SG", 0.42, 0, 4.4, "https://www.citibank.com.sg", "Singapore"),
    bank("sg-hsbc", "HSBC Singapore", "Singapore", "SG", 0.44, 0, 4.4, "https://www.hsbc.com.sg", "Singapore"),
    bank("sg-sc", "Standard Chartered SG", "Singapore", "SG", 0.48, 0, 4.3, "https://www.sc.com/sg", "Singapore"),
    bank("sg-trust", "Trust Bank", "Singapore", "SG", 0.32, 0, 4.5, "https://trustbank.sg", "Digital"),
    bank("sg-mari", "MariBank", "Singapore", "SG", 0.33, 0, 4.4, "https://www.maribank.sg", "Digital"),
    bank("sg-gxs", "GXS Bank", "Singapore", "SG", 0.36, 0, 4.3, "https://www.gxs.com.sg", "Digital"),
  ],
};

const agentsByCountry: Record<string, ExchangeProvider[]> = {
  TH: [
    agent("th-superrich", "SuperRich", "Thailand", "TH", "Bangkok", 1.8, 0, 4.8, "9am–9pm", "https://www.superrichthailand.com"),
    agent("th-vasu", "Vasu Exchange", "Thailand", "TH", "Bangkok", 2.0, 0, 4.7, "8:30am–8pm", "https://www.vasuexchange.co.th"),
    agent("th-sia", "Sia Money Exchange", "Thailand", "TH", "Bangkok", 2.2, 0, 4.6, "9am–8pm", "https://www.sia-moneyexchange.com"),
    agent("th-value", "Value Plus Suvarnabhumi", "Thailand", "TH", "Bangkok", 2.5, 0, 4.4, "24h", "https://www.valueplusexchange.com"),
    agent("th-twelve", "Twelve Victory", "Thailand", "TH", "Phuket", 2.3, 0, 4.5, "9am–9pm", "https://www.twelvevictory.com"),
    agent("th-ktc", "KTC Exchange Chiang Mai", "Thailand", "TH", "Chiang Mai", 2.4, 0, 4.4, "8:30am–7pm", "https://www.ktcexchange.com"),
    agent("th-global", "Global Exchange Pattaya", "Thailand", "TH", "Pattaya", 2.8, 0, 4.2, "9am–10pm", "https://www.globalexchange.com"),
    agent("th-tt", "T.T. Currency Exchange", "Thailand", "TH", "Bangkok", 2.1, 0, 4.5, "9am–8:30pm", "https://www.ttexchange.com"),
  ],
  JP: [
    agent("jp-travelex", "Travelex Japan", "Japan", "JP", "Tokyo", 2.5, 0, 4.5, "9am–8pm", "https://www.travelex.co.jp"),
    agent("jp-world", "World Currency Shop", "Japan", "JP", "Tokyo", 2.2, 0, 4.6, "10am–8pm", "https://www.tokyo-card.co.jp"),
    agent("jp-daikoku", "Daikoku Drug FX", "Japan", "JP", "Osaka", 2.8, 0, 4.3, "10am–9pm", "https://www.daikokudrug.com"),
    agent("jp-mitsui", "Mitsui Sumitomo Trusco", "Japan", "JP", "Tokyo", 2.0, 0, 4.4, "9am–5pm", "https://www.smbctb.co.jp"),
    agent("jp-inter", "Interbank Narita", "Japan", "JP", "Narita", 3.0, 0, 4.2, "7am–9pm", "https://www.narita-airport.jp"),
    agent("jp-haneda", "Haneda Airport FX", "Japan", "JP", "Tokyo", 3.2, 0, 4.1, "6am–10pm", "https://www.haneda-airport.jp"),
  ],
  US: [
    agent("us-travelex", "Travelex USA", "United States", "US", "New York", 2.5, 0, 4.3, "8am–8pm", "https://www.travelex.com"),
    agent("us-cef", "Currency Exchange International", "United States", "US", "Miami", 2.2, 0, 4.4, "9am–7pm", "https://www.ceifx.com"),
    agent("us-continental", "Continental Currency", "United States", "US", "Los Angeles", 2.4, 0, 4.3, "9am–6pm", "https://www.continentalcurrency.com"),
    agent("us-forex", "Foreign Currency Express", "United States", "US", "Las Vegas", 2.8, 0, 4.2, "9am–9pm", "https://www.foreigncurrencyexpress.com"),
    agent("us-aaa", "AAA Travel Money", "United States", "US", "Nationwide", 2.6, 0, 4.1, "Branch hours", "https://www.aaa.com"),
    agent("us-walmart", "Walmart Money Center", "United States", "US", "Nationwide", 3.0, 4, 4.0, "Store hours", "https://www.walmart.com"),
  ],
  GB: [
    agent("gb-post", "Post Office", "United Kingdom", "GB", "London", 2.0, 0, 4.5, "9am–5:30pm", "https://www.postoffice.co.uk"),
    agent("gb-travelex", "Travelex UK", "United Kingdom", "GB", "London", 2.5, 0, 4.4, "8am–9pm", "https://www.travelex.co.uk"),
    agent("gb-no1", "No1 Currency", "United Kingdom", "GB", "London", 2.3, 0, 4.3, "9am–7pm", "https://www.no1currency.com"),
    agent("gb-eurochange", "Eurochange", "United Kingdom", "GB", "Manchester", 2.4, 0, 4.3, "9am–6pm", "https://www.eurochange.co.uk"),
    agent("gb-ice", "International Currency Exchange", "United Kingdom", "GB", "Heathrow", 3.0, 0, 4.1, "24h", "https://www.icecurrency.com"),
    agent("gb-marks", "Marks & Spencer Bureau", "United Kingdom", "GB", "London", 2.1, 0, 4.4, "Store hours", "https://www.marksandspencer.com"),
  ],
  EU: [
    agent("eu-change", "Change Group", "Eurozone", "EU", "Paris", 2.2, 0, 4.4, "9am–8pm", "https://www.changegroup.com"),
    agent("eu-travelex", "Travelex EU", "Eurozone", "EU", "Frankfurt", 2.5, 0, 4.3, "7am–9pm", "https://www.travelex.com"),
    agent("eu-forex", "Forexchange", "Eurozone", "EU", "Rome", 2.3, 0, 4.3, "9am–7pm", "https://www.forexchange.it"),
    agent("eu-global", "Global Exchange", "Eurozone", "EU", "Barcelona", 2.6, 0, 4.2, "9am–9pm", "https://www.globalexchange.com"),
    agent("eu-cd", "Crown Darts Exchange", "Eurozone", "EU", "Amsterdam", 2.4, 0, 4.2, "10am–6pm", "https://www.crowndarts.nl"),
    agent("eu-cdg", "CDG Airport Exchange", "Eurozone", "EU", "Paris", 3.2, 0, 4.0, "24h", "https://www.parisaeroport.fr"),
  ],
  AE: [
    agent("ae-alansari", "Al Ansari Exchange", "UAE", "AE", "Dubai", 1.2, 0, 4.8, "8am–10pm", "https://www.alansariexchange.com"),
    agent("ae-lulu", "LuLu Exchange", "UAE", "AE", "Dubai", 1.4, 0, 4.7, "9am–10pm", "https://www.luluexchange.com"),
    agent("ae-uae", "UAE Exchange", "UAE", "AE", "Abu Dhabi", 1.3, 0, 4.7, "8:30am–10pm", "https://www.uaeexchange.com"),
    agent("ae-wallstreet", "Wall Street Exchange", "UAE", "AE", "Dubai", 1.5, 0, 4.6, "9am–9pm", "https://www.wallstreet.ae"),
    agent("ae-redha", "Redha Al Ansari", "UAE", "AE", "Sharjah", 1.6, 0, 4.5, "8am–9pm", "https://www.redhaalansari.com"),
    agent("ae-dxb", "DXB Airport Exchange", "UAE", "AE", "Dubai", 2.5, 0, 4.2, "24h", "https://www.dubaiairports.ae"),
  ],
  SG: [
    agent("sg-cr", "Crane Money Exchange", "Singapore", "SG", "Singapore", 1.5, 0, 4.7, "9am–8pm", "https://www.crane.com.sg"),
    agent("sg-zh", "Zhong Guo Money Changer", "Singapore", "SG", "Singapore", 1.6, 0, 4.6, "9:30am–7:30pm", "https://www.zhongguo.com.sg"),
    agent("sg-apex", "Apex Money Exchange", "Singapore", "SG", "Singapore", 1.7, 0, 4.5, "10am–8pm", "https://www.apexchange.com.sg"),
    agent("sg-changi", "Changi Recommends FX", "Singapore", "SG", "Singapore", 2.2, 0, 4.4, "24h", "https://www.changirecommends.com"),
    agent("sg-travelex", "Travelex Singapore", "Singapore", "SG", "Singapore", 2.0, 0, 4.4, "8am–10pm", "https://www.travelex.com.sg"),
  ],
};

/** Fallback banks for countries without dedicated seed data */
const genericBanks = (country: TravelCountry): ExchangeProvider[] =>
  Array.from({ length: 10 }, (_, i) =>
    bank(
      `gen-${country.code}-${i}`,
      `${country.name} National Bank ${i + 1}`,
      country.name,
      country.code,
      0.8 + i * 0.1,
      5,
      4.2 - i * 0.05,
      `https://www.xe.com/currencyconverter/convert/?From=USD&To=${country.currency}`,
      "Nationwide"
    )
  );

const genericAgents = (country: TravelCountry): ExchangeProvider[] =>
  Array.from({ length: 6 }, (_, i) =>
    agent(
      `agen-${country.code}-${i}`,
      `${country.name} Money Changer ${i + 1}`,
      country.name,
      country.code,
      "City Center",
      2.0 + i * 0.3,
      0,
      4.3 - i * 0.05,
      "9am–7pm",
      `https://www.xe.com/currencyconverter/convert/?From=USD&To=${country.currency}`
    )
  );

export function getCountryForCurrency(currency: string): TravelCountry | undefined {
  return currencyToCountry[currency];
}

export function getBanksForCountry(countryCode: string): ExchangeProvider[] {
  const country = travelCountries.find((c) => c.code === countryCode);
  if (!country) return [];
  return banksByCountry[countryCode] ?? genericBanks(country);
}

export function getAgentsForCountry(countryCode: string): ExchangeProvider[] {
  const country = travelCountries.find((c) => c.code === countryCode);
  if (!country) return [];
  return agentsByCountry[countryCode] ?? genericAgents(country);
}
