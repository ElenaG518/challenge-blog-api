"use strict";
exports.DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://my-new-user:mexico98@ds247852.mlab.com:47852/blogging-app";
  exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "mongodb://my-new-user:mexico98@ds247852.mlab.com:47852/blogging-app";
exports.PORT = process.env.PORT || 8080;
