import {Meteor} from 'meteor/meteor';
import { Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';
import App from '../ui/App.jsx';


export const Messages= new Mongo.Collection('messages');
messagesOnPage=6;
lastDate=undefined;

if(Meteor.isServer){
	var userSelector=this.userId;
		
	var additional=[];
	var publishingMessages=[];
	var otherDirMessages=[];
	var self = this;
	
	messagesOnPage++;
	
	
	Meteor.publish('messages',function messagesPublication(filter,forvard,locSelector){
		if(filter!==undefined){
			
			if(forvard){
				publishingMessages= Messages.find({$and:[{$or: [{location: locSelector},{owner: userSelector}]} ,{createdAt:{$gt: filter} }]},{sort:{createdAt:1}, skip: 0, limit: messagesOnPage});
			}else{
				publishingMessages= Messages.find({$and:[{$or: [{location: locSelector},{owner: userSelector}]} ,{createdAt:{$lt: filter} }]},{sort:{createdAt:-1}, skip: 0, limit: messagesOnPage});						
			}
		}else{
			publishingMessages= Messages.find({$or: [{location: locSelector},{owner: userSelector}]},{sort:{createdAt:-1}, skip: 0, limit: messagesOnPage});
		}		
		return publishingMessages;
	});

	Meteor.publish('otherDirectionMessages',function messagesPublication(filter,forvard,locSelector){
	if(filter!==undefined){		
		if(forvard){
			console.log("2");
			otherDirMessages= Messages.find({$and:[{$or: [{location: locSelector},{owner: userSelector}]} ,{createdAt:{$lt: filter} }]},{limit: 1});
			
		}else{
			otherDirMessages= Messages.find({$and:[{$or: [{location: locSelector},{owner: userSelector}]} ,{createdAt:{$gt: filter} }]},{limit: 1});
				console.log("1");
		}
	}else{
		console.log("3");
		otherDirMessages= Messages.find({$and:[{$or: [{location: locSelector},{owner: userSelector}]} ,{createdAt:{$gt: new Date()} }]},{limit: 1});	
		
	}
		return otherDirMessages;
	});
	
};
Meteor.methods({
	'messages.insert'(text){
		check(text, String);
		if(! this.userId){
			throw new Meteor.Error('not-authorized');
		}
		Messages.insert({
			text,
			createdAt: new Date(),
			owner: this.userId,
			username: Meteor.users.findOne(this.userId).username,
			location: Meteor.user().location,
		});
	},
});