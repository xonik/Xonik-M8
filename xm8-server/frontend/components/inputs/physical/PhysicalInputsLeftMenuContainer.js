import $ from 'jquery';
import PhysicalInputsLeftMenu from './PhysicalInputsLeftMenu';
import { connect } from 'react-redux';
import { undo, redo, groups as undoGroups } from '../../../../shared/state/actions/undo';

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onUndo: () => dispatch(undo(undoGroups.PHYSICAL_INPUTS)),
    onRedo: () => dispatch(redo(undoGroups.PHYSICAL_INPUTS)),
  }
}

const PhysicalInputsLeftMenuContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PhysicalInputsLeftMenu);

export default PhysicalInputsLeftMenuContainer;