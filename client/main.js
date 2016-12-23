Meteor.subscribe("chats");
Meteor.subscribe("users");
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
        //console.log(Meteor.userId());
        if (Meteor.userId()) {
            return true;
        } else {
            return false;
        }
    }
})

Template.chat_page.helpers({
    messages:function(){
      var chat = Chats.findOne({_id:Session.get("chatId")});
      return chat.messages;
    }, 
    other_user:function(){
      return ""
    },

    find_opponent: function(isName) {
        var opponentUser;
        var chat = Chats.findOne({_id:Session.get("chatId")});
        console.log("1.1." + chat.user1Id);
        if(chat.user1Id == Meteor.userId()) {
            opponentUser = chat.user2Id;
        } else {
            opponentUser = chat.user1Id;
        }
        console.log("1.2." + opponentUser);
        console.log("1.3." + Meteor.users.findOne({
            _id: opponentUser
            }));
        var profiles = Meteor.users.findOne({_id: opponentUser});
        if ( profiles != undefined) {
            if (isName == true) {
                return Meteor.users.findOne({
                _id: opponentUser
                }).profile.username;
            } else {
                return Meteor.users.findOne({
                _id: opponentUser
                }).profile.avatar;
            }
        }
    },

    find_me: function(isName) {
        var myUser;
        var chat = Chats.findOne({_id:Session.get("chatId")});
        console.log("2.1." + chat.user1Id);
        if(chat.user1Id == Meteor.userId()) {
            myUser = chat.user1Id;
        } else {
            myUser = chat.user2Id;
        }
        console.log("2.2." + myUser);
        console.log("2.3." + Meteor.users.findOne({
            _id: myUser
            }));
        var profiles = Meteor.users.findOne({_id: myUser});
        if ( profiles != undefined) {
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
        var id = Meteor.call("updateMessages", chat, event.target.chat.value, function(err, res){
            if(!err) {
              Session.set("msgid",res);
            }
        });
        event.target.chat.value = "";
    }
})