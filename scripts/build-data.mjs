// Builds economy.json, population.json and birthday-rank.json into src/data.
// Numeric series are published anchor values, log-interpolated between anchors.
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "src", "data");
const Y0 = 1950, Y1 = 2026;

function series(anchors) {
  const pts = Object.entries(anchors).map(([y, v]) => [+y, v]).sort((a, b) => a[0] - b[0]);
  const out = {};
  for (let y = Y0; y <= Y1; y++) {
    let i = pts.findIndex(([py]) => py >= y);
    if (i === -1) i = pts.length - 1;
    if (pts[i][0] === y || i === 0) { out[y] = pts[i][1]; continue; }
    const [x0, v0] = pts[i - 1], [x1, v1] = pts[i];
    const t = (y - x0) / (x1 - x0);
    out[y] = Math.exp(Math.log(v0) + t * (Math.log(v1) - Math.log(v0)));
  }
  return out;
}

// ---- USD anchors ----
const house = series({ 1950: 7400, 1960: 11900, 1970: 23400, 1975: 39300, 1980: 64600, 1985: 84200, 1990: 122900, 1995: 133900, 2000: 165300, 2003: 195000, 2006: 246500, 2009: 216700, 2010: 221800, 2012: 245200, 2015: 296000, 2018: 326400, 2020: 336900, 2021: 397100, 2022: 454900, 2023: 430000, 2024: 420000, 2025: 415000, 2026: 420000 });
const gas = series({ 1950: 0.27, 1955: 0.29, 1960: 0.31, 1965: 0.31, 1970: 0.36, 1974: 0.53, 1975: 0.57, 1979: 0.90, 1980: 1.19, 1981: 1.31, 1985: 1.20, 1986: 0.93, 1990: 1.16, 1995: 1.15, 2000: 1.51, 2003: 1.56, 2005: 2.27, 2008: 3.27, 2009: 2.35, 2010: 2.79, 2011: 3.53, 2012: 3.63, 2013: 3.51, 2014: 3.36, 2016: 2.14, 2019: 2.60, 2020: 2.17, 2021: 3.01, 2022: 3.95, 2023: 3.52, 2024: 3.30, 2025: 3.15, 2026: 3.10 });
const ticket = series({ 1950: 0.46, 1960: 0.69, 1970: 1.55, 1980: 2.69, 1990: 4.23, 2000: 5.39, 2005: 6.41, 2010: 7.89, 2015: 8.43, 2019: 9.16, 2022: 10.53, 2023: 10.78, 2024: 11.31, 2025: 11.5, 2026: 11.8 });
const gold = series({ 1950: 35, 1960: 35.3, 1968: 39, 1970: 36.4, 1971: 41, 1972: 58, 1973: 97, 1974: 159, 1975: 161, 1976: 125, 1977: 148, 1978: 193, 1979: 307, 1980: 612, 1981: 460, 1982: 376, 1983: 424, 1984: 361, 1985: 317, 1986: 368, 1987: 447, 1988: 437, 1989: 381, 1990: 384, 1991: 362, 1992: 344, 1993: 360, 1994: 384, 1995: 384, 1996: 388, 1997: 331, 1998: 294, 1999: 279, 2000: 279, 2001: 271, 2002: 310, 2003: 363, 2004: 410, 2005: 445, 2006: 604, 2007: 695, 2008: 872, 2009: 972, 2010: 1225, 2011: 1572, 2012: 1669, 2013: 1411, 2014: 1266, 2015: 1160, 2016: 1251, 2017: 1257, 2018: 1268, 2019: 1393, 2020: 1770, 2021: 1799, 2022: 1802, 2023: 1943, 2024: 2386, 2025: 3400, 2026: 4500 });
// ---- INR anchors ----
const goldInr = series({ 1950: 99, 1955: 79, 1960: 111, 1962: 119, 1964: 63, 1966: 84, 1968: 162, 1970: 184, 1972: 202, 1973: 278, 1974: 506, 1975: 540, 1976: 432, 1978: 685, 1979: 937, 1980: 1330, 1981: 1800, 1982: 1645, 1983: 1800, 1984: 1970, 1985: 2130, 1986: 2140, 1987: 2570, 1988: 3130, 1989: 3140, 1990: 3200, 1991: 3466, 1992: 4334, 1993: 4140, 1994: 4598, 1995: 4680, 1996: 5160, 1997: 4725, 1998: 4045, 1999: 4234, 2000: 4400, 2001: 4300, 2002: 4990, 2003: 5600, 2004: 5850, 2005: 7000, 2006: 8450, 2007: 10800, 2008: 12500, 2009: 14500, 2010: 18500, 2011: 26400, 2012: 31050, 2013: 29600, 2014: 28000, 2015: 26300, 2016: 29000, 2017: 29700, 2018: 31400, 2019: 35000, 2020: 48650, 2021: 48700, 2022: 52700, 2023: 58500, 2024: 72000, 2025: 98000, 2026: 130000 });
const petrol = series({ 1950: 0.5, 1960: 0.7, 1970: 1.1, 1975: 1.9, 1980: 3.7, 1985: 7.0, 1990: 8.5, 1995: 17.5, 2000: 27.5, 2003: 33.7, 2005: 37, 2008: 45, 2010: 47, 2011: 63, 2012: 67, 2013: 70, 2014: 71, 2015: 62, 2016: 63, 2017: 69, 2018: 77, 2019: 71, 2020: 76, 2021: 93, 2022: 96, 2023: 96.7, 2024: 94.7, 2025: 94.7, 2026: 95 });
const ticketInr = series({ 1950: 0.5, 1960: 0.8, 1970: 1.5, 1980: 4, 1990: 10, 2000: 30, 2005: 50, 2010: 75, 2015: 100, 2019: 120, 2020: 110, 2022: 125, 2023: 130, 2024: 135, 2026: 140 });

