/**
 * sql select한다.
 **/
//==============================================================
const { processLambdaFunction, returnThen, returnCatch } = require("@sizeko/awslambda-builder");
//==============================================================
exports.handler = async (event, context) => {
//==============================================================
try { return await processLambdaFunction({
  permission: {
    commandline: {},
    preprocess: {},
    websocket: {},
    urlquery: {},
    schedule: {},
    urlpost: {}
  },
  validation: {
    input: {event: event, context: context},
    rule: {
      //==============================================================
      ['account-data']: {required: true, type: 'object'}
      //==============================================================      
    },
  },
  outputFormat: {
    itemName: 'result',
    jsonPath: '$.isSuccess["result"]',
  },
  preProcessFunctions: [],
  conditionalFunctions: [],
  defaultFunction: (event, context, outputFormat, resolve, reject, preProcessResult) => {
    //==============================================================
    const mysql = require('mysql');
    //==============================================================
    console.log(event);
    //==============================================================
    const connection = mysql.createConnection({
      host: process.env.RDS_HOSTNAME,
      user: process.env.RDS_USERNAME,
      database: process.env.RDS_DATABASE,
      password: process.env.RDS_PASSWORD,
    });
    const processError = (err) => {
      console.log(err);
      connection.destroy();
      reject(err);
    };
    const connectionEnd = () => {
      connection.end(function(err){
        if(err) {
          console.log(err);
          reject(err);
        }
      });
    };
    //==============================================================
    const accountData = event['account-data'];
    const accountId = event['account-data']['accountId'];
    //==============================================================
    const tableName = accountId !== undefined ? `mplanitreport_mkt_data_${accountId}` : '';
    //==============================================================
    const query = `
      SELECT
        ${tableName}.seq,
        ${tableName}.uuid,
        ${tableName}.accountId,
        ${tableName}.ipaddress,
        ${tableName}.device,
        ${tableName}.hostname,
        ${tableName}.pathname,
        ${tableName}.search,
        ${tableName}.sourcecode,
        ${tableName}.mediumcode,
        ${tableName}.campaigncode,
        ${tableName}.termcode,
        ${tableName}.contentscode,
        ${tableName}.userdata,
        ${tableName}.customdata,
        ${tableName}.date      
      FROM ${tableName}
    `;
    //==============================================================
    (async () => {
      connection.query(query, (err, result, fields) => {
        if(err) processError(err);
        else {
          connectionEnd();
          resolve({
            outputFormat: outputFormat,
            isJSON: {
              result,
              accountData
            }
          });           
        }
      });
    })();      
  }
}).then(param => {
  return returnThen(param);
}).catch(err => {
  return returnCatch(context, err);
});
} catch(err) {
  return returnCatch(context, err);
}};