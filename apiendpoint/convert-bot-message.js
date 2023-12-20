const convertPath = require("./convert-path");
const convertBody = require("./convert-body");
//==============================================================
module.exports = function (event) {
  //==============================================================
  let _event = {};
  let _body = JSON.parse(event.body);
  //==============================================================
  const BOT_ID = event['headers']['x-works-botid'];
  const BOT_SIGNATURE = event['headers']['x-works-signature'];
  const PATH = convertPath(_body['content']);
  //==============================================================
  _body = convertBody(PATH, BOT_ID, BOT_SIGNATURE, _body);
  _body = JSON.stringify(_body);
  //==============================================================
  _event = event;
  _event.path = PATH;
  _event.body = _body;
  //==============================================================
  return _event;
};