// ---- Investment series (annual averages; index levels are price-only, no dividends) ----
const sp500 = series({ 1950: 18, 1955: 38, 1960: 56, 1965: 88, 1970: 85, 1975: 86, 1980: 118, 1985: 186, 1990: 334, 1995: 541, 1998: 1085, 2000: 1427, 2002: 994, 2003: 965, 2005: 1207, 2007: 1477, 2009: 948, 2010: 1139, 2013: 1644, 2015: 2061, 2017: 2449, 2019: 2913, 2020: 3218, 2021: 4274, 2022: 4098, 2023: 4284, 2024: 5428, 2025: 6200, 2026: 6800 });
const sensex = series({ 1979: 120, 1980: 135, 1985: 570, 1990: 800, 1991: 1500, 1992: 3000, 1995: 3000, 1996: 3400, 1998: 3300, 1999: 4300, 2000: 4800, 2001: 3300, 2002: 3300, 2003: 4700, 2004: 5700, 2005: 8300, 2006: 11900, 2007: 14000, 2008: 14000, 2009: 12000, 2010: 18000, 2011: 18000, 2012: 17500, 2013: 19500, 2014: 25000, 2015: 27000, 2016: 26000, 2017: 31000, 2018: 35500, 2019: 39000, 2020: 36000, 2021: 51000, 2022: 58500, 2023: 64000, 2024: 75000, 2025: 80500, 2026: 80000 });
// Split-adjusted AAPL (112x of splits since the IPO), USD.
const aapl = series({ 1981: 0.17, 1984: 0.22, 1987: 0.36, 1990: 0.33, 1993: 0.28, 1995: 0.31, 1996: 0.25, 1997: 0.17, 1998: 0.28, 1999: 0.55, 2000: 0.85, 2001: 0.36, 2002: 0.25, 2003: 0.23, 2004: 0.45, 2005: 1.6, 2006: 2.3, 2007: 4.3, 2008: 4.6, 2009: 5.0, 2010: 9.3, 2011: 12.9, 2012: 20, 2013: 16, 2014: 23, 2015: 30, 2016: 26, 2017: 37, 2018: 47, 2019: 52, 2020: 95, 2021: 140, 2022: 154, 2023: 172, 2024: 210, 2025: 225, 2026: 260 });
const btc = series({ 2010: 0.1, 2011: 5, 2012: 8, 2013: 120, 2014: 530, 2015: 270, 2016: 570, 2017: 4000, 2018: 7500, 2019: 7400, 2020: 11000, 2021: 47000, 2022: 28000, 2023: 28500, 2024: 66000, 2025: 102000, 2026: 85000 });
// Rupees per US dollar (annual average); used to convert dollar assets for INR mode.
const usdInr = series({ 1950: 4.76, 1965: 4.76, 1966: 7.5, 1970: 7.56, 1975: 8.4, 1980: 7.86, 1985: 12.2, 1990: 17.5, 1995: 32.4, 2000: 44.9, 2005: 44.1, 2008: 43.5, 2010: 45.7, 2013: 58.6, 2015: 64, 2018: 68.4, 2020: 74.1, 2022: 78.6, 2023: 82.6, 2024: 83.7, 2025: 87, 2026: 90 });
const sig = (v, d) => (v < 1 ? +v.toPrecision(2) : +v.toFixed(d));

