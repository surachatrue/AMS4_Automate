const { chromium } = require('playwright');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

function generateThaiID() {
  const randomDigit = () => Math.floor(Math.random() * 10);

  // เลขบัตรประชาชนไทยมี 13 หลัก
  let id = '';
  for (let i = 0; i < 12; i++) {
    id += randomDigit();
  }

  // คำนวณตัวเลขตรวจสอบ (check digit)
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id[i]) * (13 - i);
  }

  const checkDigit = (11 - (sum % 11)) % 10;
  id += checkDigit;

  return id;
}

async function getRandomOptionValues(page, selector) {
    const options = await page.$$(selector + ' option');
    const values = [];
    for (const option of options) {
      const value = await option.getAttribute('value');
      if (value !== '0') { // เพิ่มเงื่อนไขว่า value ต้องไม่เท่ากับ '0'
        values.push(value);
      }
    }
    if (values.length === 0) {
      return undefined;
    }
    const randomIndex = Math.floor(Math.random() * values.length);
    return values[randomIndex];
  }

  async function getRandomCarValues(page, selector) {
    const options = await page.$$(selector + ' option');
    const optionValues = [];
  
    for (const option of options) {
      const value = await option.getAttribute('value');
      if (value && value !== '0') { // ตรวจสอบว่ามีค่าและไม่ใช่ 0
        optionValues.push(value);
      }
    }
  
    if (optionValues.length === 0) {
      throw new Error(`No valid options found for selector: ${selector}`);
    }
  
    const randomIndex = Math.floor(Math.random() * optionValues.length);
    return optionValues[randomIndex];
  }

  function generateThaiPhoneNumber() {
    const prefixes = ['080-', '081-', '082-', '083-', '084-', '085-', '086-', '087-', '088-', '089-', '090-', '091-', '092-', '093-', '094-', '095-', '096-', '097-', '098-', '099-'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNumber = () => Math.floor(Math.random() * 10);
  
    let phoneNumber = randomPrefix;
    for (let i = 0; i < 7; i++) {
      phoneNumber += randomNumber();
    }
  
    return phoneNumber;
  }

  function getRandomLicensePlate() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    // Generate a random string of 2 letters followed by 4 digits
    const letters = `${alphabet[Math.floor(Math.random() * alphabet.length)]}${alphabet[Math.floor(Math.random() * alphabet.length)]}`;
    const digits = `${numbers[Math.floor(Math.random() * numbers.length)]}${numbers[Math.floor(Math.random() * numbers.length)]}${numbers[Math.floor(Math.random() * numbers.length)]}${numbers[Math.floor(Math.random() * numbers.length)]}`;
    
    // Combine letters and digits to form a license plate number
    const licensePlate = `${letters}${digits}`;
    
    return licensePlate;
  }

  function getRandomLicenseReg() {
    const numbers = '0123456789';
    const provinces = [
      'กรุงเทพมหานคร', 'สมุทรปราการ', 'นนทบุรี', 'ปทุมธานี', 'พระนครศรีอยุธยา',
      'อ่างทอง', 'ลพบุรี', 'สิงห์บุรี', 'ชัยนาท', 'สระบุรี', 'ชลบุรี', 'ระยอง', 'จันทบุรี',
      'ตราด', 'ฉะเชิงเทรา', 'ปราจีนบุรี', 'นครนายก', 'สระแก้ว', 'นครราชสีมา', 'บุรีรัมย์',
      'สุรินทร์', 'ศรีสะเกษ', 'อุบลราชธานี', 'ยโสธร', 'ชัยภูมิ', 'อำนาจเจริญ', 'บึงกาฬ',
      'หนองบัวลำภู', 'ขอนแก่น', 'อุดรธานี', 'เลย', 'หนองคาย', 'มหาสารคาม', 'ร้อยเอ็ด',
      'กาฬสินธุ์', 'สกลนคร', 'นครพนม', 'มุกดาหาร', 'เชียงใหม่', 'ลำพูน', 'ลำปาง', 'อุตรดิตถ์',
      'แพร่', 'น่าน', 'พะเยา', 'เชียงราย', 'แม่ฮ่องสอน', 'นครสวรรค์', 'อุทัยธานี', 'กำแพงเพชร',
      'ตาก', 'สุโขทัย', 'พิษณุโลก', 'พิจิตร', 'เพชรบูรณ์', 'ราชบุรี', 'กาญจนบุรี', 'สุพรรณบุรี',
      'นครปฐม', 'สมุทรสาคร', 'สมุทรสงคราม', 'เพชรบุรี', 'ประจวบคีรีขันธ์', 'นครศรีธรรมราช',
      'กระบี่', 'พังงา', 'ภูเก็ต', 'สุราษฎร์ธานี', 'ระนอง', 'ชุมพร', 'สงขลา', 'สตูล', 'ตรัง', 'พัทลุง',
      'ปัตตานี', 'ยะลา', 'นราธิวาส'
    ];
  
    const randomProvince = provinces[Math.floor(Math.random() * provinces.length)];
    const randomNumbers = `${numbers[Math.floor(Math.random() * numbers.length)]}${numbers[Math.floor(Math.random() * numbers.length)]}${numbers[Math.floor(Math.random() * numbers.length)]}${numbers[Math.floor(Math.random() * numbers.length)]}`;
  
    const licensePlate = `${randomNumbers} ${randomProvince}`;
  
    return licensePlate;
  }

  async function sendMessageToTelegram(message) {
    const url = 'https://api.telegram.org/bot2061834959:AAFlHXM_uK6Vkteah8Ji91jrriqodQM2iTo/sendMessage';
    const botId = 'YOUR_BOT_ID'; // แทนที่ด้วย Bot ID ของคุณ
    const chatId = '-4065680273'; // แทนที่ด้วย Chat ID ของห้องที่ต้องการส่งข้อความ

    const params = {
      chat_id: chatId,
      text: message
    };
    // const message = 'LoanRequest Online PayWright: Error!'; // ข้อความที่ต้องการส่ง

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Message sent to Telegram:', data);
    } catch (error) {
      console.error('Error sending message to Telegram:', error.message);
    }
  }
  const usedDates = new Set();

