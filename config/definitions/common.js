'use strict';
/**
 * Common definitions.
 */

/** Default units for data types. */
const units = {
    MeasureAirTemperatureCelsiusDegree: '°C',
    MeasureAirHumidityPercentage: '%',
    MeasureAirRelativeHumidityPercentage: '%',
    MeasureAirCO2LevelPartsPerMillion: 'ppm',
    MeasureAirParticleMatterMicrogramsPerCubic: 'μG/m³',
    MeasureAirVolatileCompoundsPartsPerBillion: 'ppb',
    MeasureAirPressureMillibar: 'mBar',
    MeasureActivityPerHour: '',
    MeasurePresence: '',
    MeasureState: '',
    MeasureCount: '',
    MeasureNoiseDecibel: 'dB',
    MeasureLightLevelLux: 'lux',
    MeasureDistanceMilliMeter: 'mm',
    MeasureEnergyConsumptionKilowattHour: 'kWh',
    MeasureWaterConsumptionLitre: 'l',
    MeasureWaterColdConsumptionLitre: 'l',
    MeasureWaterHotConsumptionLitre: 'l',
    /** Legacy */
    MeasureAirCO2LevelPPM: 'ppm',
};

/** Default targets for data types. */
const targets = {
    MeasureAirTemperatureCelsiusDegree: 'Air',
    MeasureAirHumidityPercentage: 'Air',
    MeasureAirRelativeHumidityPercentage: 'Air',
    MeasureAirCO2LevelPartsPerMillion: 'Air',
    MeasureAirParticleMatterMicrogramsPerCubic: 'Air',
    MeasureAirVolatileCompoundsPartsPerBillion: 'Air',
    MeasureAirPressureMillibar: 'Air',
    MeasureActivityPerHour: '',
    MeasurePresence: '',
    MeasureState: '',
    MeasureCount: '',
    MeasureNoiseDecibel: 'Noise',
    MeasureLightLevelLux: 'Light',
    MeasureDistanceMilliMeter: '',
    MeasureEnergyConsumptionKilowattHour: 'Energy',
    MeasureWaterConsumptionLitre: 'Water',
    MeasureWaterColdConsumptionLitre: 'Water',
    MeasureWaterHotConsumptionLitre: 'Water',
    /** Legacy */
    MeasureAirCO2LevelPPM: 'Air',
};

/** Default properties for data types. */
const properties = {
    MeasureAirTemperatureCelsiusDegree: 'Temperature',
    MeasureAirHumidityPercentage: 'Humidity',
    MeasureAirRelativeHumidityPercentage: 'RelativeHumidity',
    MeasureAirCO2LevelPartsPerMillion: 'Concentration',
    MeasureAirParticleMatterMicrogramsPerCubic: 'ParticleMatter',
    MeasureAirVolatileCompoundsPartsPerBillion: 'VolatileOrganicCompounds',
    MeasureAirPressureMillibar: 'Pressure',
    MeasureActivityPerHour: '',
    MeasurePresence: '',
    MeasureState: '',
    MeasureCount: '',
    MeasureNoiseDecibel: '',
    MeasureLightLevelLux: '',
    MeasureDistanceMilliMeter: '',
    MeasureEnergyConsumptionKilowattHour: 'Consumption',
    MeasureWaterConsumptionLitre: 'Volume',
    MeasureWaterColdConsumptionLitre: 'Volume',
    MeasureWaterHotConsumptionLitre: 'Volume',
    /** Legacy */
    MeasureAirCO2LevelPPM: 'Concentration',
};

/**
 * Expose definitions.
 */
module.exports = {
    units,
    targets,
    properties,
};
