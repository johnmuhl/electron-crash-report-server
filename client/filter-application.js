import PropTypes from 'prop-types'
import {h} from 'preact'

export default function FilterApplication (props) {
	if (props.applications.length === 1) return null

	return h(
		'div',
		null,
		h(
			'select',
			{
				value: props.filter,
				onChange: props.onChange,
			},
			h('option', {value: ''}, 'Show all'),
			props.applications.map((value, key) => h('option', {key, value}, value))
		)
	)
}

FilterApplication.propTypes = {
	applications: PropTypes.array,
	filter: PropTypes.string,
	onChange: PropTypes.func,
}
