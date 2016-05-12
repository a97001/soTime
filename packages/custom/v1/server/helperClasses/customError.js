"use strict";

class CustomError extends Error {
    constructor(message, errorObject, statusCode) {
      super(message);
      this.errorObject = errorObject;
      this.statusCode = statusCode;
    }
}

module.exports = CustomError;
