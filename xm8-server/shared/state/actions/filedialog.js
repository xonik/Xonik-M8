export const toggleFileDialog = (show, mode) => {
  return {
    type: 'TOGGLE_FILE_DIALOG',
    target: 'GUI',
    show,
    mode
  };
}
      
export const selectFolder = (selectedFolderId) => {
  return {
    type: 'SET_FILE_DIALOG_SELECTED_FOLDER',
    target: 'GUI',    
    selectedFolderId
  }  
}

      
export const selectFile = (selectedFileId, filename) => {
  return {
    type: 'SET_FILE_DIALOG_SELECTED_FILE',
    target: 'GUI',    
    selectedFileId,
    filename
  }  
}
     
export const setFilename = (filename) => {
  return {
    type: 'SET_FILE_DIALOG_FILE_NAME',
    target: 'GUI',    
    filename
  }  
}