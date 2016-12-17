Chats = new Mongo.Collection("chats");

if (Meteor.isClient) {
  // set up the main template the the router will use to build pages
  Router.configure({
    layoutTemplate: 'ApplicationLayout'
  });
  // specify the top level route, the page users see when they arrive at the site
  Router.route('/', function () {
    console.log("rendering root /");
    this.render("navbar", {to:"header"});
    this.render("lobby_page", {to:"main"});
  });

  // specify a route that allows the current user to chat to another users
  Router.route('/chat/:_id', function () {
    // the user they want to chat to has id equal to
    // the id sent in after /chat/...
    var otherUserId = this.params._id;
    // find a chat that has two users that match current user id
    // and the requested user id
    var filter = {$or:[
                {user1Id:Meteor.userId(), user2Id:otherUserId},
                {user2Id:Meteor.userId(), user1Id:otherUserId}
                ]};
    var chat = Chats.findOne(filter);
    if (!chat){// no chat matching the filter - need to insert a new one
      chatId = Chats.insert({user1Id:Meteor.userId(), user2Id:otherUserId});
    }
    else {// there is a chat going already - use that.
      chatId = chat._id;
    }
    if (chatId){// looking good, save the id to the session
      Session.set("chatId",chatId);
    }
    this.render("navbar", {to:"header"});
    this.render("chat_page", {to:"main"});
  });

  ///
  // helper functions
  ///
  Template.available_user_list.helpers({
    users:function(){
      return Meteor.users.find();
    }
  })
 Template.available_user.helpers({
    getUsername:function(userId){
      user = Meteor.users.findOne({_id:userId});
      return user.profile.username;
    },
    isMyUser:function(userId){
      if (userId == Meteor.userId()){
        return true;
      }
      else {
        return false;
      }
    },
    isLogon:function() {
      console.log(Meteor.userId());
      if (Meteor.userId()) {
        return true;
      } else {
        return false;
      }
    }
  })

  Template.chat_message.helpers({
    /*
     *  use "" chat-message styling
     *  if current message is current logged in user message
     *  else use "right"
     */
    messageClass: function() {
      var chat = Chats.findOne({_id:Session.get("chatId")});
      if (chat.user2Id == Meteor.userId())
        return "";
      return "right";
    }
  })

  Template.chat_page.helpers({
    messages:function(){
      var chat = Chats.findOne({_id:Session.get("chatId")});
      var direction;
      if(chat.user1Id == Meteor.userId()) {
        direction = "right";
      } else {
        direction = "";
      }
      console.log(Session.get("chatId"));
      console.log(chat.messages);
      console.log(chat.messages);
      return {
        text: chat.messages
      };
    },

    find_opponent: function(isName) {
      var opponentUser;
      var chat = Chats.findOne({_id:Session.get("chatId")});
      if(chat.user1Id == Meteor.userId()) {
        opponentUser = chat.user2Id;
      } else {
        opponentUser = chat.user1Id;
      }
      if (isName == true) {
        return Meteor.users.findOne({
          _id: opponentUser
        }).profile.username;
      } else {
        return Meteor.users.findOne({
          _id: opponentUser
        }).profile.avatar;
      }
    },

    find_me: function(isName) {
      var myUser;
      var chat = Chats.findOne({_id:Session.get("chatId")});
      if(chat.user1Id == Meteor.userId()) {
        myUser = chat.user1Id;
      } else {
        myUser = chat.user2Id;
      }
      if (isName == true) {
        return Meteor.users.findOne({
          _id: myUser
        }).profile.username;
      } else {
        return Meteor.users.findOne({
          _id: myUser
        }).profile.avatar;
      }
    }
  })

 Template.chat_page.events({
  // this event fires when the user sends a message on the chat page
  'submit .js-send-chat':function(event){
    // stop the form from triggering a page reload
    event.preventDefault();
    // see if we can find a chat object in the database
    // to which we'll add the message
    var chat = Chats.findOne({_id:Session.get("chatId")});
    if (chat){// ok - we have a chat to use
      var msgs = chat.messages; // pull the messages property
      if (!msgs){// no messages yet, create a new array
        msgs = [];
      }
      // is a good idea to insert data straight from the form
      // (i.e. the user) into the database?? certainly not.
      // push adds the message to the end of the array
      msgs.push({text: event.target.chat.value});
      // reset the form
      event.target.chat.value = "";
      // put the messages array onto the chat object
      chat.messages = msgs;
      // update the chat object in the database.
      Chats.update(chat._id, chat);
    }
  }
 })
}


// start up script that creates some users for testing
// users have the username 'user1@test.com' .. 'user8@test.com'
// and the password test123

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (!Meteor.users.findOne()){
      for (var i=1;i<9;i++){
        var email = "user"+i+"@test.com";
        var username = "user"+i;
        var avatar = "ava"+i+".png"
        console.log("creating a user with password 'test123' and username/ email: "+email);
        Meteor.users.insert({profile:{username:username, avatar:avatar}, emails:[{address:email}],services:{ password:{"bcrypt" : "$2a$10$I3erQ084OiyILTv8ybtQ4ON6wusgPbMZ6.P33zzSDei.BbDL.Q4EO"}}});
      }
    }
  });
}
