//libraries
const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('csv-parser');
const createMobilePhoneNumber = require("random-mobile-numbers");

//urls needed
const MainPage = "https://www.endclothing.com/gb";
const AddAddress = "https://www.endclothing.com/gb/account/addresses/shipping/new";
const AddPayment = "https://www.endclothing.com/gb/account/payment/new";

//traversal values for main page
var accCreateBtn = '#header > .sc-1twhoz0-0.fXLutV > .sc-1twhoz0-1.jVVkol > .sc-vusgcu-0.gBDVL > button.sc-vusgcu-1.bnFktA';
var email = '#email';
var continueBtn = 'form.sc-1q89kqk-3.Yjnya > div[style="width: 100%;"] > button.sc-4czj8x-1.qPWis.sc-1q89kqk-5.gmgGIS';
var fname = '#first_name';
var sname = '#last_name';
var pass = '#password';
var continueBtn2 = 'button[type="submit"]';
var loginBtn = 'form.sc-1q89kqk-3.Yjnya > div[style="width: 100%;"] > button.sc-4czj8x-1.qPWis.sc-1q89kqk-5.gmgGIS';

//traversal values for adding address
var phone = 'div.sc-fotOHu.ijqJjf.telephone > input[name="telephone"]';
var enterAddBtn = 'div.sc-cidDSM.hzWZxk > .sc-llYSUQ.eahrbo > button.sc-iwjdpV.fyWLwm';
var address = 'div.sc-qn86mo-1.shRzT > .sc-kfPuZi.uiKSk > input[name="addressLine1"]';
var address2 = 'div.sc-qn86mo-1.shRzT > .sc-kfPuZi.uiKSk > input[name="addressLine2"]';
var town = 'div.sc-qn86mo-1.keLcMm > .sc-kfPuZi.uiKSk > input[name="city"]';
var county = 'div.sc-qn86mo-1.keLcMm > .sc-kfPuZi.uiKSk > input[name="region"]';
var postcode = 'div.sc-qn86mo-1.keLcMm > .sc-kfPuZi.uiKSk > input[name="postcode"]';
var submitAddressBtn = '#shippingAddressFormContinueButton';

//traversal values for adding payment
var cardNumber = '#credit-card-number';
var expiration = '#expiration';
var cvv = '#cvv';
var submitCardBtn = 'form > div.sc-wt0pty-11.gXTGDf > button.sc-pg2esq-1.uhiv.sc-wt0pty-7.bKXTkt';

//CHANGE THIS TO THE PATH OF THE CSV FILE
const CsvFilePath = 'active.csv';

//file path to list of proxies
const ProxiesFilePath = 'proxies.txt';

//Create values for time in milliseconds
const minute = 1000 * 60;
const hour = minute * 60;

//create sleep fucntion
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('Starting...');

var proxies;

proxies = fs.readFileSync(ProxiesFilePath, 'utf8').split("\n").map(r => r.split(":"));

var j = Math.floor(Math.random() * (proxies.length - 1))
var errCount = 0;

var badAccounts = [];
var badAccountPos = [];

