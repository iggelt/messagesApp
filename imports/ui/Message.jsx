import React, {Component, PropTypes} from 'react';

export default class Message extends Component{
	render(){
		return(
			<li>{(this.props.message.createdAt)?this.props.message.createdAt.toLocaleString():""}: {(this.props.author)?this.props.author.username:"" } :  {this.props.message.text}</li>
		);
	}
}

Message.propTypes = {
	message: PropTypes.object.isRequired,
}