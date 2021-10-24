'use strict';
const { get } = require('lodash')

module.exports =  {
  successResponse: function (data, responseESB = {}) {
    const defaultResponse = { message: 'Success' };

    return {
      status: true,
      transactionId: get(responseESB, 'transaction.transaction_id') || null,
      data: (data) ? data  : defaultResponse,
    };
  },

  errorResponse: function (error) {
    return {
      status: false,
      transactionId: error.transactionId,
      error: error.message || error.errorMessage || error || null,
    };
  },

  externalSuccessResponse: function (data) {
    const defaultResponse = { message: 'Success' };

    return {
      status: true,
      data: (data) ? data  : defaultResponse
    };
  },

  externalErrorResponse: function (error) {
    return {
      status: false,
      message: error.message || error.errorMessage || JSON.stringify(error) || null
    };
  },

  errorResponseOld: function (error) {
    let message;
    if(error.httpErrorCode === 504) {
      message = 'ESB - Gateway Time-out';
    }
    else if(error.message === 'Something went wrong'){
      message = 'Sorry, something went wrong. Please try again after sometime';
    }
    else if(error.message){
      message = error.message;
    }
    else {
      message = 'Sorry, something went wrong. Please try again after sometime';
    }
    if (error.name) {
      if(error.name == 'BussinessException'){
        error.httpErrorCode = (error.sfaErrorCode) ? error.sfaErrorCode : error.httpErrorCode;
      }
    }
    return {
      status: false,
      errorCode: (error.httpErrorCode) ? error.httpErrorCode : 'SYS_ERROR',
      message: message,
    };
  }
};