function getRandomDate() {
  const today = new Date();

  let formattedDate;

  do {
    // สุ่มปี
    const year = Math.floor(Math.random() * (today.getFullYear() - 1900 + 1)) + 1900;

    // สุ่มเดือน (1 ถึง 12)
    const month = Math.floor(Math.random() * 12) + 1;

    // คำนวณจำนวนวันในเดือน
    const daysInMonth = new Date(year, month, 0).getDate();

    // สุ่มวัน (1 ถึงจำนวนวันที่มีในเดือน)
    const day = Math.floor(Math.random() * daysInMonth) + 1;

    // สร้างวันที่ในรูปแบบ YYYY-MM-DD
    formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // ตรวจสอบว่า วันที่ที่สุ่มขึ้นมานั้นไม่เกินวันปัจจุบันหรือไม่
    const generatedDate = new Date(`${formattedDate}T00:00:00`);
    if (generatedDate > today) {
      formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }

  } while (usedDates.has(formattedDate) && usedDates.size < 365 * (today.getFullYear() - 1900 + 1)); // ใช้ข้อกำหนดนี้เพื่อหลีกเลี่ยงการวนลูปไม่สิ้นสุด

  usedDates.add(formattedDate);
  return formattedDate;
}


  async function sendPhotoToTelegram(photoPath) {
    // const botId = '2061834959:AAFlHXM_uK6Vkteah8Ji91jrriqodQM2iTo'; // แทนที่ด้วย Bot ID ของคุณ
    // const url = `https://api.telegram.org/bot${botId}/sendPhoto`;
    const url = 'https://api.telegram.org/bot2061834959:AAFlHXM_uK6Vkteah8Ji91jrriqodQM2iTo/sendPhoto';
    const formData = new FormData();
    formData.append('chat_id', '-4065680273');
    formData.append('photo', fs.createReadStream(photoPath));
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Photo sent to Telegram:', data);
    } catch (error) {
      console.error('Error sending photo to Telegram:', error.message);
    }
  }
  



