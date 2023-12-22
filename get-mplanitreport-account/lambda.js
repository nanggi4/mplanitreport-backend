/**
 * 등록된 클라이언트 리스트를 가져온다.
 **/
//==============================================================
const { processLambdaFunction, returnThen, returnCatch } = require("@sizeko/awslambda-builder");
//==============================================================
exports.handler = async (event, context) => {
try { return await processLambdaFunction({
  permission: {
    commandline: {},
    preprocess: {},
    urlquery: {},
    urlpost: {}
  },
  validation: {
    input: {event: event, context: context},
    rule: {
      ['account-id']: {required: false, type: 'string'}
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
    // const urlencode = require('urlencode');
    const mysql = require('mysql');
    //==============================================================
    console.log(event);
    // console.log(preProcessResult);
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
    const isList = event['account-id'] === undefined ? true : false;
    //==============================================================
    const SELECT_QUERY = isList ? 
    `SELECT mplanitreport_account.seq, mplanitreport_account.accountId, mplanitreport_account.name FROM mplanitreport_account ORDER BY seq DESC` :
    `SELECT mplanitreport_account.seq, mplanitreport_account.accountId, mplanitreport_account.name FROM mplanitreport_account WHERE accountId = '${event['account-id']}' ORDER BY seq DESC`;
    //==============================================================
    // console.log('SELECT_QUERY', SELECT_QUERY);
    //==============================================================
    (async () => {
      connection.query(SELECT_QUERY, (err, selectQueryResult, fields) => {
        if(err) processError(err);
        else {
          connectionEnd();
          //==============================================================
          const queryResult = isList ? selectQueryResult : selectQueryResult[0];
          //==============================================================
          resolve({
            outputFormat: outputFormat,
            isJSON: {
              queryResult
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