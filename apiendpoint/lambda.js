/**
 * api를 연결하기위한 endpoint 모든 api는 이곳을 통해서 전달 된다.
 * bot으로 들어오는 내용도 이곳을 통해서 path와 body가 정해진다.
 **/
//==============================================================
const { runAPIEndpoint } = require("@sizeko/awslambda-interface");
const _ENVJSON = require('./env.json');
const convertBotMessage = require("./convert-bot-message");
//==============================================================
exports.handler = async (event, context) => {
  let apiResponse;
  try {
    //==============================================================
    console.log(event);
    console.log(context);
    //==============================================================
    let _event = {};
    //==============================================================
    if(event['headers'].hasOwnProperty('x-works-signature')){
      _event = convertBotMessage(event);
    }else{
      _event = event;
    }
    //==============================================================
    apiResponse = await runAPIEndpoint({
      _ENVJSON: _ENVJSON,
      event: _event,
      context: context,
      protocol: ['http','https'],
    });
    //==============================================================
  }
  catch (err) {
    console.log(err);
    return err;
  }
  return apiResponse;
};
