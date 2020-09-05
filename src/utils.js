const generateShortKey = () => {
  return Math.random().toString(36).substr(6).toUpperCase();
};

const getUniqueURLKey = async (conn) => {
  const chkUrlDuplicateSql = "SELECT url_id from urls WHERE short_key = ?";
  const tryNum = 20;
  for (let i = 0; i < tryNum; i++) {
    const newKey = generateShortKey();
    const [rows] = await conn.query(chkUrlDuplicateSql, newKey);
    if (rows.length === 0) return newKey;
  }
  throw Error("Couldn't get unique url key.");
};

const isValidUrl = (url) => {
  const urlRegex = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/;
  return urlRegex.test(url);
};

const handleServerError = (err, res) => {
  console.error(err);
  res.status(500).json({ message: "Server Error!" });
};

module.exports = {
  generateShortKey,
  getUniqueURLKey,
  isValidUrl,
  handleServerError,
};
