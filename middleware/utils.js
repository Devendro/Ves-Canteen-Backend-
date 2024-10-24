const { validationResult } = require("express-validator");
var requests = require('requests');
const jsonexport = require('jsonexport');
const moment = require("moment");
const path = require("path");
const fs = require("fs");
/**
 * Removes extension from file
 * @param {string} file - filename
 */
exports.removeExtensionFromFile = file => {
  return file
    .split(".")
    .slice(0, -1)
    .join(".")
    .toString();
};

/**
 * Handles error by printing to console in development env and builds and sends an error response
 * @param {Object} res - response object
 * @param {Object} err - error object
 */
exports.handleError = (res, err) => {
  // Check if err.code is a valid HTTP status code
  const statusCode = typeof err.code === 'number' && err.code >= 100 && err.code < 600 ? err.code : 500;

  // Sends error to user
  res.status(statusCode).json({
    errors: {
      msg: err.message || 'An unexpected error occurred'
    }
  });
};

/**
 * Builds error object
 * @param {number} code - error code
 * @param {string} message - error text
 */
exports.buildErrObject = (code, message) => {
  return {
    code,
    message
  };
};

/**
 * unset fields which is empty 
 * @param {string} file - filename
 */
exports.unsetFields = param => {
  Object.keys(param).forEach((k) => {
    if (!param[k] && typeof param[k] !== 'boolean') {
      param.$unset = { ...param?.$unset, [k]: '' }
      delete param[k]
    }
  });
  return param
};

/**
 * @description function use for dile directory with respect year month and day
 * @returns 
 */
exports.CSVfileDir = () => {
  const fdir = moment().year() + '_' + moment().format('M') + '_' + moment().format('D')
  return `${path.join(__dirname, "../../public/attachments") + '/' + fdir}`
}

exports.doRequest = (url) => {
  return new Promise(function (resolve, reject) {
    requests(url, function (error, res, body) {
      try {
        if (!error && res.statusCode == 200) {
          resolve(Buffer.from(body).toString('base64'));
        } else {
          reject(error);
        }
      } catch (Err) {
        console.log(Err)
      }
    });
  });
}


/**
 * @description function use for dile directory with respect year month and day
 * @returns 
 */
exports.fileDir = () => {
  const fdir = moment().year() + '_' + moment().format('M') + '_' + moment().format('D')
  return `${path.join(__dirname, "../../public/attachments") + '/' + fdir}`
}


/**
 * @description function use for dile directory with respect year month and day
 * @returns 
 */
exports.attachmentDir = () => {
  const fdir = moment().year() + '_' + moment().format('M') + '_' + moment().format('D')
  return `${path.join("attachments", fdir)}`
}

exports.getMilleseconds = () => moment().valueOf()
/**
 * @description Builds document base directory
 * @returns retuns string
 */
exports.baseFileDir = () => `${path.join(__dirname, "../../public/attachments")}`
exports.tempimg = () => `${path.join(__dirname, "../../public/email_template/forget_password_template")}`

exports.getBlobName = originalName => {
  const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
  return `${identifier}-${originalName}`;
};

exports.docsTags = (item) => {
  let splitItm = item.replace(/ /g, '_').split('_').join(' ');
  console.log('splitItm', splitItm)

  return { name: splitItm }
  //return { loan_number: splitItm[0], name: `${splitItm[1]} ${splitItm[2]}` }
}

/**
 * @description function use to change date format 
 * @param {Date} date date string
 * @param {String} format accept date format 
 */
exports.dateFormat = (date, format = 'MMMM Do YYYY, h:mm a') => moment(date).format(format)

/**
 * @description function build for convert memory 
 * @param {Number} bytes size
 * @returns  string
 */
exports.bytesToSize = (bytes) => {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

exports.removeLastSegment = (the_url) => {
  var the_arr = the_url.split('/');
  the_arr.pop();
  return (the_arr.join('/'));
}


exports.changeSecondLastSegment = (the_url) => {

  var the_arr = the_url.split('/');
  the_arr[the_arr.length - 2] = new Date().getTime()
  return (the_arr.join('/'));

}



/**
 * @description get current public directory
 * @returns retuns string
 */
exports.getFileDir = () => `${path.join(__dirname, "../../public/")}`

/**
 * Builds error for validation files
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @param {Object} next - next object
 */
exports.validationResult = (req, res, next) => {
  try {
    validationResult(req).throw();
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase();
    }
    return next();
  } catch (err) {
    return exports.handleError(res, exports.buildErrObject(422, err.array()));
  }
};

/**
 * Builds success object
 * @param {string} message - success text
 */
exports.buildSuccObject = message => {
  return {
    msg: message
  };
};

/**
 * Checks if given ID is good for MongoDB
 * @param {string} id - id to check
 */
exports.isIDGood = async id => {
  return new Promise((resolve, reject) => {
    const goodID = String(id).match(/^[0-9a-fA-F]{24}$/);
    return goodID
      ? resolve(id)
      : reject(exports.buildErrObject(422, "ID_MALFORMED"));
  });
};

/**
 * Item not found
 * @param {Object} err - error object
 * @param {Object} item - item result object
 * @param {Object} reject - reject object
 * @param {string} message - message
 */
exports.writeErrDataSet = async (incorrectArr, fileName) => {
  jsonexport(incorrectArr, async function (error, response) {
    if (!error) {
      const fileDir = `${path.join(__dirname, "../../public/error_files/")}`;
      const errFile = `${fileName}`; // create csv dynamic file name with timestemp
      if (!fs.existsSync(`${fileDir}`)) fs.mkdirSync(`${fileDir}`, { recursive: true })
      const filePath = `${fileDir}/${errFile}`;
      fs.writeFileSync(filePath, response);
    }
  });
};

/**
 * @description method use to get current date
 * @returns string
 */
exports.getDate = () => (new Date()).toISOString().substring(0, 10)

/**
 * Item not found
 * @param {Object} err - error object
 * @param {Object} item - item result object
 * @param {Object} reject - reject object
 * @param {string} message - message
 */
exports.itemNotFound = (err, item, reject, message) => {
  if (err) {
    reject(exports.buildErrObject(422, err.message));
  }
  if (!item) {
    reject(exports.buildErrObject(404, message));
  }
};



/**
 * Item already exists
 * @param {Object} err - error object
 * @param {Object} item - item result object
 * @param {Object} reject - reject object
 * @param {string} message - message
 */
exports.itemAlreadyExists = (err, item, reject, message) => {
  if (err)
    reject(exports.buildErrObject(422, err.message));
  if (item)
    reject(exports.buildErrObject(422, message));
};


exports.generateRandom = (length = 32, alphanumeric = true) => {
  let data = "",
    keys = "";

  if (alphanumeric) {
    keys = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  } else {
    keys = "0123456789";
  }

  for (let i = 0; i < length; i++) {
    data += keys.charAt(Math.floor(Math.random() * keys.length));
  }
  return data;
};


/**
 * @description function use to load img elements
 * @param {*} src image path
 * @param {*} height image height
 * @param {*} width image width
 * @returns instance 
 */
 exports.addImageProcess = (src, height = 871, width = 673) => {
  return new Promise((resolve, reject) => {
    let img =  new Canvas.Image;
    img.onload = () => resolve({ img: img, height: img.height, width: img.width })
    img.onerror = reject
    // img.height = height
    // img.width = width
    img.src = src
  })
}