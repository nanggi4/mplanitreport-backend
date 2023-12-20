module.exports = function (content) {
  const contentType = content['type'];
  const contentText = content['text'].split('-')[0].replace('!', '');
  //=========================================================================
  const pathObj = {
    '계정생성': 'put-mplanitreport-account',
    '계정목록': 'get-mplanitreport-account',
    '테스트': 'get-mkt-data-api',
    '데이터입력' : 'get-mkt-data-sql'
  };
  const pathName = contentType === 'text' && pathObj[contentText] !== undefined ? pathObj[contentText] : false;
  //=========================================================================
  return pathName;
};