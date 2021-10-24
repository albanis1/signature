const express = require('express');
const bodyParse = require('body-parser');
const cookieParser = require('cookie-parser');
const { isEmpty } = require('lodash');
const BaseResponse = require('./Response/BaseResponse');
var nodemailer = require('nodemailer');
const app = express();
const config = require('./config/config');

const port = process.env.PORT || 5000;
app.use(bodyParse.urlencoded({extended: true}));
app.use(bodyParse.json());
app.use(cookieParser());


app.post("/api/send", (req,res) => {
    var transporter = nodemailer.createTransport(config.smtp);
    
    var mailOptions = {
      from: 'info.sigit@gmail.com',
      to: 'muhammadsigit330@gmail.com',
      subject: 'Testing point 1',
      text: 'That was easy!'
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        res.send(BaseResponse.errorResponse(error));
      } else {
        res.send(BaseResponse.successResponse('Success Send e-Mail'));
      }
    });  
});

app.listen(port, () => {
    console.log('Server running at '+ port);
})