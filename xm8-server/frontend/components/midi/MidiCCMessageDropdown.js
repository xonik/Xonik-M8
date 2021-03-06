import controllerMessages from '../../../shared/midi/MidiControllers';
import {controllersById} from '../../../shared/midi/MidiControllers';

const MidiCCMessageDropdown = ({id, value, highRes, onCCChange, onResolutionChange}) => {

  let controller = controllersById[value];
  let showHiRes = (controller ? controller.hiRes : false);

  return ( 
    <div>
      <label htmlFor={id + '_select'}>Control</label>
      <select id={id + '_select'} value={value} onChange={(e) => onCCChange(e.target.value)}>
        <option value=''>Not selected</option>
        {controllerMessages.map(ccMessage => {
          let name = ccMessage.id + ' ' + (ccMessage.name ? ccMessage.name : ' (undefined)');
          return <option key={ccMessage.id} value={ccMessage.id}>{name}</option>
        })}
      </select>
      {showHiRes &&         
        <span><input id={id + '_hires'} type='checkbox' checked={highRes} onChange={(e) => onResolutionChange(e.target.checked)}/><label htmlFor={id + '_hires'}>High resolution</label></span>
      }
    </div>
  )
}

export default MidiCCMessageDropdown;