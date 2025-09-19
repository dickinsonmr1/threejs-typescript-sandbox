import vehicleConfigOffroader from '../../../gameobjects/vehicles/config/07-offroader.json'
import vehicleConfigTaxi from '../../../gameobjects/vehicles/config/00-taxi.json'
import vehicleConfigAmbulance from '../../../gameobjects/vehicles/config//01-ambulance.json'
import vehicleConfigRaceCarBlue from '../../../gameobjects/vehicles/config//02-racecar-blue.json'
import vehicleConfigRaceCarRed from '../../../gameobjects/vehicles/config/03-racecar-red.json'
import vehicleConfigPolice from '../../../gameobjects/vehicles/config/05-police.json'
import vehicleConfigCompactor from '../../../gameobjects/vehicles/config/06-trashTruck.json'
import vehicleConfigFireTruck from '../../../gameobjects/vehicles/config/08-fireTruck.json'
import vehicleConfigPoliceSuv from '../../../gameobjects/vehicles/config/11-policeSuv.json'
import vehicleConfigPoliceTractor from '../../../gameobjects/vehicles/config/09-policeTractor.json'
import vehicleConfigKilldozer from '../../../gameobjects/vehicles/config/04-killdozer.json'
import vehicleConfigHarvester from '../../../gameobjects/vehicles/config/10-harvester.json'
import vehicleConfigTank from '../../../gameobjects/vehicles/config/12-tank.json'
import vehicleConfigTanker from '../../../gameobjects/vehicles/config/13-tanker.json'

import { VehicleConfig } from '../../../gameobjects/vehicles/config/vehicleConfig';

export default class VehicleLibrary {

    public getVehicleConfigAssetName(vehicleName: string): string {
        return this.vehicleConfigs.get(vehicleName)!.asset;
    }

    private vehicleConfigs: Map<string, VehicleConfig> = new Map<string, VehicleConfig>;

    constructor() {
        this.vehicleConfigs.set(vehicleConfigOffroader.vehicleName, vehicleConfigOffroader);
        this.vehicleConfigs.set(vehicleConfigTaxi.vehicleName, vehicleConfigTaxi);
        this.vehicleConfigs.set(vehicleConfigAmbulance.vehicleName, vehicleConfigAmbulance);
        this.vehicleConfigs.set(vehicleConfigRaceCarBlue.vehicleName, vehicleConfigRaceCarBlue);
        this.vehicleConfigs.set(vehicleConfigRaceCarRed.vehicleName, vehicleConfigRaceCarRed);
        this.vehicleConfigs.set(vehicleConfigPolice.vehicleName, vehicleConfigPolice);
        this.vehicleConfigs.set(vehicleConfigCompactor.vehicleName, vehicleConfigCompactor);
        this.vehicleConfigs.set(vehicleConfigFireTruck.vehicleName, vehicleConfigFireTruck);
        this.vehicleConfigs.set(vehicleConfigPoliceSuv.vehicleName, vehicleConfigPoliceSuv);
        this.vehicleConfigs.set(vehicleConfigPoliceTractor.vehicleName, vehicleConfigPoliceTractor);
        this.vehicleConfigs.set(vehicleConfigKilldozer.vehicleName, vehicleConfigKilldozer);
        this.vehicleConfigs.set(vehicleConfigHarvester.vehicleName, vehicleConfigHarvester);
        this.vehicleConfigs.set(vehicleConfigTank.vehicleName, vehicleConfigTank);
        this.vehicleConfigs.set(vehicleConfigTanker.vehicleName, vehicleConfigTanker);
    }
}