const mongoose = require("mongoose");
const jwt = require("jwt-simple");
const User = require("../models/user");


async function getUniqueLink(req, res) {
    const { email } = req.body;


    const user = await User.findOne({
        email: email
    });

    res.send({result: 'ok', link: `http://fbly.io/r/${user.id}`})
}

module.exports = {getUniqueLink}