// "In everyone's pocket", by era.
const pocketRanges = [[1950,1953,"A pocket watch & a fountain pen"],[1954,1969,"A transistor radio & a pocket comb"],[1970,1978,"A pocket calculator & mixtape cassettes"],[1979,1988,"A Sony Walkman & a cassette tape"],[1989,1992,"A Game Boy & a Walkman"],[1993,1997,"A pager & a Discman"],[1998,1999,"A Nokia 5110 & a Discman"],[2000,2002,"A Nokia 3310 & a burned CD"],[2003,2004,"A Nokia 1100 & an iPod"],[2005,2005,"A Nokia 1100 & an iPod Nano"],[2006,2007,"A Motorola RAZR & an iPod"],[2008,2009,"An iPhone 3G & a BlackBerry"],[2010,2012,"An iPhone 4 & an Android"],[2013,2015,"A smartphone & wired earbuds"],[2016,2018,"An iPhone 7 & AirPods"],[2019,2019,"An iPhone 11 & AirPods"],[2020,2021,"An iPhone 12 & a face mask"],[2022,2023,"An iPhone 14 & AirPods"],[2024,2026,"A smartphone with AI built in"]];
const pocket = (y) => pocketRanges.find(([x, z]) => y >= x && y <= z)[2];

// ---- Culture, index 0 = 1950 ----
const hollywood = ["Cinderella","Quo Vadis","The Greatest Show on Earth","The Robe","White Christmas","Lady and the Tramp","The Ten Commandments","The Bridge on the River Kwai","South Pacific","Ben-Hur","Spartacus","One Hundred and One Dalmatians","How the West Was Won","Cleopatra","Goldfinger","The Sound of Music","Hawaii","The Jungle Book","2001: A Space Odyssey","Butch Cassidy and the Sundance Kid","Love Story","Fiddler on the Roof","The Godfather","The Exorcist","Blazing Saddles","Jaws","Rocky","Star Wars","Grease","Kramer vs. Kramer","The Empire Strikes Back","Raiders of the Lost Ark","E.T. the Extra-Terrestrial","Return of the Jedi","Beverly Hills Cop","Back to the Future","Top Gun","Three Men and a Baby","Rain Man","Batman","Home Alone","Terminator 2: Judgment Day","Aladdin","Jurassic Park","The Lion King","Toy Story","Independence Day","Titanic","Saving Private Ryan","Star Wars: The Phantom Menace","Mission: Impossible 2","Harry Potter and the Sorcerer's Stone","Spider-Man","Finding Nemo","Shrek 2","Star Wars: Revenge of the Sith","Pirates of the Caribbean: Dead Man's Chest","Spider-Man 3","The Dark Knight","Avatar","Toy Story 3","Harry Potter and the Deathly Hallows: Part 2","The Avengers","The Hunger Games: Catching Fire","Guardians of the Galaxy","Star Wars: The Force Awakens","Rogue One: A Star Wars Story","Star Wars: The Last Jedi","Black Panther","Avengers: Endgame","Bad Boys for Life","Spider-Man: No Way Home","Top Gun: Maverick","Barbie","Inside Out 2","Zootopia 2","Toy Story 5"];
const bolly = [["Samadhi","Gore Gore O Banke Chore — Samadhi"],["Awaara","Awaara Hoon — Awaara"],["Aan","Dil Mein Chhupake Pyar Ka Tufan — Aan"],["Anarkali","Yeh Zindagi Usi Ki Hai — Anarkali"],["Nagin","Man Dole Mera Tan Dole — Nagin"],["Shree 420","Mera Joota Hai Japani — Shree 420"],["C.I.D.","Leke Pehla Pehla Pyar — C.I.D."],["Mother India","Duniya Mein Hum Aaye Hain — Mother India"],["Madhumati","Suhana Safar Aur Yeh Mausam Haseen — Madhumati"],["Anari","Kisi Ki Muskurahaton Pe — Anari"],["Mughal-E-Azam","Pyar Kiya To Darna Kya — Mughal-E-Azam"],["Jab Pyar Kisi Se Hota Hai","Jiya O Jiya Kuch Bol Do — Jab Pyar Kisi Se Hota Hai"],["Bees Saal Baad","Kahin Deep Jale Kahin Dil — Bees Saal Baad"],["Mere Mehboob","Mere Mehboob Tujhe — Mere Mehboob"],["Sangam","Dost Dost Na Raha — Sangam"],["Waqt","Aage Bhi Jane Na Tu — Waqt"],["Phool Aur Patthar","Sheesha Ho Ya Dil Ho — Aasha"],["Upkar","Mere Desh Ki Dharti — Upkar"],["Aankhen","Milti Hai Zindagi Mein Mohabbat — Aankhen"],["Aradhana","Mere Sapno Ki Rani — Aradhana"],["Johny Mera Naam","Pal Bhar Ke Liye — Johny Mera Naam"],["Haathi Mere Saathi","Chal Chal Chal Mere Saathi — Haathi Mere Saathi"],["Seeta Aur Geeta","Haan Ji Haan Maine Sharaab Pi Hai — Seeta Aur Geeta"],["Bobby","Hum Tum Ek Kamre Mein Band Ho — Bobby"],["Roti Kapada Aur Makaan","Baaki Kuch Bacha To Mehngai Maar Gayi — Roti Kapada Aur Makaan"],["Sholay","Yeh Dosti — Sholay"],["Kabhie Kabhie","Kabhi Kabhi Mere Dil Mein — Kabhie Kabhie"],["Amar Akbar Anthony","My Name Is Anthony Gonsalves — Amar Akbar Anthony"],["Muqaddar Ka Sikandar","Salaam-E-Ishq — Muqaddar Ka Sikandar"],["Mr. Natwarlal","Pardesiya — Mr. Natwarlal"],["Qurbani","Aap Jaisa Koi — Qurbani"],["Kranti","Zindagi Ki Na Toote Ladi — Kranti"],["Disco Dancer","I Am a Disco Dancer — Disco Dancer"],["Coolie","Tu Mera Jaanu Hai — Hero"],["Sharaabi","Inteha Ho Gayi Intezar Ki — Sharaabi"],["Mard","Sun Sahiba Sun — Ram Teri Ganga Maili"],["Karma","Dil Diya Hai Jaan Bhi Denge — Karma"],["Mr. India","Kate Nahin Katte — Mr. India"],["Tezaab","Ek Do Teen — Tezaab"],["Maine Pyar Kiya","Dil Deewana — Maine Pyar Kiya"],["Dil","Mujhe Neend Na Aaye — Dil"],["Saajan","Mera Dil Bhi Kitna Pagal Hai — Saajan"],["Beta","Dhak Dhak Karne Laga — Beta"],["Baazigar","Yeh Kaali Kaali Aankhen — Baazigar"],["Hum Aapke Hain Koun..!","Didi Tera Devar Deewana — Hum Aapke Hain Koun..!"],["Dilwale Dulhania Le Jayenge","Tujhe Dekha To Yeh Jaana Sanam — DDLJ"],["Raja Hindustani","Pardesi Pardesi — Raja Hindustani"],["Dil To Pagal Hai","Dil To Pagal Hai — Dil To Pagal Hai"],["Kuch Kuch Hota Hai","Kuch Kuch Hota Hai — Kuch Kuch Hota Hai"],["Hum Saath-Saath Hain","Aankhon Ki Gustakhiyan — Hum Dil De Chuke Sanam"],["Kaho Naa... Pyaar Hai","Kaho Naa Pyaar Hai — Kaho Naa... Pyaar Hai"],["Gadar: Ek Prem Katha","Udja Kale Kawan — Gadar"],["Devdas","Dola Re Dola — Devdas"],["Koi... Mil Gaya","Idhar Chala Main Udhar Chala — Koi... Mil Gaya"],["Veer-Zaara","Tere Liye — Veer-Zaara"],["No Entry","Kajra Re — Bunty Aur Babli"],["Dhoom 2","Dhoom Again — Dhoom 2"],["Om Shanti Om","Dard-E-Disco — Om Shanti Om"],["Ghajini","Guzarish — Ghajini"],["3 Idiots","All Izz Well — 3 Idiots"],["Dabangg","Munni Badnaam Hui — Dabangg"],["Bodyguard","Teri Meri — Bodyguard"],["Ek Tha Tiger","Mashallah — Ek Tha Tiger"],["Dhoom 3","Tum Hi Ho — Aashiqui 2"],["PK","Chittiyaan Kalaiyaan — Roy"],["Bajrangi Bhaijaan","Gerua — Dilwale"],["Dangal","Dangal — Dangal"],["Baahubali 2: The Conclusion","Swag Se Swagat — Tiger Zinda Hai"],["Sanju","Dilbar — Satyameva Jayate"],["War","Bekhayali — Kabir Singh"],["Tanhaji","Shankara Re Shankara — Tanhaji"],["Sooryavanshi","Raataan Lambiyan — Shershaah"],["KGF: Chapter 2","Toofan — KGF: Chapter 2"],["Jawan","Chaleya — Jawan"],["Pushpa 2: The Rule","Aaj Ki Raat — Stree 2"],["Dhurandhar","Saiyaara — Saiyaara"],["Dhurandhar: The Revenge","Year still unfolding"]];
const techRanges = [[1950,1956,"Vacuum Tubes & Radio"],[1957,1960,"Sputnik & Transistors"],[1961,1965,"Space Race Begins"],[1966,1968,"Color TV & Mainframes"],[1969,1969,"Moon Landing Era"],[1970,1974,"Pocket Calculators Arrive"],[1975,1979,"Atari, VHS & Disco"],[1980,1983,"Arcades & Home Computers"],[1984,1988,"Macintosh & Walkman Era"],[1989,1992,"Game Boy & Cassettes"],[1993,1996,"Dial-up & Pagers"],[1997,1999,"Dial-up & Flip Phones"],[2000,2002,"Napster & Nokia Bricks"],[2003,2005,"iPods & Early Facebook"],[2006,2007,"MySpace & Flip Phones"],[2008,2010,"iPhone & App Store"],[2011,2013,"Instagram & Smartphones"],[2014,2016,"Selfies & Streaming"],[2017,2019,"TikTok & Smart Speakers"],[2020,2021,"Zoom & Lockdown Streaming"],[2022,2023,"ChatGPT & Generative AI"],[2024,2026,"AI Everywhere Era"]];
const tech = (y) => techRanges.find(([a, b]) => y >= a && y <= b)[2];

