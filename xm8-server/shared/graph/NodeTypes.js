import _ from 'lodash';
import { paramTypesById } from './ParameterTypes';
// TODO: Add property key as key instead, and loop over list to make map?

// global type blacklist is only used if no white or blacklist exists for a parameter
const globalTypeBlacklist = [
  paramTypesById.OUTPUT.id
];

const nodeTypesById = {
  NOT_SELECTED: {
    hwId: "-1", name: "Type not selected", params: []
  },
  SUM: {
    hwId: 24,
    name: "Sum", 
    description: "Sum two or more values",
    hasVariableParamsLength: true,    
    params: [{
      id: "0",
      name: "Value 1",
      validator: function(value){},
      optional: false
    },
    {
      id: "1",
      name: "Value 2",
      validator: function(value){},
      optional: false
    },
    {
      id: "2",
      name: "Value 3",
      validator: function(value){},
      optional: true
    },
    {
      id: "3",
      name: "Value 4",
      validator: function(value){},
      optional: true
    },
    {
      id: "4",
      name: "Value 5",
      validator: function(value){},
      optional: true
    },
    {
      id: "5",
      name: "Value 6",
      validator: function(value){},
      optional: true
    },
    {
      id: "6",
      name: "Value 7",
      validator: function(value){},
      optional: true
    },
    {
      id: "7",
      name: "Value 8",
      validator: function(value){},
      optional: true
    }]
  },
  INVERT: {
    hwId: 1,
    name: "Invert", 
    description: "Invert around 0",
    hasVariableParamsLength: false,
    params: [{
      id: "0",
      name: "Value to invert",
      validator: function(value){},
      optional: false
    }]
  },
  INVERT_EACH_SIDE: {
    hwId: 2,
    name: "Invert each side", 
    description: "Invert around positive or negative center",
    hasVariableParamsLength: false,
    params: [{
      id: "0",
      name: "Value to invert",
      validator: function(value){},
      optional: false
    }]
  },
  RAMP: {
    hwId: 3, name: "Ramp", params: []
  },
  DELAY_LINE: {
    hwId: 4,
    name: "Delay line", 
    description: "Delay a value for one cycle, allowing loops in the network",
    hasVariableParamsLength: false,
    maySetInitialResult: true,
    params: [{
      id: "0",
      name: "Value to delay",
      validator: function(value){},
      optional: false
    }]
  },
  MULTIPLY: {
    hwId: 5,
    name: "Multiply",
    description: "Multiply two or more values",
    hasVariableParamsLength: true,
    params: [{
      id: "0",
      name: "Value 1",
      validator: function(value){},
      optional: false
    },
    {
      id: "1",
      name: "Value 2",
      validator: function(value){},
      optional: false
    },
    {
      id: "2",
      name: "Value 3",
      validator: function(value){},
      optional: true
    },
    {
      id: "3",
      name: "Value 4",
      validator: function(value){},
      optional: true
    },
    {
      id: "4",
      name: "Value 5",
      validator: function(value){},
      optional: true
    },
    {
      id: "5",
      name: "Value 6",
      validator: function(value){},
      optional: true
    },
    {
      id: "6",
      name: "Value 7",
      validator: function(value){},
      optional: true
    },
    {
      id: "7",
      name: "Value 8",
      validator: function(value){},
      optional: true
    }]
  },
  MEMORY: {
    hwId: 6,
    name: "Memory",
    description: "Sample and hold a value",    
    hasVariableParamsLength: false,
    params: [{
      id: "0",
      name: "Value to sample",
      validator: function(value){},
      optional: false
    },
    {
      id: "1",
      name: "Set",
      validator: function(value){},
      optional: false
    },
    {
      id: "2",
      name: "Reset",
      validator: function(value){},
      optional: false
    }]     
  },
  LFO_PULSE: {
    hwId: 7,
    name: "Lfo - pulse",
    description: "Square wave LFO with variable pulse width and amplitude", 
    hasVariableParamsLength: false,
    params: [{
      id: "0",
      name: "Cycle length",
      validator: function(value){},
      optional: false
    },
    {
      id: "1",
      name: "Pulse width",
      validator: function(value){},
      optional: false
    },
    {
      id: "2",
      name: "Trigger",
      validator: function(value){},
      optional: false
    },
    {
      id: "3",
      name: "Max positive",
      validator: function(value){},
      optional: false
    },
    {
      id: "4",
      name: "Max negative",
      validator: function(value){},
      optional: false
    },
    {
      id: "5",
      name: "Start position",
      validator: function(value){},
      optional: false
    }]
  },
  SWITCH: {
    hwId: 8,
    name: "Switch",
    description: "Passes or blocks a signal", 
    hasVariableParamsLength: false,    
    params: [{
      id: "0",
      name: "Value",
      validator: function(value){},
      optional: false
    },
    {
      id: "1",
      name: "Switch control",
      validator: function(value){},
      optional: false
    }]
  },
  COMPARE: {
    hwId: 9,
    name: "Compare", 
    description: "Compares values, if value 1 is larger, output is max, else it is min.",
    hasVariableParamsLength: false,    
    params: [{
      id: "0",
      name: "Value 1",
      validator: function(value){},
      optional: false
    },
    {
      id: "1",
      name: "Value 2",
      validator: function(value){},
      optional: false
    }]
  },
  MAX: {
    hwId: 10,
    name: "Max",    
    description: "Maximum of value 1 to value 8",
    hasVariableParamsLength: true,
    params: [{
      id: "0",
      name: "Value 1",
      validator: function(value){},
      optional: false
    },
    {
      id: "1",
      name: "Value 2",
      validator: function(value){},
      optional: false
    },
    {
      id: "2",
      name: "Value 3",
      validator: function(value){},
      optional: true
    },
    {
      id: "3",
      name: "Value 4",
      validator: function(value){},
      optional: true
    },
    {
      id: "4",
      name: "Value 5",
      validator: function(value){},
      optional: true
    },
    {
      id: "5",
      name: "Value 6",
      validator: function(value){},
      optional: true
    },
    {
      id: "6",
      name: "Value 7",
      validator: function(value){},
      optional: true
    },
    {
      id: "7",
      name: "Value 8",
      validator: function(value){},
      optional: true
    }]
  },
  MIN: {
    hwId: 1,
    name: "Min", 
    description: "Minimum of parameter 1 to parameter 8",
    hasVariableParamsLength: true,
    params: [{
      id: "0",
      name: "Value 1",
      validator: function(value){},
      optional: false
    },
    {
      id: "1",
      name: "Value 2",
      validator: function(value){},
      optional: false
    },
    {
      id: "2",
      name: "Value 3",
      validator: function(value){},
      optional: true
    },
    {
      id: "3",
      name: "Value 4",
      validator: function(value){},
      optional: true
    },
    {
      id: "4",
      name: "Value 5",
      validator: function(value){},
      optional: true
    },
    {
      id: "5",
      name: "Value 6",
      validator: function(value){},
      optional: true
    },
    {
      id: "6",
      name: "Value 7",
      validator: function(value){},
      optional: true
    },
    {
      id: "7",
      name: "Value 8",
      validator: function(value){},
      optional: true
    }]
  },
  SCALE: {
    hwId: 12,
    name: "Scale",
    description: "Scales value by factor, where factor / (MAX_POSITIVE + 1)",
    hasVariableParamsLength: false,    
    params: [{
      id: "0",
      name: "Value to scale",
      validator: function(value){},
      optional: false
    },
    {
      id: "1",
      name: "Scale factor",
      validator: function(value){},
      optional: false
    }]
  },
  TRIGGER: {
    hwId: 13,
    name: "Trigger", 
    description: "Generates a pulse lasting for one cycle after the input changes from negative to positive.",
    hasVariableParamsLength: false,   
    params: [{
      id: "0",
      name: "Control",
      validator: function(value){},
      optional: false
    }]
  },
  BINARY_AND: {
    hwId: 14,
    name: "Binary and", 
    description: "Treat inputs as a binary values and binary AND them",
    hasVariableParamsLength: true,   
    params: [{
      id: "0",
      name: "Value 1",
      validator: function(value){},
      optional: false
    },
    {
      id: "1",
      name: "Value 2",
      validator: function(value){},
      optional: false
    },
    {
      id: "2",
      name: "Value 3",
      validator: function(value){},
      optional: true
    },
    {
      id: "3",
      name: "Value 4",
      validator: function(value){},
      optional: true
    },
    {
      id: "4",
      name: "Value 5",
      validator: function(value){},
      optional: true
    },
    {
      id: "5",
      name: "Value 6",
      validator: function(value){},
      optional: true
    },
    {
      id: "6",
      name: "Value 7",
      validator: function(value){},
      optional: true
    },
    {
      id: "7",
      name: "Value 8",
      validator: function(value){},
      optional: true
    }]
  },
  BINARY_OR: {
    hwId: 15,
    name: "Binary or", 
    description: "Treat inputs as a binary values and binary OR them",
    hasVariableParamsLength: true,   
    params: [{
      id: "0",
      name: "Value 1",
      validator: function(value){},
      optional: false
    },
    {
      id: "1",
      name: "Value 2",
      validator: function(value){},
      optional: false
    },
    {
      id: "2",
      name: "Value 3",
      validator: function(value){},
      optional: true
    },
    {
      id: "3",
      name: "Value 4",
      validator: function(value){},
      optional: true
    },
    {
      id: "4",
      name: "Value 5",
      validator: function(value){},
      optional: true
    },
    {
      id: "5",
      name: "Value 6",
      validator: function(value){},
      optional: true
    },
    {
      id: "6",
      name: "Value 7",
      validator: function(value){},
      optional: true
    },
    {
      id: "7",
      name: "Value 8",
      validator: function(value){},
      optional: true
    }]
  },
  BINARY_XOR: {
    hwId: 16,
    name: "Binary xor", 
    description: "Treat inputs as a binary values and binary XOR them",
    hasVariableParamsLength: false,   
    params: [{
      id: "0",
      name: "Value 1",
      validator: function(value){},
      optional: false
    },
    {
      id: "1",
      name: "Value 2",
      validator: function(value){},
      optional: false
    }]
  },
  BINARY_NOT: {
    hwId: 17,
    name: "Binary not", 
    description: "Treat input as a binary value and binary INVERT it",
    hasVariableParamsLength: false,   
    params: [{
      id: "0",
      name: "Value to Invert",
      validator: function(value){},
      optional: false
    }]
  },
  BUFFER_PARAMETER: {
    hwId: 18,
    name: "Buffer parameter", 
    description: "Buffer a value for the entire duration of the graph calculation cycle. Use this if an input must be guaranteed to be the same for all nodes during a cycle",
    hasVariableParamsLength: false,   
    params: []
  },
  OUTPUT: {
    hwId: 19,
    name: "Output",     
    description: "Write output to voice",
    hasVariableParamsLength: false,
    notLinkableFrom: true,
    params: [{
      id: "0",
      name: "Output value",
      validator: function(value){},
      optional: false
    },
    {
      id: "1",
      name: "Output target",
      validator: function(value){},
      optional: false,
      typeWhitelist: [paramTypesById.OUTPUT.id]
    }]    
  }, 
  OUTPUT_TUNED: {
    hwId: 20,
    name: "Output tuned",
    description: "Write output to voice and correct for vco tuning",
    hasVariableParamsLength: false,
    notLinkableFrom: true,
    params: [{
      id: "0",
      name: "Output value",
      validator: function(value){},
      optional: false
    },
    {
      id: "1",
      name: "Output to VCO",
      validator: function(value){},
      optional: false,
      typeWhitelist: [paramTypesById.OUTPUT.id]
    }]
  },
  GLIDE: {
    hwId: 21,
    name: "Glide", 
    description: "Glide any output. Resists change.",
    hasVariableParamsLength: false,
    params: [{
      id: "0",
      name: "Value",
      validator: function(value){},
      optional: false
    },
    {
      id: "1",
      name: "Rate of change",
      validator: function(value){},
      optional: false
    },
    {
      id: "3",
      name: "Glide on up",
      validator: function(value){},      
      optional: false
    },
    {
      id: "4",
      name: "Glide on down",
      validator: function(value){},
      optional: false
    }]
  },  
  QUANTIZE: {
    hwId: 22,
    name: "Quantize", 
    hasVariableParamsLength: false,
    params: []
  },  
  POSITIVE_EXPONENTIAL: {
    hwId: 23,
    name: "Positive exponential", 
    description: "Convert linear value to exponential. Only positive values are converted, all others are 0, to allow maximum offness.",
    hasVariableParamsLength: false,
    params: [{
      id: "0",
      name: "Value",
      validator: function(value){},
      optional: false
    }]
  }
};

