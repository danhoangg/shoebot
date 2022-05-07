//libraries
const puppeteer = require('puppeteer');
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const csv = require('csv-parser');
const createMobilePhoneNumber = require("random-mobile-numbers");

//CHANGE THIS TO THE PATH OF THE CSV FILE
const CsvFilePath = 'size_dennis.csv';

//create sleep fucntion
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var results = [];
//loop through items in csv file
fs.createReadStream(CsvFilePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        console.log('CSV file read\n');

        //COMMENTED OUT LOCALHOST SERVER
        ////create express server
        //const app = express();

        ////config
        //var PORT = Math.floor(Math.random() * (9999 - 1024) + 1024);
        //var HOST = "localhost";
        //const API_SERVICE_URL = "https://jsonplaceholder.typicode.com";

        //var proxyUrl = `${HOST}:${PORT}`;

        ////logging in
        //app.use(morgan('dev'));

        //// Proxy endpoints
        //app.use('/json_placeholder', createProxyMiddleware({
        //    target: API_SERVICE_URL,
        //    changeOrigin: true,
        //    slowMo: 100,
        //    pathRewrite: {
        //        [`^/json_placeholder`]: '',
        //    },
        //}));

        //// Start the Proxy
        //app.listen(PORT, HOST, () => {
        //    console.log(`Starting Proxy at ${HOST}:${PORT}\n`);
        //});

        console.log('Starting Bot');

        (async () => {
            for (i = 0; i < results.length; i++) {

                //inputs
                var fnameCsv = await results[i][Object.keys(results[i])[2]];
                var snameCsv = await results[i][Object.keys(results[i])[3]];
                var emailCsv = await results[i][Object.keys(results[i])[0]];
                var phoneCsv = await createMobilePhoneNumber("UK");
                var passCsv = await results[i][Object.keys(results[i])[1]];
                var postcodeCsv = await results[i][Object.keys(results[i])[8]];
                var addressCsv = await results[i][Object.keys(results[i])[5]] + " " + results[i][Object.keys(results[i])[4]];
                var address2Csv = await results[i][Object.keys(results[i])[6]];
                var cityCsv = await results[i][Object.keys(results[i])[7]];
                var countyCsv = await results[i][Object.keys(results[i])[9]];

                var check = await AccountCreation(fnameCsv, snameCsv, emailCsv, phoneCsv, passCsv, postcodeCsv, addressCsv, address2Csv, cityCsv, countyCsv);

                //CHANGE PROXY
                if (!check) {
                    i--;
                }
                //READ TEXT FILE WITH PROXIES, ADD INTO ACCOUNT CREATION FUNCTION, OPEN BROWSER IN FUNCTION

            }
        })();
    });

async function AccountCreation(fnameInp, snameInp, emailInp, phoneInp, passInp, postcodeInp, addressInp, address2Inp, cityInp, countyInp) {

    //traversal values
    const AcceptCookies = 'div.bannerButtons > button.btn.btn-level1.accept-all-cookies';
    const fname = '#firstName';
    const sname = '#lastName';
    const email = 'input[type="email"]';
    const phone = '#phone';
    const password = '#password';
    const confpassword = '#confirmPassword';
    const addressMan = '#showAutoCompletables';
    const postcode = '#postcode';
    const address = '#address1';
    const address2 = '#address2';
    const city = '#town';
    const county = 'div.fs-grp.infoAddress > .fs-row.county-row.inp.PCA_autocompletable > span > .county.county-inp';
    const submit = 'div.fs-mod.accountCreateButton.register-confirm > .fs-mod-cnt > .fs-grp > .fs-row.but.act.hlb > span > button[type="submit"]';
    const popup = 'div.popupMessage > button.btn.btn-level3';

    var page;
    var browser;

    ////proxy details
    //var proxyUrl = "premium.candyproxies.com:7000";
    //var proxyUser = "user-candyproxiesNeIMv2Uzd0Yv-country-us-session-S3q8uH1l";
    //var proxyPass = "TO0Phdbt7nEG";

    ////start up proxy
    //browser = await puppeteer.launch({
    //    args: ['--proxy-server=' + proxyUrl], headless: false, slowMo: 10,
    //});
    //page = await browser.newPage();

    //console.log("authenticating proxy user/pass");
    //await page.authenticate({
    //    username: proxyUser,
    //    password: proxyPass
    //});

    browser = await puppeteer.launch({ headless: false});
    page = await browser.newPage();

    await page.setViewport({ width: 1100, height: 800 });
    await page.goto('https://www.size.co.uk/myaccount/register/');

    await page.waitForTimeout(2000);

    //accept cookies
    await page.click(AcceptCookies);

    //try {
    //    await page.click(AcceptCookies);
    //} catch (err) {
    //    await console.log('No promotional offer found');
    //}

    ////accept cookies and accept sales offer
    //try {
    //    await page.click(AcceptCookies);
    //} catch (err) {
    //    await console.log('Proxy Forbidden');
    //    return false;
    //}

    //enter information
    await page.type(fname, fnameInp);

    await page.type(sname, snameInp);

    await page.type(email, emailInp);

    await page.type(phone, phoneInp);

    await page.type(password, passInp);

    await page.type(confpassword, passInp);

    await page.click(addressMan);

    await page.type(postcode, postcodeInp);

    await page.type(address, addressInp);

    await page.type(address2, address2Inp);

    await page.type(city, cityInp);

    await page.type(county, countyInp);

    await page.waitForTimeout(2000);
    //register account
    await page.click(submit);

    try {
        await page.click(popup);
    } catch (err) {
        await page.screenshot({ path: 'AccountCreateErr.png' });
        await console.log('Account Creation Unsuccessful');
    }

    await browser.close();
};