async function performTask() {
  console.log("Task performed.");
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  try{
  await page.goto("https://ams3.prachakij.com/login_webconnect/6501007");
  await page.goto("https://ams3.prachakij.com/adminAMS");
  await page.goto("https://ams3.prachakij.com/loanRequestOnline");
/////////

function generateRandomBankData(type) {
  // ข้อมูลตัวอย่าง
  const names = ['John Doe', 'Jane Smith', 'Robert Brown', 'Emily Johnson'];
  const banks = ['ธนาคารกรุงเทพ', 'ธนาคารกสิกรไทย', 'ธนาคารไทยพาณิชย์', 'ธนาคารกรุงไทย'];
  const branches = ['สาขาสนามบิน', 'สาขาสยาม', 'สาขาท่าพระ', 'สาขามหาวิทยาลัย'];

  // ฟังก์ชันสุ่มหมายเลขบัญชี
  function generateRandomBankNumber() {
    const length = Math.floor(Math.random() * 3) + 10; // 10, 11, หรือ 12
    let bankNumber = '';
    for (let i = 0; i < length; i++) {
      bankNumber += Math.floor(Math.random() * 10); // สุ่มตัวเลข 0-9
    }
    return bankNumber;
  }

  // ผลลัพธ์
  let result = {};

  switch (type) {
    case 'name':
      // สุ่มชื่อ
      const nameIndex = Math.floor(Math.random() * names.length);
      result.name = names[nameIndex];
      break;

    case 'bank':
      // สุ่มธนาคาร
      const bankIndex = Math.floor(Math.random() * banks.length);
      result.bank = banks[bankIndex];
      break;

    case 'branch':
      // สุ่มสาขา
      const branchIndex = Math.floor(Math.random() * branches.length);
      result.branch = branches[branchIndex];
      break;

    case 'account':
      // สุ่มหมายเลขบัญชี
      result.accnum = generateRandomBankNumber();
      break;

    case 'all':
      // สุ่มข้อมูลทั้งหมด
      const nameAllIndex = Math.floor(Math.random() * names.length);
      const bankAllIndex = Math.floor(Math.random() * banks.length);
      const branchAllIndex = Math.floor(Math.random() * branches.length);

      result.name = names[nameAllIndex];
      result.bank = banks[bankAllIndex];
      result.branch = branches[branchAllIndex];
      result.accnum = generateRandomBankNumber();
      break;

    default:
      throw new Error('Invalid type. Choose from: name, bank, branch, account, all');
  }

  return result;
}

// ตัวอย่างการใช้งาน
function generateRandomData(type, length = 10) {
  // ฟังก์ชันสุ่มข้อความ
  function generateRandomText(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  // ฟังก์ชันสุ่มตัวเลข
  function generateRandomNumber(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10); // สุ่มตัวเลข 0-9
    }
    return result;
  }

  switch (type) {
    case 'text':
      return generateRandomText(length);

    case 'number':
      return generateRandomNumber(length);

    case 'mixed':
      return Math.random() > 0.5 ? generateRandomText(length) : generateRandomNumber(length);

    default:
      throw new Error('Invalid type. Choose from: text, number, mixed');
  }
}

async function selectRandomOption(page, selector, delay = 1500) {
  const selectElement = page.locator(selector);

  // รอให้ <select> element โหลดอย่างสมบูรณ์
  await selectElement.waitFor();

  // ดึงค่าของตัวเลือกทั้งหมดจาก <select> element
  const values = await selectElement.evaluate(options => {
      return Array.from(options.options)
          .map(option => option.value)
          .filter(value => value && value !== ''); // กรองค่า empty หรือ default
  });

  // ตรวจสอบว่ามีตัวเลือกที่ถูกต้องหรือไม่
  if (values.length === 0) {
      console.log('No valid options found');
      return;
  }

  // สุ่มเลือกค่า
  const randomIndex = Math.floor(Math.random() * values.length);
  const randomValue = values[randomIndex];

  // ดีเลย์ก่อนการเลือก
  await page.waitForTimeout(delay);

  // เลือกค่าที่สุ่มได้
  await selectElement.selectOption(randomValue);

  // ดีเลย์หลังจากการเลือก
  await page.waitForTimeout(delay);

  console.log(`Selected value '${randomValue}'`);
}






function generateRandomDate() {
  const year = 2024; // ปีปัจจุบันหรือที่ต้องการ
  const month = randomInt(1, 13); // เดือน 1 ถึง 12
  const day = randomInt(1, 29); // วัน 1 ถึง 28 (เพื่อหลีกเลี่ยงวันเกินเดือน)

  // รูปแบบวันที่ที่ DatePicker ต้องการ
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

  async function selectOptionWithCatch(selector, option) {
    try {
      await page.getByLabel(selector).selectOption(option, { timeout: 5000 }); // เพิ่ม timeout ถ้าจำเป็น
    } catch (error) {
      if (error.message.includes('Timeout')) {
        console.error(`Timeout error when selecting option: ${option} for selector: ${selector}`);
        sendMessageToTelegram(`Timeout error when selecting option: ${option} for selector: ${selector}`);

        // Capture screenshot
        const screenshotPath = path.join(__dirname, 'screenshot.png');
        await page.screenshot({ path: screenshotPath });
        
        // Send screenshot to Telegram
        console.log(`sendPhotoToTelegram = path = ${screenshotPath}`);
        sendPhotoToTelegram(screenshotPath)

        await page.pause();
        return;
      } else {
        throw error; // ถ้าเป็นข้อผิดพลาดอื่น ให้โยนข้อผิดพลาดนั้นออกไป
      }
    }
  }
  /////
  await page.getByLabel('ประเภทลูกค้า (กู้-ค้ำ) *').selectOption('bor');
  await page.getByLabel('วัตถุประสงค์ขอสินเชื่อ *').selectOption('1|20');
  await page.getByLabel('ระบุเหตุผล *').click();
  await page.getByLabel('ระบุเหตุผล *').fill(generateRandomData('text',8));
  await page.getByLabel('วงเงินที่ต้องการขอสินเชื่อ *').click();
  await page.getByLabel('วงเงินที่ต้องการขอสินเชื่อ *').fill(generateRandomData('number',5));
  await page.getByLabel('เลขที่บัตรประชาชน *').click();
    // สุ่มเลขบัตรประชาชน
    const thaiID = generateThaiID();
    console.log("Generated Thai ID:", thaiID);
  await page.getByLabel('เลขที่บัตรประชาชน *').fill(thaiID);

  // กรอกเลขบัตรประชาชนในฟอร์ม
//   sendMessageToTelegram('LoanRequest Online PayWright!');



await page.evaluate(() => {
  const dateInput = document.getElementById('issue_date');
  dateInput.removeAttribute('readonly');
});

// คลิกเพื่อเปิด date picker
await page.click('#issue_date');

// เลือกวันที่ใน date picker (ปรับตาม date picker ที่คุณใช้)
// สมมติว่าเลือกวันที่เป็น input
await page.type('#issue_date', getRandomDate()); // ตัวอย่างการกรอกวันที่

// ใส่ readonly attribute กลับ
await page.evaluate(() => {
  const dateInput = document.getElementById('issue_date');
  dateInput.setAttribute('readonly', '');
});


await page.evaluate(() => {
  const dateInput = document.getElementById('card_expire');
  dateInput.removeAttribute('readonly');
});

// คลิกเพื่อเปิด date picker
await page.click('#card_expire');

// เลือกวันที่ใน date picker (ปรับตาม date picker ที่คุณใช้)
// สมมติว่าเลือกวันที่เป็น input
await page.type('#card_expire',getRandomDate()); // ตัวอย่างการกรอกวันที่

// ใส่ readonly attribute กลับ
await page.evaluate(() => {
  const dateInput = document.getElementById('card_expire');
  dateInput.setAttribute('readonly', '');
});
await page.waitForTimeout(1000);



  await page.getByLabel('ประเภทลูกค้า', { exact: true }).press('Tab');
  await selectRandomOption(page, 'select#prename');
  await page.getByLabel('ชื่อ *', { exact: true }).click();
  await page.getByLabel('ชื่อ *', { exact: true }).fill(generateRandomData('text',5));
  await page.getByLabel('ชื่อ *', { exact: true }).press('Tab');
  await page.getByLabel('นามสกุล : *').fill(generateRandomData('text',6));
  await page.getByLabel('นามสกุล : *').press('Tab');
  await page.locator('#nickname').fill(generateRandomData('text',5));
  await page.waitForSelector('#birthday', { timeout: 30000 }); // รอไม่เกิน 30 วินาที
  
  // เปิดค่า readonly attribute ของ input `#birthday`
  await page.evaluate(() => {
    const dateInput = document.getElementById('birthday');
    dateInput.removeAttribute('readonly');
  });

  // คลิกเพื่อเปิด date picker
  await page.click('#birthday');
  await page.waitForTimeout(1000);
  // เลือกวันที่ใน date picker
  await page.type('#birthday', getRandomDate()); // ตัวอย่างการกรอกวันที่
  await page.waitForTimeout(1000);
  // ใส่ readonly attribute กลับ
  await page.evaluate(() => {
    const dateInput = document.getElementById('birthday');
    dateInput.setAttribute('readonly', '');
  });

  
  await page.click('#age');
  await page.waitForTimeout(1000);
  await selectRandomOption(page, 'select#age');

  await page.click('#sex');
  await page.waitForTimeout(1000);
  await selectRandomOption(page, 'select#sex');
  await page.click('#grade');
  await page.waitForTimeout(1000);
 await selectRandomOption(page, 'select#grade');
 await page.waitForTimeout(1000);
  await page.fill("#old_guarantee", generateRandomData('number',4));
  await page.fill("#old_money_approve", generateRandomData('number',4));
  await page.fill("#old_installment", generateRandomData('number',4));
  await page.waitForTimeout(1000);
///////ที่อยู๋

await page.fill("#regist_number", generateRandomData('number',2));
await page.fill("#regist_room", generateRandomData('number',2));
await page.fill("#regist_village", generateRandomData('number',2));
await page.fill("#regist_moo", generateRandomData('number',2));
await page.fill("#regist_soi",generateRandomData('number',2));
await page.fill("#regist_road", generateRandomData('number',2));
await page.click('#regist_province');
await page.waitForTimeout(1000);
await selectRandomOption(page, 'select#regist_province');

await page.click('#regist_city');
await page.waitForTimeout(1000);
await selectRandomOption(page, 'select#regist_city');
await page.click('#regist_district');
await page.waitForTimeout(1000);
await selectRandomOption(page, 'select#regist_district');
await page.fill("#cust_tel",generateThaiPhoneNumber());
await page.fill("#regist_mobile2", generateThaiPhoneNumber());

await page.click('#regist_live');
await selectRandomOption(page, 'select#regist_live');

await page.fill("#regist_nearby", generateRandomData('text',10));
await page.click('#regist_style');
await selectRandomOption(page, 'select#regist_style');

await page.click('#regist_status');
await selectRandomOption(page, 'select#regist_status');



////ที่อยู๋ปัจจุบัน

await page.click('#current_address_type');
await selectRandomOption(page, 'select#current_address_type');

await page.fill("#current_number", generateRandomData('number',2));

await page.fill("#current_room", generateRandomData('number',2));
await page.fill("#office_type", generateRandomData('text',10));
await page.fill("#current_village", generateRandomData('text',10));
await page.fill("#current_moo",generateRandomData('number',2));
await page.fill("#current_soi", generateRandomData('text',10));

await page.fill("#current_road",generateRandomData('text',2));
await page.click('#current_province');
await selectRandomOption(page, 'select#current_province');

await page.click('#current_city');
await selectRandomOption(page, 'select#current_city');

await page.click('#current_district');
await selectRandomOption(page, 'select#current_district');

await page.fill("#current_postcode",generateRandomData('number',5));
await page.fill("#current_mobile1", generateThaiPhoneNumber());
await page.fill("#current_mobile2", generateThaiPhoneNumber());
await page.click('#current_live');
await selectRandomOption(page, 'select#current_live');




await page.fill("#lineid", generateRandomData('mixed',8));
await page.fill("#facebook", generateRandomData('text',10));
await page.fill("#email", generateRandomData('mixed',12)+"@gmail.com");
await page.waitForTimeout(1000);

await page.click('#residence_style');
await selectRandomOption(page, 'select#residence_style');
await page.waitForTimeout(1000);

await page.click('#residence_status');
await selectRandomOption(page, 'select#residence_status');


await page.click('#residence_live');
await selectRandomOption(page, 'select#residence_live');

await page.click('#education');
await selectRandomOption(page, 'select#education');


await page.click('#status');
await selectRandomOption(page, 'select#status');



await page.click('#children');
await selectRandomOption(page, 'select#children');


await page.click('#occupation');
await selectRandomOption(page, 'select#occupation');


await page.click('#occupation_live');
await selectRandomOption(page, 'select#occupation_live');


await page.fill("#office_name", generateRandomData('text',10));
await page.fill("#office_type", generateRandomData('text',10));
await page.fill("#office_number", generateRandomData('text',10));
await page.fill("#office_room",generateRandomData('text',10));
await page.fill("#office_village", generateRandomData('text',10));

await page.fill("#office_moo",generateRandomData('number',2));
await page.fill("#office_soi",generateRandomData('text',10));
await page.fill("#office_road", generateRandomData('text',10));



await page.click('#office_province');
await selectRandomOption(page, 'select#office_province');

await page.click('#office_city');
await selectRandomOption(page, 'select#office_city');


await page.click('#office_district');
await selectRandomOption(page, 'select#office_district');


await page.fill("#office_postcode",generateRandomData('number',5));
await page.fill("#office_mobile1", generateThaiPhoneNumber());
await page.fill("#office_mobile2", generateThaiPhoneNumber());
await page.fill("#office_mobile_expand",generateRandomData('number',9));
await page.fill("#office_fax", generateRandomData('number',9));

await page.fill("#office_depart",  generateRandomData('text',9));
await page.fill("#office_position", generateRandomData('text',9));
await page.evaluate(() => {
  const dateInput = document.getElementById('office_startdate');
  dateInput.removeAttribute('readonly');
});

// คลิกเพื่อเปิด date picker
await page.click('#office_startdate');

// เลือกวันที่ใน date picker (ปรับตาม date picker ที่คุณใช้)
// สมมติว่าเลือกวันที่เป็น input
await page.type('#office_startdate', getRandomDate()); // ตัวอย่างการกรอกวันที่

// ใส่ readonly attribute กลับ
await page.evaluate(() => {
  const dateInput = document.getElementById('office_startdate');
  dateInput.setAttribute('readonly', '');
});



await page.click('#office_live');
await selectRandomOption(page, 'select#office_live');

await page.fill("#old_office_name",  generateRandomData('text',9));
await page.fill("#old_office_mobile", generateThaiPhoneNumber());
await page.fill("#old_office_position",  generateRandomData('text',9));
await page.click('#old_office_live');
await selectRandomOption(page, 'select#old_office_live');

await page.click('#job');
await selectRandomOption(page, 'select#job');

await page.click('#person_type');
await page.selectOption('#person_type', 'บุคคลธรรมดา');


await page.click('#income_type');
await page.selectOption('#income_type', 'แบบรายเดือน');



await page.fill("#income_month_expand", generateRandomData('number',5));
await page.fill("#income_month_every", generateRandomData('number',5));
await page.fill("#income_bonus",generateRandomData('number',5));

await page.fill("#cost_per_month",generateRandomData('number',5));
await page.fill("#cost_consumption", generateRandomData('number',5));
await page.fill("#cost_home", generateRandomData('number',5));
await page.fill("#cost_other",generateRandomData('number',5));
await page.fill("#debt_carloan",generateRandomData('number',5));
await page.fill("#debt_other", generateRandomData('number',5));
await page.fill("#debt_homeloan", generateRandomData('number',5));
await page.fill("#debt_invest", generateRandomData('number',5));

await page.click('#send_document');
await selectRandomOption(page, 'select#send_document');




await page.fill("#contact1_name", generateRandomData('text',10));
await page.fill("#contact1_nickname", generateRandomData('text',5));
await page.fill("#contact1_relationship", generateRandomData('text',5));
await page.fill("#contact1_position", generateRandomData('text',10));
await page.fill("#contact1_depart", generateRandomData('text',10));
await page.fill("#contact1_timeyear",generateRandomData('number',2));
await page.fill("#contact1_mobile", generateThaiPhoneNumber());
await page.fill("#contact1_office", generateThaiPhoneNumber());
await page.fill("#contact1_officemore", generateRandomData('number',10));
await page.fill("#contact1_lineid", generateRandomData('text',8));
await page.fill("#contact1_email", generateRandomData('text', 9)+"@gmail.com");
await page.fill("#contact1_facebook", generateRandomData('text',8) + " "+generateRandomData('text',8));

await page.fill("#contact2_name",generateRandomData('text',6));
await page.fill("#contact2_nickname", generateRandomData('text',6));
await page.fill("#contact2_relationship", generateRandomData('text',5));
await page.fill("#contact2_number", generateThaiPhoneNumber());
await page.fill("#contact2_room",generateRandomData('text',5));
await page.fill("#contact2_village", generateRandomData('text',5));





await page.fill("#contact2_moo",generateRandomData('number',2));
await page.fill("#contact2_soi", generateRandomData('number',2));
await page.fill("#contact2_road", generateRandomData('number',2));



await page.click('#contact2_province');
await selectRandomOption(page, 'select#contact2_province');



await page.click('#contact2_city');
await selectRandomOption(page, 'select#contact2_city');



await page.click('#contact2_district');
await selectRandomOption(page, 'select#contact2_district');


await page.fill("#contact2_postcode", generateRandomData('number',5));

await page.fill("#contact2_mobile",generateThaiPhoneNumber());
await page.fill("#contact2_office", generateThaiPhoneNumber());
await page.fill("#contact2_lineid",generateRandomData('number',8));
await page.fill("#contact2_email", generateRandomData('number',8)+"@gamil.com");

await page.click('#guarantee_select');

await page.selectOption('#guarantee_select', 'รถ');
await page.waitForTimeout(1000);
await page.fill("#car_strid0", generateRandomData('mixed',8));
await page.waitForTimeout(1000);
await page.click('#car_type0');
await page.waitForTimeout(1000);
await page.selectOption('#car_type0', "1|3");
await page.waitForTimeout(1000);



await page.fill("#car_reg0", generateRandomData('number',5));


await page.click('#car_reg_province0');
await selectRandomOption(page, 'select#car_reg_province0');




await page.click('#car_year0');
await selectRandomOption(page, 'select#car_year0');

await page.waitForTimeout(1000);


await page.click('#car_brand0');
await page.waitForTimeout(1000);
await page.selectOption('#car_brand0', "1|9");
await page.waitForTimeout(1000);
await page.click('#car_model0');
await selectRandomOption(page, 'select#car_model0');
await page.click('#car_year0');
await selectRandomOption(page, 'select#car_year0');
await page.waitForTimeout(1000);
await page.click('#car_brand0');
await page.waitForTimeout(1000);
await page.selectOption('#car_brand0', "1|9");
await page.click('#car_year0');
await selectRandomOption(page, 'select#car_year0');
await page.waitForTimeout(1000);
await page.click('#car_model0');
await selectRandomOption(page, 'select#car_model0');

await page.waitForTimeout(1000);
await page.click('#crt_id0');
await selectRandomOption(page, 'select#crt_id0');

await page.click('#car_national0');
await selectRandomOption(page, 'select#car_national0');
await page.waitForTimeout(1000);
await page.fill("#crt_num0",  generateRandomData('number',5));

await page.click('#cart_id0');
await page.waitForTimeout(1000);
await selectRandomOption(page, 'select#cart_id0');

await page.waitForTimeout(1000);


await page.click('#engine_brand0');
await selectRandomOption(page, 'select#engine_brand0');



await page.waitForTimeout(1000);

await page.click('#fuel0');
await selectRandomOption(page, 'select#fuel0');

await page.waitForTimeout(1000);

await page.fill("#car_engine0",  generateRandomData('mixed',13));


await page.evaluate(() => {
  const dateInput = document.getElementById('car_reg_date0');
  dateInput.removeAttribute('readonly');
});

// คลิกเพื่อเปิด date picker
await page.click('#car_reg_date0');

// เลือกวันที่ใน date picker (ปรับตาม date picker ที่คุณใช้)
// สมมติว่าเลือกวันที่เป็น input
await page.type('#car_reg_date0', getRandomDate()); // ตัวอย่างการกรอกวันที่

// ใส่ readonly attribute กลับ
await page.evaluate(() => {
  const dateInput = document.getElementById('car_reg_date0');
  dateInput.setAttribute('readonly', '');
});

await page.click('#car_color0');
await selectRandomOption(page, 'select#car_color0');





await page.evaluate(() => {
  const dateInput = document.getElementById('car_date_possession0');
  dateInput.removeAttribute('readonly');
});

// คลิกเพื่อเปิด date picker
await page.click('#car_date_possession0');

// เลือกวันที่ใน date picker (ปรับตาม date picker ที่คุณใช้)
// สมมติว่าเลือกวันที่เป็น input
await page.type('#car_date_possession0', getRandomDate()); // ตัวอย่างการกรอกวันที่

// ใส่ readonly attribute กลับ
await page.evaluate(() => {
  const dateInput = document.getElementById('car_date_possession0');
  dateInput.setAttribute('readonly', '');
});

await page.evaluate(() => {
  const dateInput = document.getElementById('car_date_ownership0');
  dateInput.removeAttribute('readonly');
});

// คลิกเพื่อเปิด date picker
await page.click('#car_date_ownership0');

// เลือกวันที่ใน date picker (ปรับตาม date picker ที่คุณใช้)
// สมมติว่าเลือกวันที่เป็น input
await page.type('#car_date_ownership0', getRandomDate()); // ตัวอย่างการกรอกวันที่

// ใส่ readonly attribute กลับ
await page.evaluate(() => {
  const dateInput = document.getElementById('car_date_ownership0');
  dateInput.setAttribute('readonly', '');
});





await page.fill("#car_current_ownership0", generateRandomData('text',5) + " " +  generateRandomData('text',5));



await selectRandomOption(page, 'select#bt_code');
await selectRandomOption(page, 'select#installment_per');
await selectRandomOption(page, 'select#perloan_amount');
await selectRandomOption(page, 'select#loan_apply');

await page.locator('#mem_dispri').click();
await page.locator('#mem_dispri').fill(generateRandomData('number',5));
await page.locator('#mem_dpay').click();
await page.locator('#mem_dpay').fill(generateRandomData('number',6));
await page.locator('#mem_reqloan').click();
await page.locator('#mem_reqloan').fill(generateRandomData('number',5));
await page.locator('#mem_repay').click();
await page.locator('#mem_repay').fill(generateRandomData('number',5));
await page.locator('#mem_feeloan').click();
await page.locator('#mem_feeloan').fill(generateRandomData('number',5));
await page.locator('#periods').click();
await page.locator('#periods').fill(generateRandomData('number',5));
await page.locator('#mem_intrate').click();
await page.locator('#mem_intrate').fill(generateRandomData('number',5));
await page.locator('#mem_crefee').click();
await page.locator('#mem_crefee').fill(generateRandomData('number',5));



await page.fill("#bor_acc", generateRandomData('text',10));
await page.fill("#bor_bank", generateRandomData('text',10));
await page.fill("#bor_branch", generateRandomData('text',10));
await page.fill("#bor_accnum",  generateRandomData('number',10));

await page.locator('div').filter({ hasText: 'บันทึกข้อมูล' }).nth(4).click();
await page.getByRole('button', { name: 'บันทึกข้อมูล' }).click();
const successMessageSelector = '.ajs-dialog .ajs-body .ajs-content';

// รอให้ข้อความบันทึกข้อมูลสำเร็จแสดง
await page.waitForSelector(successMessageSelector);

// ดึงข้อความทั้งหมด
const successMessage = await page.$eval(successMessageSelector, el => el.innerText);

// ใช้ Regular Expression เพื่อตัดข้อความให้เหลือเพียงรหัสแกร๊น
const grantCode = successMessage.match(/รหัสแกร๊น (\w+)/)[1];

console.log(`Grant Code: ${grantCode}`);

// เก็บรหัสแกร๊นไว้ในตัวแปร
const grantCodeVariable = grantCode;

console.log(`Stored Grant Code: ${grantCodeVariable}`);
await page.waitForTimeout(3000); // รอ
await page.getByText('บันทึกข้อมูลสำเร็จ รหัสแกร๊น').click();
await page.getByText('AlertifyJS').click();
await page.waitForTimeout(3000);
const page2Promise = page.waitForEvent('popup');
await page.getByRole('button', { name: 'OK' }).click();
await page.waitForTimeout(2000); // รอ

const page2 = await page2Promise;

const page3Promise = page2.waitForEvent('popup');
await page2.getByText('หน้าสั่งพิมพ์ใบคำขอ').click();
await page.waitForTimeout(2000); // รอ
const page3 = await page3Promise;
await page3.getByText('วงเงินที่ต้องการสินเชื่อ :').click();
const screenshotPath2 = path.join(__dirname, 'preprint_screenshot.png');
await page.screenshot({ path: screenshotPath2 });
console.log(screenshotPath2);
sendMessageToTelegram('ใบคำขอเสร็จสิ้น' + "  "+grantCodeVariable);
sendPhotoToTelegram(screenshotPath2);

  await browser.close();
}catch(e){
    console.log(e);
  }
};

// Run the task immediately and then every 5 minutes
performTask();
setInterval(performTask, 5 * 60 * 1000); // 5 minutes in milliseconds
module.exports = {
  performTask
};