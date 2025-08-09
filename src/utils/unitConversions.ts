
export type MeasurementSystem = 'metric' | 'imperial';

// Weight conversions
export const convertWeight = (value: number, from: MeasurementSystem, to: MeasurementSystem): number => {
  if (from === to) return value;
  
  if (from === 'metric' && to === 'imperial') {
    // kg to lbs
    return value * 2.20462;
  } else if (from === 'imperial' && to === 'metric') {
    // lbs to kg
    return value / 2.20462;
  }
  
  return value;
};

// Height conversions
export const convertHeight = (value: number, from: MeasurementSystem, to: MeasurementSystem): number => {
  if (from === to) return value;
  
  if (from === 'metric' && to === 'imperial') {
    // cm to inches
    return value / 2.54;
  } else if (from === 'imperial' && to === 'metric') {
    // inches to cm
    return value * 2.54;
  }
  
  return value;
};

// Distance conversions
export const convertDistance = (value: number, from: MeasurementSystem, to: MeasurementSystem): number => {
  if (from === to) return value;
  
  if (from === 'metric' && to === 'imperial') {
    // km to miles
    return value * 0.621371;
  } else if (from === 'imperial' && to === 'metric') {
    // miles to km
    return value / 0.621371;
  }
  
  return value;
};

// Get unit labels
export const getWeightUnit = (system: MeasurementSystem): string => {
  return system === 'metric' ? 'kg' : 'lbs';
};

export const getHeightUnit = (system: MeasurementSystem): string => {
  return system === 'metric' ? 'cm' : 'in';
};

export const getDistanceUnit = (system: MeasurementSystem): string => {
  return system === 'metric' ? 'km' : 'mi';
};

// Format values with appropriate decimal places
export const formatWeight = (value: number, system: MeasurementSystem): string => {
  const decimals = system === 'imperial' ? 1 : 1;
  return value.toFixed(decimals);
};

export const formatHeight = (value: number, system: MeasurementSystem): string => {
  const decimals = system === 'imperial' ? 1 : 0;
  return value.toFixed(decimals);
};

export const formatDistance = (value: number, system: MeasurementSystem): string => {
  const decimals = system === 'imperial' ? 2 : 2;
  return value.toFixed(decimals);
};