var results = [];
fs.createReadStream(CsvFilePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        console.log('CSV file successfully read...');

        //loop through async functions one at a time
        (async () => {
            for (i = 0; i < results.length; i++) {

                //proxy info
                var proxyUrl = proxies[j][0] + ':' + proxies[j][1];
                var proxyUser = proxies[j][2];
                var proxyPass = proxies[j][3];
                j++;

                //inputs
                var fnameCsv = results[i][Object.keys(results[i])[3]];
                var snameCsv = results[i][Object.keys(results[i])[4]];
                var emailCsv = results[i][Object.keys(results[i])[0]];
                var phoneCsv = createMobilePhoneNumber("UK");
                var passCsv = results[i][Object.keys(results[i])[1]];
                var postcodeCsv = results[i][Object.keys(results[i])[8]];
                var addressCsv = results[i][Object.keys(results[i])[5]];
                var address2Csv = results[i][Object.keys(results[i])[6]];
                var cityCsv = results[i][Object.keys(results[i])[7]];
                var countyCsv = results[i][Object.keys(results[i])[9]];

                var cardNumberCsv = results[i][Object.keys(results[i])[11]];
                var expirationMCsv = results[i][Object.keys(results[i])[12]];
                var expirationYCsv = results[i][Object.keys(results[i])[13]];
                var cvvCsv = results[i][Object.keys(results[i])[14]];

                var check = await AccountCreation(fnameCsv, snameCsv, emailCsv, phoneCsv, passCsv, postcodeCsv, addressCsv, address2Csv, cityCsv, countyCsv, cardNumberCsv, expirationMCsv, expirationYCsv, cvvCsv, proxyUrl, proxyUser, proxyPass, i);

                if (check == false) {
                    if (errCount == 3) {
                        //console.log(`Blocked too many times, ${i + 1}. ${emailCsv} skipped...`);
                        console.log('\x1b[31m%s\x1b[0m', `Blocked too many times, waiting...`);
                        //badAccounts.push(emailCsv);
                        //badAccountPos.push(i);
                        errCount = 0;
                        i--;
                        await sleep(30 * minute);                      
                    } else {
                        i--;
                        errCount++;
                    }
                    check = true;
                    await sleep(5000);
                } else {
                    errCount = 0;
                    console.log('\x1b[32m%s\x1b[0m', `${i + 1}. ${emailCsv} created...`);
                }

                await sleep(Math.floor(Math.random() * 5000) + 10000);

                if (j == proxies.length) {
                    j = 0;
                }

            }
            await console.log(`Bad accounts: ${badAccounts}`);



        })();
    });

