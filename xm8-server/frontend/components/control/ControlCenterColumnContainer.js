import React from 'react';
import { connect } from 'react-redux';

import { getGroups, getSelectedGroupId } from './groupTools';
import {getInputsAsJS} from "../../state/selectors";
import ControlCenterColumn from './ControlCenterColumn';

const mapStateToProps = (state, ownProps) => {

  let groups = getGroups(state);
  let inputs = getInputsAsJS(state);
  let selectedGroupId = getSelectedGroupId(state, inputs);
  let selectedGroup = groups[selectedGroupId];

  return {
    inputs,
    inputValues: state.controllers.toJS(),
    selectedGroup
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}


const ControlCenterColumnContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ControlCenterColumn);

export default ControlCenterColumnContainer;