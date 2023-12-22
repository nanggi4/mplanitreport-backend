/**
 * 등록된 클라이언트 리스트를 삭제한다.
 **/
//==============================================================
const { processLambdaFunction, returnThen, returnCatch } = require("@sizeko/awslambda-builder");
//==============================================================
exports.handler = async (event, context) => {
try { return await processLambdaFunction({
  permission: {
    commandline: {},
    preprocess: {},
    urlpost: {}
  },
  validation: {
    input: {event: event, context: context},
    rule: {
      ['seq']: {required: false, type: 'number'},
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
    const seq = event['seq'];
    const accountId = event['account-id'];
    //==============================================================
    const deleteQuery = `DELETE FROM mplanitreport_account WHERE seq = ${seq}`; 
    const dropQuery = `DROP TABLE mplanitreport_mkt_data_${accountId}`; 
    //==============================================================
    // console.log('deleteQuery', deleteQuery);
    // console.log('dropQuery', dropQuery);
    //==============================================================
    (async () => {
      connection.query(deleteQuery, (err, deleteQueryResult, fields) => {
        if(err) processError(err);
        else {
          //==============================================================
          if(deleteQueryResult['affectedRows']>0){
            connection.query(dropQuery, (err, dropQueryResult, fields) => {
              if(err) processError(err);
              else {
                connectionEnd();
                resolve({
                  outputFormat: outputFormat,
                  isJSON: {
                    deleteQueryResult,
                    dropQueryResult
                  }
                });                
              }
            });
          }
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