import React, {Component, PropTypes} from 'react';

export default class Location extends Component{
	render(){
			return(
				<option value={this.props.location._id._str} >{this.props.location.name}</option>
			);


	}
}

Location.propTypes = {
	location: PropTypes.object.isRequired,
}