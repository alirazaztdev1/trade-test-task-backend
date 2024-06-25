const axios = require('axios');

const axiosService = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = axiosService;
