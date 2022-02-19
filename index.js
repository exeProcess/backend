const express = require("express")
const mongoClient = require("mongodb").MongoClient
const cors = require("cors")
const app = express()
let db
app.use('cors()')
const ObjectID = require("mongodb").ObjectId
app.use(express.json())


//const DB_url = "mongodb+srv://root:root@cluster0.whzfy.mongodb.net"
mongoClient.connect("mongodb+srv://root:root@cluster0.whzfy.mongodb.net",(error, database) => {
    db = database.db("Webstore")
    console.log("database connected")
})

app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*')
    res.header("Access-Control-Allow-Headers", "*")
    res.header("Access-Control-Allow-Origin", "*")
    res.header('Access-Control-Allow-Methods', '*')
    next()
})
app.use((req, res, next) => {
    console.log(req.url)
    next()
})
app.get("/",(req, res) => {
    res.send("welcome to after school backend")
})
app.param("collectionName", (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})
app.get("/collection/:collectionName", (req, res) => {
    req.collection.find({}).toArray((error, result) => {
        if(error) return next(error)
            res.send(result)

    })
})

app.get("/collection/:collectionName/search", (req, res, next) => {
    req.collection.find({}).toArray((error, result) => {
        if(error) next(error)

        let re = result.map((ele) => {
            for(let key in ele){
                //if(key.toString() == "subject" || key.toString() == "location"){
                    if(ele[key].toString().toLowerCase().search(req.query.q) != -1){
                        return ele
                    }
                //}
            }
        }).filter(element => {
            if(element != null){
                return element
            }
        })
        
        res.send(re)
    })
})

app.get("/collection/:collectionName/:id", (req, res) => {
    req.collection.findOne({"_id": new ObjectID( req.params.id)} ,(error, result) => {
        if(error) return next(error)
        res.send(result)
    })
})

app.put("/collection/:collectionName/:id", (req, res, next) => {
    req.collection.update(
        { _id: new ObjectID(req.params.id)},
        { $set: req.body},
        { safe: true, multi: false},
        (e, result) => {
            if(e) return next(e)

            res.send((result.n === 1)? {'msg': "success"} : {"msg": "error"} )
        }
    )
})
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (err, result) => {
        if (err) return next(err)
        res.send(result.ops)
        //console.log(req.body)
     })
})


const port = process.env.PORT || 3000
app.listen(port , () => {
    console.log("working")
})