// add ids to each object
_.each(nodeTypesById, (nodeType, id) => {
  nodeType.id = id;
});

const nodeTypes = [
  nodeTypesById.NOT_SELECTED,
  nodeTypesById.SUM,
  nodeTypesById.INVERT,
  nodeTypesById.INVERT_EACH_SIDE,
  nodeTypesById.RAMP,
  nodeTypesById.DELAY_LINE,
  nodeTypesById.MULTIPLY,
  nodeTypesById.MEMORY,
  nodeTypesById.LFO_PULSE,
  nodeTypesById.SWITCH,
  nodeTypesById.COMPARE,
  nodeTypesById.MAX,
  nodeTypesById.MIN,
  nodeTypesById.SCALE,
  nodeTypesById.TRIGGER,
  nodeTypesById.BINARY_AND,
  nodeTypesById.BINARY_OR,
  nodeTypesById.BINARY_XOR,
  nodeTypesById.BINARY_NOT,
  nodeTypesById.BUFFER_PARAMETER,
  nodeTypesById.OUTPUT,
  nodeTypesById.OUTPUT_TUNED,
  nodeTypesById.GLIDE,
  nodeTypesById.QUANTIZE,
  nodeTypesById.POSITIVE_EXPONENTIAL
];

export { nodeTypesById, nodeTypes, globalTypeBlacklist };