async function AccountCreation(fnameInp, snameInp, emailInp, phoneInp, passInp, postcodeInp, addressInp, address2Inp, cityInp, countyInp, cardNumberInp, expirationMInp, expirationYInp, cvvInp, proxyUrl, proxyUser, proxyPass, i) {
    try {
        //connect to localhost proxy
        browser = await puppeteer.launch({
            args: ['--proxy-server=' + proxyUrl, '--start-maximized'],
            //args: ['--start-maximized'],
            headless: false,
            slowMo: 80,
        });
        page1 = await browser.newPage();
        //console.log(`Connected to proxy ${proxyUser}...`);
    } catch (err) {
        console.log(colors.red.bold('Proxy not running...Connecting without proxy...'));
    }

    if (proxyUser !== '') {
        //console.log("Authenticating proxy user/pass...");
        await page1.authenticate({
            username: proxyUser,
            password: proxyPass
        });
    }

    try {
        //Create account
        await page1.setViewport({ width: 1920, height: 1080 });
        await page1.goto(MainPage);

        await page1.click(accCreateBtn);

        await page1.type(email, emailInp);
        await page1.click(continueBtn);
        await page1.waitForTimeout(1500);

        if (page1.url() === "https://www.endclothing.com/distil_r_drop.html") {
            console.log('\x1b[33m%s\x1b[0m', `Error creating account for ${emailInp}...`);
            browser.close();
            return false;
        } else {
            try {
                await page1
                    .waitForSelector(pass)
                    .then(() => page1.type(pass, passInp));
                await page1
                    .waitForSelector(pass)
                    .then(() => page1.type(fname, fnameInp));       
            } catch (e) {
                console.log('Account already created prior')
                browser.close();
                return;
            }
        }

        await page1.type(sname, snameInp);
        await page1.click(continueBtn2);

        await page1.waitForTimeout(1000);

        if (page1.url() === "https://www.endclothing.com/distil_r_drop.html") {
            console.log('\x1b[33m%s\x1b[0m', `Error creating account for ${emailInp}...`);
            browser.close();
            return false;
        }

    } catch (err) {
        console.log('\x1b[33m%s\x1b[0m', `Error creating account for ${emailInp}...`);
        browser.close();
        return false;
    }

    //try {
    ////Add address
    //    page2 = await browser.newPage();
    //    await page1.close();

    //    await page2.authenticate({
    //        username: proxyUser,
    //        password: proxyPass
    //    });

    //    await page2.setViewport({ width: 1920, height: 1080 });
    //    await page2.goto(AddAddress);

    //    await page2.type(email, emailInp);
    //    await page2.click(loginBtn);
        
    //    await page2.waitForTimeout(2000);
    //    if (page2.url() === "https://www.endclothing.com/distil_r_drop.html") {
    //        console.log('\x1b[33m%s\x1b[0m', `Address failed for ${i + 1}. ${emailInp}...`);
    //        browser.close();
    //        return false;
    //    } else {
    //        await page2.waitForSelector(pass);
    //    }
        
    //    await page2.type(pass, passInp);
    //    await page2.click(continueBtn2);

    //    await page2.waitForTimeout(1000);
    //    if (page2.url() === "https://www.endclothing.com/distil_r_drop.html") {
    //        console.log('\x1b[33m%s\x1b[0m', `Address failed for ${i + 1}. ${emailInp}...`);
    //        browser.close();
    //        return false;
    //    } else {
    //        await page2.waitForSelector(phone);
    //    }

    //    await page2.type(phone, phoneInp);
    //    await page2.click(enterAddBtn);
    //    await page2.type(address, addressInp);
    //    await page2.type(address2, address2Inp);
    //    await page2.type(town, cityInp);
    //    await page2.type(county, countyInp);
    //    await page2.type(postcode, postcodeInp);
    //    await page2.click(submitAddressBtn);
    //} catch (err) {
    //    console.log('\x1b[33m%s\x1b[0m', `Address failed for ${i + 1}. ${emailInp}...`);
    //    browser.close();
    //    return false;
    //}

    //try {
    //    //Add payment
    //    page3 = await browser.newPage();
    //    await page2.close();

    //    await page3.authenticate({
    //        username: proxyUser,
    //        password: proxyPass
    //    });

    //    await page3.setViewport({ width: 1920, height: 1080 });
    //    await page3.goto(AddPayment);

    //    await page3.type(email, emailInp);
    //    await page3.click(loginBtn);
        
    //    await page3.waitForTimeout(1000);
    //    if (page3.url() === "https://www.endclothing.com/distil_r_drop.html") {
    //        console.log('\x1b[33m%s\x1b[0m', `Payment failed for ${i + 1}. ${emailInp}...`);
    //        browser.close();
    //        return false;
    //    } else {
    //        await page3.waitForSelector(pass);
    //    }
        
    //    await page3.type(pass, passInp);
    //    await page3.click(continueBtn2);

    //    await page3.waitForTimeout(1000);
    //    if (page3.url() === "https://www.endclothing.com/distil_r_drop.html") {
    //        console.log('\x1b[33m%s\x1b[0m', `Payment failed for ${i + 1}. ${emailInp}...`);
    //        browser.close();
    //        return false;
    //    } else {
    //        await page3.waitForSelector(cardNumber);
    //    }

    //    await page3.type(cardNumber, cardNumberInp);
    //    await page3.type(expiration, expirationMInp + expirationYInp);
    //    await page3.type(cvv, cvvInp);
    //    await page3.click(submitCardBtn);
    //} catch (err) {
    //    console.log('\x1b[33m%s\x1b[0m', `Payment failed for ${i + 1}. ${emailInp}...`);
    //    browser.close();
    //    return false;
    //}

    //await page3.waitForTimeout(1500);
    await browser.close();
}

//async function redoAccounts() {
//    for (var i = 0; i < badAccountPos.length - 1; i++) {
//        var proxyUrl = proxies[j];
//        var proxyUser = proxyUserPass[j][0];
//        var proxyPass = proxyUserPass[j][1];

//        var emailCsv = results[badAccountPos[i]][Object.keys(results[badAccountPos[i]])[0]];
//        var fnameCsv = results[badAccountPos[i]][Object.keys(results[badAccountPos[i]])[1]];
//        var snameCsv = results[badAccountPos[i]][Object.keys(results[badAccountPos[i]])[2]];
//        var passCsv = results[badAccountPos[i]][Object.keys(results[badAccountPos[i]])[4]];
//    }
//}