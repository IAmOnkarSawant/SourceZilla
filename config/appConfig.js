require('dotenv').config();

const appURL = process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}`: process.env.APP_URL
module.exports={
    "PORT": process.env.PORT || 4000,
    "APP_URL":appURL,
    "DB_URL_LOCAL": process.env.DB_URL_LOCAL,
    "DB_URL_CLOUD":process.env.DB_URL_CLOUD,
    "JWT_SECRET_KEY": process.env.JWT_SECRET_KEY,
}