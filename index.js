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

const getCPQCONFIG = () => {
  return { apiKey: '4d1bb6e3d0094890', secretKey: 'f8b9a9c13a3f4912b866ef041ce3ddf9' };
}

const createEsbSignature = (apiKey, secretKey) => {
  const algorithm = 'md5';
  const timestamp = Math.round((new Date()).getTime() / 1000);
  const pattern = apiKey + secretKey + timestamp;

  const hash = crypto.createHash(algorithm).update(pattern).digest('hex');
  return hash;
};

const createCPQSignature = (apiKey, secretKey) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = MD5(apiKey + secretKey + timestamp);
  return signature;
};

app.get("/api/signature", (req, res) => {
  const { user = '' } = req.query;
  let data = null;
  let theApiKey = null;
  let theSecretKey = null
  switch (user) {
    case 'MEA':
      theApiKey = getESBCONFIG().apiKey;
      theSecretKey = getESBCONFIG().secretKey;
      data = {
        'x-signature': createEsbSignature(theApiKey, theSecretKey)
      };
    case 'CPQ':
      theApiKey = getCPQCONFIG().apiKey;
      theSecretKey = getCPQCONFIG().secretKey;
      data = {
        'channel': 'MEA',
        'x-signature': createCPQSignature(theApiKey, theSecretKey)
      };
    default:
      data = {'data': 'notfound'};
      break;
  }
  res.send(BaseResponse.successResponse(data));
});

app.listen(port, () => {
    console.log('Server running at '+ port);
})