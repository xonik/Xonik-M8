import React from 'react';
import { connect } from 'react-redux';
import { getLinks } from '../LinkFunctions';
import { selectNode, selectLink, deleteNode, deleteLink } from '../../../../shared/state/actions/nodes';
import { getNodes, getGuiPatchview } from '../../../state/selectors';
import NodeLinkList from './NodeLinkList';

const mapStateToProps = (state, ownProps) => {
  let nodes = getNodes(state).toJS();

  return {
    links: getLinks(nodes),
    nodes,
    selectedNodeId: getGuiPatchview(state).get('selectedNode'),
    selectedLinkId: getGuiPatchview(state).get('selectedLink')
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onNodeClick: (id) => dispatch(selectNode(id)),
    onLinkClick: (id) => dispatch(selectLink(id)),
    onNodeDeleteClick: (id) => dispatch(deleteNode(id)),
    onLinkDeleteClick: (id) => dispatch(deleteLink(id))
  }
}


const NodeLinkListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(NodeLinkList);

export default NodeLinkListContainer;