if (hollywood.length !== 77 || bolly.length !== 77) throw new Error(`culture lists must be 77 long: ${hollywood.length}, ${bolly.length}`);
const r = (v, d = 0) => +v.toFixed(d);
const economy = {};
for (let y = Y0; y <= Y1; y++) {
  const i = y - Y0;
  economy[y] = {
    global: { housePrice: Math.round(house[y] / 100) * 100, gasGallon: r(gas[y], 2), movieTicket: r(ticket[y], 2), goldPerOz: r(gold[y], gold[y] < 100 ? 1 : 0), topMovie: hollywood[i], techEra: tech(y), pocket: pocket(y), sp500: sig(sp500[y], 0), aapl: y >= 1981 ? sig(aapl[y], 2) : null, btc: y >= 2010 ? sig(btc[y], 2) : null },
    india: { goldPer10g: r(goldInr[y]), sensex: y >= 1979 ? r(sensex[y]) : null, usdInr: r(usdInr[y], 2), petrolPerLitre: r(petrol[y], 1), movieTicket: r(ticketInr[y], 1), bollywood: { movie: bolly[i][0], song: bolly[i][1] } },
    ...(y >= 2025 ? { estimated: true } : {}),
  };
}

// ---- Population (millions -> people) ----
const pop = series({ 1950: 2536, 1955: 2774, 1960: 3034, 1965: 3340, 1970: 3700, 1975: 4079, 1980: 4458, 1985: 4871, 1990: 5327, 1995: 5743, 2000: 6149, 2005: 6542, 2010: 6957, 2015: 7426, 2020: 7840, 2022: 7975, 2023: 8045, 2024: 8162, 2025: 8231, 2026: 8300 });
const population = Object.fromEntries(Object.entries(pop).map(([y, m]) => [y, Math.round(m) * 1_000_000]));


