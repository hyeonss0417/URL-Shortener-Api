const generateShortKey = () => {
  return Math.random().toString(36).substr(6).toUpperCase();
};

const getUniqueUrlKey = async (conn) => {
  const chkUrlDuplicateSql = "SELECT url_id from urls WHERE short_key = ?";
  const tryNum = 20;
  for (let i = 0; i < tryNum; i++) {
    const newKey = generateShortKey();
    const [rows] = await conn.query(chkUrlDuplicateSql, newKey);
    if (rows.length === 0) return newKey;
  }
  return "";
};

const isValidUrl = (url) => {
  const urlRegex = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/;
  return urlRegex.test(url);
};

const checkUrlLength = (url) => {
  return url.length < 500;
};

const isEmptyResult = (rows) => rows.length === 0;

module.exports = {
  generateShortKey,
  getUniqueUrlKey,
  isValidUrl,
  isEmptyResult,
  checkUrlLength,
};
