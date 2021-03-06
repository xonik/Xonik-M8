export const types = {
  SELECT_GROUP: 'SELECT_GROUP',
  SELECT_ELEMENT: 'SELECT_ELEMENT',
  DESELECT_ELEMENT: 'DESELECT_ELEMENT',
  DESELECT_DRAG_ELEMENT: 'DESELECT_DRAG_ELEMENT',
  OPEN_NEW_ELEMENT_DIALOG: 'OPEN_NEW_ELEMENT_DIALOG',
  CLOSE_NEW_ELEMENT_DIALOG: 'CLOSE_NEW_ELEMENT_DIALOG',
  SELECT_ID_IN_NEW_ELEMENT_DIALOG: 'SELECT_ID_IN_NEW_ELEMENT_DIALOG'
}

export const selectGroup = (selectedGroupId, patchNumber = '-') =>{
  return {
    type: types.SELECT_GROUP,
    selectedGroupId,
    target: 'GUI',
    patchNumber
  }
}

export const selectElement = (id, mouseX, mouseY, offsetXem, offsetYem, patchNumber = '-') =>{
  return {
    type: types.SELECT_ELEMENT,
    mouseX, 
    mouseY, 
    offsetXem, 
    offsetYem,    
    id,
    target: 'GUI',
    patchNumber
  };  
}

export const deselectElement = (patchNumber = '-') =>{
  return {
    type: types.DESELECT_ELEMENT,
    target: 'GUI',
    patchNumber
  }
}

export const deselectDragElement = (patchNumber = '-') =>{
  return {
    type: types.DESELECT_DRAG_ELEMENT,
    target: 'GUI',
    patchNumber
  }
}

export const openNewElementDialog = (patchNumber = '-') =>{
  return {
    type: types.OPEN_NEW_ELEMENT_DIALOG,
    target: 'GUI',
    patchNumber
  }
}

export const closeNewElementDialog = (patchNumber = '-') =>{
  return {
    type: types.CLOSE_NEW_ELEMENT_DIALOG,
    target: 'GUI',
    patchNumber
  } 
}

export const selectInputInNewElementDialog = (elementType, elementId, patchNumber = '-') =>{
  return {
    type: types.SELECT_ID_IN_NEW_ELEMENT_DIALOG,
    elementId,
    elementType,
    target: 'GUI',
    patchNumber
  }   
}