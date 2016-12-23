Meteor.methods({
  //methods to add a new chat message
  updateMessages:function(chat, msg){
    if (!this.userId){ //not logged in
      return;
    }
    else {
      if (chat){
        var msgs = chat.messages;
        if (!msgs){
          msgs = [];
        }  
        var user = Meteor.users.findOne({_id:Meteor.user()._id})
        var username = user.profile.username;
        msgs.push({user: username, text: msg});
        // put the messages array onto the chat object
        chat.messages = msgs;
        // update the chat object in the database.
        Chats.update(chat._id, chat);
        return chat._id;
      }  
    }
  },
  chatid:function(otherUserId){
    console.log(Meteor.userId()+":"+otherUserId);
    var filter = {$or:[
              {user1Id:Meteor.userId(), user2Id:otherUserId}, 
              {user2Id:Meteor.userId(), user1Id:otherUserId}
              ]};
    var chat = Chats.findOne(filter);
    if (!chat){
      chatId = Chats.insert({user1Id:Meteor.userId(), user2Id:otherUserId});
    }
    else {
      chatId = chat._id;
    }
    return chatId;
  }
})