
const express = require('express')
const expo = require("expo-server-sdk")
const app = express()
const exp = new expo.Expo()


function sendNotifications(arrayOfTokensForSendingNotificationsTo ) {



    var messages = [];

    let pushToken = 'ExponentPushToken[hz0Sq8J36Y2CDnHYfVAqrH]'
    
    messages.push({
    to: pushToken,
    sound:'default',
    title : 'title',
    body : 'this is a test notification',
    data : { withSome : 'data' },
    })
    
    
    let chunks =  exp.chunkPushNotifications(messages);
    
    (async () => {
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
          try {
            let ticketChunk = await exp.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
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

app.get('/', (req, res) => {

    

    res.send("Hello from node dynamic changing")

    sendNotifications('')


})



app.listen('3003', () => {

    console.log("server running...")

})
