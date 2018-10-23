
const express = require('express')
const expo = require("expo-server-sdk")
var mongodb = require("mongodb").MongoClient
var assert = require("assert")
const bodyparser = require('body-parser')

const app = express()
const exp = new expo.Expo()

const url = 'mongodb://localhost:27017';


function isExpoPushToken(token) {
  return (
    typeof token === 'string' &&
    (((token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[')) &&
      token.endsWith(']')) ||
      /^[a-z\d]{8}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{12}$/i.test(token))
  );
}

function sendNotifications(msgToBeSent, titleOfNotification) {

  mongodb.connect(url, function (err, client) {

    if (err) {
      console.log("err" + err)
    }

    let db = client.db("fv_iihq")
    let collection = db.collection('tokenDataForRegisterefUsers');
    collection.find().toArray((err, docs) => {
      if (!err) {
        docs.forEach((doc) => {

          console.log(doc)


          let token = doc.token_id
          console.log(token)

          var messages = [];

          let pushToken = token

          //Check that all your push tokens appear to be valid Expo push tokens
          if (!isExpoPushToken(pushToken)) {


            console.error(`Push token ${pushToken} is not a valid Expo push token`);

          } else {


            messages.push({
              to: pushToken,
              sound: 'default',
              title: titleOfNotification,
              body: msgToBeSent,
              data: { withSome: 'data' },
            })


            let chunks = exp.chunkPushNotifications(messages);

            (async () => {
              // Send the chunks to the Expo push notification service. There are
              // different strategies you could use. A simple one is to send one chunk at a
              // time, which nicely spreads the load out over time:
              for (let chunk of chunks) {
                try {
                  let ticketChunk = await exp.sendPushNotificationsAsync(chunk);
                  // console.log(ticketChunk)
                  console.log("sent")
                  tickets.push(...ticketChunk);
                  // NOTE: If a ticket contains an error code in ticket.details.error, you
                  // must handle it appropriately. The error codes are listed in the Expo
                  // documentation:
                  // https://docs.expo.io/versions/latest/guides/push-notifications#response-format 
                } catch (error) {
                  console.error(error);
                }
              }
            })();

          }


        })
        ///

      }
    })

  })
}


function registerTokens(token) {

  let tokenToBeInserted = {
    token_id: token
  }

  mongodb.connect(url, function (err, client) {

    if (err) {
      console.log("err" + err)
    }


    let db = client.db("fv_iihq")

    db.collection('tokenDataForRegisterefUsers').insertOne(tokenToBeInserted, function (err, result) {

      if (err) {
        console.log("err" + err)
      }

      console.log("inserted one token")
      client.close()

    })

  })


}



// function getAllTokens() {




//   mongodb.connect(url, function (err, client) {


//     tokenArray = [];


//     if (err) {
//       console.log("err" + err)
//     } else {
//       console.log("connected")
//     }
//     let db = client.db("fv_iihq")
//     let collection = db.collection('tokenDataForRegisterefUsers');
//     collection.find().toArray((err, docs) => {
//       if (!err) {
//         docs.forEach((doc) => {
//           console.log(doc)
//           tokenArray.push(doc.token_id)
//         }, () => {
//           return tokenArray
//         });

//       }
//     })



//   })

// }


app.use(express.static('./public'))
app.use(bodyparser.urlencoded({extended : false}))

app.post('/sendNotification', (req, res) => {



  sendNotifications(req.body.message, req.body.title)

  res.send("notifications have been delivered to your registered users .")




})


app.get('/registerToken/:token_id', (req, res) => {


  registerTokens(req.params.token_id)

  res.send("token sent for registering")

})

var tokenArray = [];


app.get('/viewAllToken', (req, res) => {

  mongodb.connect(url, function (err, client) {

    tokenArray = [];


    if (err) {
      console.log("err" + err)
    } else {
      console.log("connected")
    }
    let db = client.db("fv_iihq")
    let collection = db.collection('tokenDataForRegisterefUsers');
    collection.find().toArray((err, docs) => {
      if (!err) {

        res.send(docs)


      }
    })



  })


})

app.listen('3003', () => {

  console.log("server running...")

})
