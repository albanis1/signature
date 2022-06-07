const express = require('express');
const bodyParse = require('body-parser');
const cookieParser = require('cookie-parser');
const { isEmpty } = require('lodash');
const { google } = require('googleapis');
const BaseResponse = require('./Response/BaseResponse');
var nodemailer = require('nodemailer');
const app = express();
const config = require('./config/config');
const MD5 = require('blueimp-md5');
const Moment = require('moment');

const crypto = require('crypto');

const port = process.env.PORT || 5000;
app.use(bodyParse.urlencoded({extended: true}));
app.use(bodyParse.json());
app.use(cookieParser());

const CLIENT_ID = '484658006102-p0go4qsqmdlsd3rf9vttj9l3phkojeud.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URL = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04vdaY0y5N03yCgYIARAAGAQSNwF-L9Irg8WJRdUN6Ezm4MtXLTOCWd3lq5z6eKZtRKUYauyHRb4MJcAkhG7wamx5q0r4z7bIhDo';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});


app.post("/api/send", async (req,res) => {
  try {
    const { email, subjectEmail, messageEmail } = req.body;
    const accessToken = await oAuth2Client.getAccessToken();

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'info.sigit1@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken
      }
    });
    
    var mailOptions = {
      from: email,
      to: 'muhammadsigit330@gmail.com',
      subject: subjectEmail,
      text: messageEmail
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        res.send(BaseResponse.errorResponse(error));
      } else {
        res.send(BaseResponse.successResponse('Success Send e-Mail'));
      }
    });  
  } catch (error) {
    res.send(BaseResponse.errorResponse(error));
  }
});


const getESBCONFIG = () => {
  return { apiKey: 'hvnvdm29rexr4dkcgfspvy6x', secretKey: 'fyURgpkUeR' };
}

const getESBCONFIGPreprod = () => {
  return { apiKey: '85xu3zsymj69k84b8e7pxv2m', secretKey: '9jZRFNjEXc' };
}

/*

api safora : azm637xxzuemy34cqj8qjgp9
secrete key safora : geAadkPurK

api MEA : b5cr3btxhquan6rremvknz6t
secrete key MEA : RxYhgR2kma

api MEC : 85xu3zsymj69k84b8e7pxv2m
secrete key MEC : 9jZRFNjEXc

*/

const getCPQCONFIG = () => {
  return { apiKey: '4d1bb6e3d0094890', secretKey: 'f8b9a9c13a3f4912b866ef041ce3ddf9' };
}

const getMECCONFIG = () => {
  const apiKey = '2vmxxf2w4785ub2h5e9ytfbn';
  const secretKey = 'k7R4BWkAww';
  return {apiKey, secretKey};
}

const createEsbSignature = (apiKey, secretKey) => {
  const algorithm = 'md5';
  const timestamp = Math.round((new Date()).getTime() / 1000);
  const pattern = apiKey + secretKey + timestamp;

  const hash = crypto.createHash(algorithm).update(pattern).digest('hex');
  return hash;
};

const createTransactionId = (appId) => {
  const timeStamp = Moment().format('YYMMDDHHmmssSSS');
  const changeableDigit = '0';
  return [appId, timeStamp, changeableDigit].join('');
}

const createSaforaSignature = (apiKey, secretKey) => {
  const algorithm = 'md5';
  const timestamp = Math.round((new Date()).getTime() / 1000);
  const pattern = apiKey + secretKey + timestamp;

  const hash = crypto.createHash(algorithm).update(pattern).digest('hex');
  return hash;
};

const createCPQSignature = (apiKey, secretKey) => {
  const algorithm = 'md5';
  const timestamp = Math.round((new Date()).getTime() / 1000);
  const pattern = apiKey + secretKey + timestamp;

  const hash = crypto.createHash(algorithm).update(pattern).digest('hex');
  return hash;
};
// curl -X POST --header 'Accept: application/json' --header 'Content-Type: application/json' --header 'api_key: 2vmxxf2w4785ub2h5e9ytfbn' --header 'x-signature: 5efa37c2cd197bc987cba5d1605ef6d0' --data '{"transaction":{"transaction_id":"DSC2111021412331370","channel":"a8"},"payment":{"channel_trx_id":"bookingPayment-1635837153137","id_number":"CIS-1522","code":"62823234565555500574","description":"Payment","source_account_number":"8029210929151101","destination_account_number":"6200000000005","amount":"273396638"}}' 'https://api.digitalcore.telkomsel.co.id/scrt/esb/v1/virtual-account/pay' -vik

app.get("/api/signature", (req, res) => {
  const { user = '' } = req.query;
  let data = null;
  let theApiKey = null;
  let theSecretKey = null
  if (user === 'MEA') {
    theApiKey = getESBCONFIGPreprod().apiKey;
    theSecretKey = getESBCONFIGPreprod().secretKey;
    data = {
      'channel' : 'MEA',
      'x-signature': createEsbSignature(theApiKey, theSecretKey),
      'transaction-id' : createTransactionId('DSC')
    };
  } else if (user === 'CPQ') {
    theApiKey = getCPQCONFIG().apiKey;
    theSecretKey = getCPQCONFIG().secretKey;
    data = {
      'channel': 'CPQ',
      'x-signature': createCPQSignature(theApiKey, theSecretKey),
      'transaction-id' : createTransactionId('DSC')
    };
  } else if (user === 'MEC') {
    theApiKey = getMECCONFIG().apiKey;
    theSecretKey = getMECCONFIG().secretKey;
    data = {
      'channel': 'MEC',
      'x-signature': createCPQSignature(theApiKey, theSecretKey),
      'transaction-id' : createTransactionId('DSC'),
      'bookingPayment': 'bookingPayment-' + new Date().getTime()
    };
  } else {
    theApiKey = getMECCONFIG().apiKey;
    theSecretKey = getMECCONFIG().secretKey;
    data = {
      'channel': 'SAFORA',
      'x-signature': createCPQSignature(theApiKey, theSecretKey),
      'transaction-id' : createTransactionId('DSC'),
      'bookingPayment': 'bookingPayment-' + new Date().getTime()
    };
  }
  res.send(BaseResponse.successResponse(data));
});

app.listen(port, () => {
    console.log('Server running at '+ port);
})