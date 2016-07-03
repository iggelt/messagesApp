import React, {Component, PropTypes} from 'react';

export default class User extends Component{
	render(){
		return(
			<li>{this.props.user.createdAt}</li>
		);
	}
}

User.propTypes = {
	user: PropTypes.object.isRequired,
}