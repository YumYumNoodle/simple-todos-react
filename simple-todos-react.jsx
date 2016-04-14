Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  Meteor.subscribe("tasks");
  Meteor.startup(function () {
    ReactDOM.render(<App />, document.getElementById("render-target"));
  });
}

if(Meteor.isServer){
  Meteor.publish("tasks", function() {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });
  var clear = function() {
    var min = new Date(new Date() - 5000);
    Tasks.remove({
      createdAt: {$lt: min}
    });
  }
  Meteor.startup(function(){
    clear();
    Meteor.setInterval(clear, 5000)
  });
}


Meteor.methods({
  addTask(text) {
    if(! Meteor.userId()) {
      if( ! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },

  removeTask(taskId) {
    const task = Tasks.findOne(taskId);

    if (task.private || task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.remove(taskId);
  },

  setChecked(taskId, setChecked) {
    const task = Tasks.findOne(taskId);

    if (task.private && task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId, { $set: { checked: setChecked} });
  },

  setPrivate(taskId, setToPrivate) {
    const task = Tasks.findOne(taskId);

    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId, { $set: { private: setToPrivate } });
  }, 



});


