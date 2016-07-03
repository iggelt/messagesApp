import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';

export const Users=Meteor.users;
if(Meteor.isServer){
	Meteor.publish('users',function usersPublication(){
		return Meteor.users.find({},{"username":true});
	});
}

  Meteor.methods({
	'usersAdditional.change'(newUsername,newEMail,newLocation){
		check(newUsername, String);
		if(! this.userId){
			throw new Meteor.Error('not-authorized');
		}
		Meteor.users.update(this.userId, {$set: {"username": newUsername,"emails.0.address":newEMail,"location":newLocation}});
	},
});
  
