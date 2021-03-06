// TODO: Controllers should have default send/receive midi messages (?)
// TODO: Send panel cc should be toggleable.
import _ from 'lodash';

let panelControllersById = {
  PC_VIRTUAL: {
    hwId: -1,
    name: {
      full: "None (virtual)",
      short: 'virtual'
    },
    type: 'VIRTUAL',
    midi: {status: '', data1: ''}

  },
  PC_OSC_1_PITCH: {
    hwId: 0,
    name: {
      full: "Osc 1 pitch",
      short: 'pitch'
    },
    type: 'POT',
    midi: {status: 0xB0, data1: ''}

  },
  PC_OSC_1_SQUARE: {
    hwId: 1,
    name: {
      full: "Osc 1 square",
      short: 'square'
    },
    type: 'POT',
    midi: {status: 0xB0, data1: ''}
  },
  PC_OSC_1_SAW: {
    hwId: 2,
    name: {
      full: "Osc 1 saw",
      short: 'saw'
    },
    type: 'POT',
    midi: {status: 0xB0, data1: ''}
  },
  PC_OSC_1_TRIANGLE: {
    hwId: 3,
    name: {
      full: "Osc 1 triangle",
      short: 'triangle'
    },
    type: 'POT',
    midi: {status: 0xB0, data1: ''}
  },
  PC_OSC_2_PITCH: {
    hwId: 4,
    name: {
      full: "Osc 1 pitch",
      short: 'pitch'
    },
    type: 'POT',
    midi: {status: 0xB0, data1: ''}
  },
  PC_OSC_3_PITCH: {
    hwId: 5,
    name: {
      full: "Osc 1 pitch",
      short: 'pitch'
    },
    type: 'POT',
    midi: {status: 0xB0, data1: ''}
  },
  PC_FILTER_1_CUTOFF: {
    hwId: 6,
    name: {
      full: "Filter 1 cut-off",
      short: 'cut-off'
    },
    type: 'POT',
    midi: {status: 0xB0, data1: ''}
  },
  PC_FILTER_1_RESONANCE: {
    hwId: 7,
    name: {
      full: "Filter 1 resonance",
      short: 'resonance'
    },
    type: 'POT',
    midi: {status: 0xB0, data1: ''}
  },
  PC_FILTER_1_SLOPE: {
    hwId: 8,
    name: {
      full: "Filter 1 slope",
      short: 'slope'
    },
    type: 'SWITCH',
    midi: {status: 0xB0, data1: ''},
    options: [
      {id: '0', label: '12 dB'},
      {id: '1', label: '24 dB'}
    ]
  },
  PC_FILTER_1_MODE: {
    hwId: 9,
    name: {
      full: "Filter 1 mode",
      short: 'mode'
    },
    type: 'SWITCH',
    midi: {status: 0xB0, data1: ''},
    options: [
      {id: '0', label: 'HP'},
      {id: '1', label: 'BP'},
      {id: '2', label: 'LP'}
    ]
  },
  PC_AMP_ENV_ATTACK: {
    hwId: 10,
    name: {
      full: "Amp attack",
      short: 'attack'
    },
    type: 'POT',
    midi: {status: 0xB0, data1: ''}
  },
  PC_AMP_ENV_DECAY: {
    hwId: 11,
    name: {
      full: "Amp decay",
      short: 'decay'
    },
    type: 'POT',
    midi: {status: 0xB0, data1: ''}
  },
  PC_AMP_ENV_SUSTAIN: {
    hwId: 12,
    name: {
      full: "Amp sustain",
      short: 'sustain'
    },
    type: 'POT',
    midi: {status: 0xB0, data1: ''}
  },
  PC_AMP_ENV_RELEASE: {
    hwId: 13,
    name: {
      full: "Amp release",
      short: 'release'
    },
    type: 'POT',
    midi: {status: 0xB0, data1: ''}
  },
  PC_FILTER_1_ENV_ATTACK: {
    hwId: 14,
    name: {
      full: "Filter 1 attack",
      short: 'attack'
    },
    type: 'POT',
    midi: {status: 0xB0, data1: ''}
  },
  PC_FILTER_1_ENV_DECAY: {
    hwId: 15,
    name: {
      full: "Filter 1 decay",
      short: 'decay'
    },
    type: 'POT',
    midi: {status: 0xB0, data1: ''}
  },
  PC_FILTER_1_ENV_SUSTAIN: {
    hwId: 16,
    name: {
      full: "Filter 1 sustain",
      short: 'sustain'
    },
    type: 'POT',
    midi: {status: 0xB0, data1: ''}
  },
  PC_FILTER_1_ENV_RELEASE: {
    hwId: 17,
    name: {
      full: "Filter 1 release",
      short: 'release'
    },
    type: 'POT',
    midi: {status: 0xB0, data1: ''}
  }
}

// Add id to controllers and add to a list.
let panelControllers = [];
_.each(panelControllersById, (panelController, id) => {
  panelController.id = id;
  panelControllers.push(panelController);
});

export { panelControllers, panelControllersById };