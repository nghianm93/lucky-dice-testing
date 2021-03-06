const mongoose = require ("mongoose");
const voucherModel = require("../model/voucherModel")
const prizeModel = require("../model/prizeModel")
const userModel = require("../model/userModel")
const apiModel = require("../model/diceHistoryModel");
const diceHistoryModel = require("../model/diceHistoryModel");

const rollDice = async (req,res) => {

    function getRandomRoll () {
        return Math.floor(Math.random() * 6 + 1)
    }
    
    function getRandomVoucher () {
        return new Promise ((response,rej) => voucherModel.findRandom({},"maVoucher phanTramGiamGia",{limit:1},(err,result) => response(result)))
    }
    
    function getRandomPrize () {
        return new Promise ((response,rej) => prizeModel.findOneRandom((err,result) => response(result)))
    }
    
    let user = req.body;

    if (!user.userName || !user.firstName || !user.lastName) {
        return res.status(400).json({
            message : "Chưa có đầy đủ userName, firstName và lastName"
        })
    }

    let userResult = {};

    await new Promise ((success,failed) => {userModel.findOne({userName : user.userName}).exec((err,data) => {
        if (data === null) {
            let body = {
                _id : mongoose.Types.ObjectId(),
                ...user
            }
            userModel.create(body,(err,data) => {
                success(data)
            })
        } else {
            success(data)
        }
    })}).then ((value) => userResult = value)

    let diceResult = getRandomRoll();
    let voucherResult = null;
    let prizeResult;
    let bonusPrize;

    if (diceResult <= 3) {
        voucherResult = null;
        bonusPrize = 0;
    } else {
        await getRandomVoucher().then(value => voucherResult = value[0]);
        await apiModel.find({user : userResult._id}).sort({_id:"desc"}).limit(1).exec().then((data) => {
            bonusPrize = data.length != 0 ? ++ data[0].bonusPrize : 1;
        })
    }

    bonusPrize >= 3 ? await getRandomPrize().then(value => prizeResult = value) : prizeResult = null;

    let diceHistoryData = {
        _id : mongoose.Types.ObjectId(),
        user : userResult._id,
        dice : diceResult,
        voucher : voucherResult ? voucherResult._id : null,
        prize : prizeResult ? prizeResult._id : null,
        bonusPrize
    }

    apiModel.create(diceHistoryData)

    let result = {
        dice : diceResult,
        voucher : diceResult <= 3 ? null : {
            maVoucher: voucherResult.maVoucher,
            phanTramGiamGia : voucherResult.phanTramGiamGia
        },
        prize : prizeResult ? prizeResult.name : null
    }

    res.status(201).json(result);
}

const getDiceHistory = async (req,res) => {
    let userName = req.query.userName

    if (!userName) {res.status(500).send("Chưa có userName")}

    let userId;
    await userModel.findOne({userName}).exec().then(value => userId = value)

    diceHistoryModel.find({user : userId}).exec((err,data) => {
        res.status(200).json({
            dices: data.map(each => each.dice)
        })
    })
}

const getVoucherHistory = async (req,res) => {
    let userName = req.query.userName

    if (!userName) {res.status(500).send("Chưa có userName")}

    let userId;
    await userModel.findOne({userName}).exec().then(value => userId = value)

    diceHistoryModel.find({user : userId,voucher : {$ne : null}}).populate("voucher","-_id").exec((err,data) => {
        res.status(200).json(data.map(each => each.voucher))
    })
}

const getPrizeHistory = async (req,res) => {
    let userName = req.query.userName

    if (!userName) {res.status(500).send("Chưa có userName")}

    let userId;
    await userModel.findOne({userName}).exec().then(value => userId = value)

    diceHistoryModel.find({user : userId,prize : {$ne : null}}).populate("prize","-_id").exec((err,data) => {
        res.status(200).json(data.map(each => each.prize.name))
    })
}

module.exports = {rollDice,getVoucherHistory,getPrizeHistory,getDiceHistory}