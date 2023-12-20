module.exports = function (path, botId, botSignature, body) {
  let convertBody = '';
  //==============================================================
  const data = {
    data: {
      body,
      path,
      header: {
        botId,
        botSignature 
      }       
    }
  };
  //==============================================================
  convertBody = {
    send: {
      bot: {
        message: data
      }
    }
  };
  //==============================================================
  return convertBody;
};