const generateShortKey = () => {
  return Math.random().toString(36).substr(6).toUpperCase();
};

const getUniqueKey = async (conn) => {
  const chkUrlDuplicateSql = "SELECT url_id from urls WHERE short_key = ?";
  while (true) {
    const newKey = generateShortKey();
    const [rows] = await conn.query(chkUrlDuplicateSql, newKey);
    if (rows.length === 0) return newKey;
  }
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
  getUniqueKey,
  isValidUrl,
  handleServerError,
};