// ---- Birthday popularity (366 days) ----
// A model, not a census: month weights follow the seasonal shape of published US birth counts
// (September peak, winter lull), with day-level dips for holidays, the 13th, and leap day.
const monthWeight = [0.955, 0.94, 0.99, 0.96, 0.985, 0.985, 1.025, 1.045, 1.07, 1.03, 0.99, 1.01];
const dayAdjust = { "12-25": -0.26, "12-24": -0.17, "01-01": -0.21, "07-04": -0.14, "12-26": -0.1, "11-27": -0.05, "11-28": -0.05, "10-31": -0.05, "12-31": -0.07, "01-02": -0.05, "02-29": -0.75, "09-09": 0.06, "09-19": 0.05, "09-12": 0.05, "09-17": 0.045, "09-10": 0.045, "09-20": 0.04, "09-16": 0.04, "09-14": 0.04, "09-15": 0.04, "09-18": 0.04, "09-11": 0.03, "09-13": 0.0 };
const dim = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const days = [];
for (let m = 0; m < 12; m++) {
  for (let d = 1; d <= dim[m]; d++) {
    const key = String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
    let w = monthWeight[m] + (dayAdjust[key] ?? 0);
    if (d === 13 && dayAdjust[key] === undefined) w -= 0.03;
    if (d >= 9 && d <= 20 && m === 8 && dayAdjust[key] === undefined) w += 0.03;
    days.push({ key, w });
  }
}
const totalW = days.reduce((t, x) => t + x.w, 0);
const ordered = [...days].sort((p, q) => q.w - p.w || p.key.localeCompare(q.key));
const birthdayRank = {};
ordered.forEach((x, i) => { birthdayRank[x.key] = { rank: i + 1, share: +(x.w / totalW).toFixed(6) }; });

await mkdir(dataDir, { recursive: true });
await writeFile(path.join(dataDir, "economy.json"), JSON.stringify(economy, null, 2));
await writeFile(path.join(dataDir, "population.json"), JSON.stringify(population, null, 2));
await writeFile(path.join(dataDir, "birthday-rank.json"), JSON.stringify(birthdayRank));
console.log(`economy ${Object.keys(economy).length} yrs, population ${Object.keys(population).length} yrs, birthday ranks ${Object.keys(birthdayRank).length}`);
