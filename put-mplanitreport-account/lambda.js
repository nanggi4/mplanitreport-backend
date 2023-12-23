const { processLambdaFunction, returnThen, returnCatch } = require("@sizeko/awslambda-builder");
//==============================================================
exports.handler = async (event, context) => {
//==============================================================
const isBot = event['_serviceInterface'] !== 'urlpost' ? true : false;
//==============================================================
try { return await processLambdaFunction({
  permission: {
    commandline: {},
    preprocess: {},
    websocket: {},
    urlquery: {},
    urlpost: {},
    schedule: {}
  },
  validation: {
    input: {event: event, context: context},
    rule: {},
  },
  outputFormat: {
    itemName: 'result',
    jsonPath: '$.isSuccess["result"]',
  },
  preProcessFunctions: [],
  conditionalFunctions: [],
  defaultFunction: (event, context, outputFormat, resolve, reject, preProcessResult) => {
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
    const data = isBot ? event['data']['content']['text'].split('-') : event;
    const accountId = isBot ? data[1] : data['account-id'];
    const name = isBot ? data[2] : data['name'];
    //==============================================================
    const insertQuery = `INSERT INTO mplanitreport_account (accountId, name) VALUES ('${accountId}', '${name}')`;
    const createQuery = `
      CREATE TABLE IF NOT EXISTS mplanitreport_mkt_data_${accountId} (
        seq int(30) NOT NULL AUTO_INCREMENT,
        uuid varchar(40) DEFAULT NULL,
        accountId varchar(40) DEFAULT NULL,
        ipaddress varchar(20) DEFAULT NULL,
        device varchar(10) DEFAULT NULL,
        hostname varchar(40) DEFAULT NULL,
        pathname varchar(40) DEFAULT NULL,
        search varchar(200) DEFAULT NULL,
        sourcecode varchar(30) DEFAULT NULL,
        mediumcode varchar(30) DEFAULT NULL,
        campaigncode varchar(30) DEFAULT NULL,
        termcode varchar(30) DEFAULT NULL,
        contentscode varchar(100) DEFAULT NULL,
        userdata varchar(500) DEFAULT NULL,
        customdata varchar(500) DEFAULT NULL,
        date varchar(50) DEFAULT NULL,
        createdAt datetime DEFAULT CURRENT_TIMESTAMP,
        updatedAt datetime DEFAULT CURRENT_TIMESTAMP,  
        PRIMARY KEY (seq)
      ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;    
    `;
    //==============================================================
    // console.log('insertQuery', insertQuery);
    // console.log('createQuery', createQuery);
    //==============================================================
    (async () => {
      connection.query(insertQuery, (err, insertQueryResult, fields) => {
        if(err) processError(err);
        else {
          //==============================================================
          if(insertQueryResult['affectedRows']>0){
            connection.query(createQuery, (err, createQueryResult, fields) => {
              if(err) processError(err);
              else {
                //==============================================================
                const selectQuery = `SELECT mplanitreport_account.accountId, mplanitreport_account.name FROM mplanitreport_account WHERE seq = ${insertQueryResult['insertId']}`;
                //==============================================================
                // console.log('selectQuery', selectQuery);
                //==============================================================
                connection.query(selectQuery, (err, selectQueryResult, fields) => {
                  if(err) processError(err);
                  else {
                    //==============================================================
                    connectionEnd();
                    resolve({
                      outputFormat: outputFormat,
                      isJSON: {
                        insertQueryResult,
                        createQueryResult,
                        selectQueryResult
                      }
                    });
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