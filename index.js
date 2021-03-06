const express = require ("express");
const {timeRun} = require("./app/middle/middle");
const cors = require ("cors")
function routerPath (name) {
    return require(`./app/router/${name}`)
}
const path = require ("path")
const mongoose = require ('mongoose')

const app = express ();
const port = 5000;

//app.use (timeRun)
app.use (express.json())
app.use (express.urlencoded({
    extended:true
}))


// mongoose.connect("mongodb://localhost:27017/lucky_dice_casino",(err) => {
//     if (err) throw err;
//     console.log("Kết nối mongoose thành công")
// });

// const URL = 'mongodb+srv://mongo-user:<password>@cluster-mongo-test.ieqay.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const URL = "mongodb+srv://testing:Test123@my-api.6k3c7.mongodb.net/my-own-database?retryWrites=true&w=majority"

const connectDB = async () => {
  try {
    await mongoose.connect(
      URL,
      { 
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    )

    console.log('Connected to mongoDB')
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

connectDB()
app.use(cors())
app.use("/users",routerPath("userRouter"))
app.use("/dices-detail-history",routerPath("diceHistoryRouter"))
app.use("/prizes",routerPath("prizeRouter"))
app.use("/vouchers",routerPath("voucherRouter"))
app.use("/",routerPath("rollRouter"))

app.use (express.static(`${__dirname}/view/homepage`))

app.get("/",(req,res) => {
    //console.log("test")
    res.sendFile(path.join(`${__dirname}/view/homepage/Project Lucky Dice - Bootstrap.html`))
    //res.send ("Welcome to Heroku - Phương")
})

app.listen(process.env.PORT || 3000, () => {
    // console.log (`App đang chạy trên port ${port} . Thời gian bắt đầu chạy là ${new Date()}`)
    console.log(`Running `)
})