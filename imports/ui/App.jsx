import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { createContainer} from 'meteor/react-meteor-data';
import {Messages} from '../api/messages.js';
import {Locations} from '../api/locations.js';
import Location from './Location.jsx';
import '../api/usersAdditional.js';

import Message from './Message.jsx';
import User from './User.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';

var App = React.createClass({
	
		handleSubmitNewMessage: function(event){
			event.preventDefault();
			const text = ReactDom.findDOMNode(this.refs.textInputMessage).value.trim();
		
			Meteor.call('messages.insert',text);
			ReactDom.findDOMNode(this.refs.textInputMessage).value="";
		},	
		handleSubmitChangeUserData: function(event){
			event.preventDefault();
			const name = ReactDom.findDOMNode(this.refs.textInputName).value.trim();
		
			Meteor.call('usersAdditional.change',name);
			ReactDom.findDOMNode(this.refs.textInputName).value="";
		},	

	  
	  renderMessages: function(){
		return this.props.messages.map((message)=> (
			<Message key={message._id} message={message} author={Meteor.users.findOne({_id:message.owner})} />
		
		)); 
	  },
	  
	  
	  renderLocations: function(){
		return this.props.locations.map((location)=> (
			<Location key={location._id} location={location} />		
		)); 
	  },
	 
	  renderUserData: function(){
		if(Meteor.user()!==null&&Meteor.user()!==undefined){
			return Meteor.user()._id+"   "+Meteor.user().username;
		}
		return "user not logged in";
	  },
	  handleChange: function(event) {
			this.setState({value: event.target.value});
			Meteor.call('usersAdditional.change',event.target.value);
	  },
	
      showFormFunc: function(){			
		 this.setState({
			showEditForm: true
		});
		this.setState({
			curLoc: Meteor.user().location
		});
	  },
	   hideFormFunc: function(){			
		 this.setState({
			showEditForm: false
		});
	  },
	 nextMessages: function(){			
		Session.set("filter", (this.props.messages.length==0)?new Date():this.props.messages[0]['createdAt']);
		Session.set("forvard",true);
	},
	prevMessages: function(){			
		Session.set("filter", (this.props.messages.length==0)?new Date():this.props.messages[this.props.messages.length-1]['createdAt']);
		Session.set("forvard",false);

	},
	  changeProfile: function(){
			var newName=ReactDom.findDOMNode(this.refs.textInputName).value.trim();
			var newEmail=ReactDom.findDOMNode(this.refs.textInputEmail).value.trim();
			var newLocation=ReactDom.findDOMNode(this.refs.inputLocation).value.trim();
			Meteor.call('usersAdditional.change',newName,newEmail,newLocation);
			this.hideFormFunc();
	  },
	
	  render: function(){
	   var editForm="";
	  if(this.state&&this.state.showEditForm){ 				
							editForm = 
							<div>
							<button onClick={this.hideFormFunc}>x</button>
								<form className="changeUserData" onSubmit={this.handleSubmitChangeUserData}>
								

									<input 
										type="text"
										ref="textInputName"
										placeholder="your username"
										defaultValue={(Meteor.user()!==null&&Meteor.user()!==undefined)? Meteor.user().username:""}
									/>
									<input 
										type="text"
										ref="textInputEmail"
										placeholder="your email"
										defaultValue={(Meteor.user()!==null&&Meteor.user()!==undefined)? Meteor.user().emails[0].address:""}
									/>
									<select 
										ref="inputLocation" 
										defaultValue={(Meteor.user()!==null&&Meteor.user()!==undefined)? Meteor.user().location:""}
											>
											{this.renderLocations()}
									</select>

								</form>
							<button onClick={this.changeProfile}>Save data</button>
							</div>
		}
				
		return(
			<div className="container">
				<header>
					<h1>Messages</h1>
				</header>
				<AccountsUIWrapper />
				<div>
					{this.renderUserData()}
				</div>
				 <button onClick={this.showFormFunc}>settings</button>
				 

				 

				{editForm}
				
								
				<form className="newMessage" onSubmit={this.handleSubmitNewMessage}>
					<input 
						type="text"
						ref="textInputMessage"
						placeholder="Type to add new messages"
					/>
				</form>
				<ul>
					{this.renderMessages()}
				</ul>
				<div>{Session.get("filter").toLocaleString}</div>
				<button onClick={this.prevMessages}>Back</button>
				<button onClick={this.nextMessages}>Next</button>

			</div>
		);
	  }
	});

  App.propTypes = {
	messages: PropTypes.array.isRequired, 
	locations: PropTypes.array.isRequired, 
	users: PropTypes.array.isRequired,
  };
  
  export default createContainer(()=>{
  	
	if (Meteor.isClient) {
		if(Session.get("filter")==undefined){
			Session.set("filter", new Date());
			Session.set("forvard",false);
		}		
	}
  

   Meteor.subscribe('messages',Session.get("filter"),Session.get("forvard"),(Meteor.user()!==null&&Meteor.user()!==undefined)? Meteor.user().location:"");
   Meteor.subscribe('otherDirectionMessages',Session.get("filter"),Session.get("forvard"),(Meteor.user()!==null&&Meteor.user()!==undefined)? Meteor.user().location:"");
   
   Meteor.subscribe('locations');
   Meteor.subscribe('users');
   
	var locSelector=(Meteor.user()!==null&&Meteor.user()!==undefined)? Meteor.user().location:"";
	var userSelector=(Meteor.user()!==null&&Meteor.user()!==undefined)? Meteor.user()._id:"";
	var currentDate=(this.state)?this.state.lastMessageDate:new Date();
	
	var publishingMessages=[];
	var otherDirMessages=[];
	
	
	if(Session.get("filter")!==undefined){
			
		if(Session.get("forvard")){
			publishingMessages= Messages.find({$and:[{$or: [{location: locSelector},{owner: userSelector}]} ,{createdAt:{$gt: Session.get("filter")} }]},{sort:{createdAt:1}, skip: 0, limit: messagesOnPage});
		}else{
			publishingMessages= Messages.find({$and:[{$or: [{location: locSelector},{owner: userSelector}]} ,{createdAt:{$lt: Session.get("filter")} }]},{sort:{createdAt:-1}, skip: 0, limit: messagesOnPage});						
		}
	}else{
		publishingMessages= Messages.find({$or: [{location: locSelector},{owner: userSelector}]},{sort:{createdAt:-1}, skip: 0, limit: messagesOnPage});
	}

	if(Session.get("filter")!==undefined){		
		if(Session.get("forvard")){
			//otherDirMessages= Messages.findOne({$and:[{$or: [{location: locSelector},{owner: userSelector}]} ,{createdAt:{$lt: Session.get("filter")} }]});
			otherDirMessages=Messages.find({$and:[{$or: [{location: locSelector},{owner: userSelector}]} ,{createdAt:{$gt: Session.get("filter")} }]},{sort:{createdAt:1}, skip: 0, limit: messagesOnPage});
		}else{
			otherDirMessages= Messages.find({$and:[{$or: [{location: locSelector},{owner: userSelector}]} ,{createdAt:{$lt: Session.get("filter")} }]});				
			//otherDirMessages= Messages.find ({$and:[{$or: [{location: locSelector},{owner: userSelector}]} ,{createdAt:{$lt: Session.get("filter")} }]},{sort:{createdAt:-1}, skip: 0, limit: messagesOnPage});
		}
	}else{
		//otherDirMessages= Messages.findOne({$and:[{$or: [{location: locSelector},{owner: userSelector}]} ,{createdAt:{$gt: new Date()} }]});	
		otherDirMessages=Messages.find({$or: [{location: locSelector},{owner: userSelector}]},{sort:{createdAt:-1}, skip: 0, limit: messagesOnPage});
	}	

	return{
		//messages: Messages.find({location: locSelector},{sort:{createdAt:-1}, skip: 0, limit: 2}).fetch(), 
		//messages: Messages.find({$or: [{location: locSelector},{owner: userSelector}]},{sort:{createdAt:-1}, skip: 0, limit: 2}).fetch(), 
		//messages: Messages.find({$and:[ {$or: [{location: locSelector},{owner: userSelector}]},{createdAt:{$lt: currentDate} }]},{sort:{createdAt:-1}, skip: 0, limit: 2}).fetch(),
		
		
		
		messages: publishingMessages.fetch(),
		otherDirectionMessages: otherDirMessages.fetch(),
					
		users: Meteor.users.find().fetch(),
		locations: Locations.find({}).fetch()
		
	};
  
  }, App);
  
  