import * as CANNON from 'cannon-es'
import { IPlayerVehicle } from './IPlayerVehicle';

export class VehicleUtil {
    
    static calculateSteering(leader: CANNON.RaycastVehicle, follower: CANNON.RaycastVehicle): number {
        const leaderPosition = leader.chassisBody.position;
        const followerPosition = follower.chassisBody.position;
    
         // Get direction from follower to target
         const directionToTarget = new CANNON.Vec3(
            leaderPosition.x - followerPosition.x,
            0,  // We care about x and z, ignoring y for ground vehicles
            leaderPosition.z - followerPosition.z
        );

        // Normalize the direction vector
        directionToTarget.normalize();
    
        // Follower forward vector
        const followerForward = new CANNON.Vec3(0, 0, 1);
        follower.chassisBody.quaternion.vmult(followerForward, followerForward);
    
        // Calculate angle between the directionToLeader and follower's forward vector
        const dotProduct = directionToTarget.dot(followerForward);
        const angle = Math.acos(dotProduct);
    
        // Determine if steering left or right
        const crossProduct = followerForward.cross(directionToTarget);
        const steering = crossProduct.y < 0 ? -angle : angle;
    
        return steering;
    }

    static updateFollowerBehavior(leader: CANNON.RaycastVehicle, follower: CANNON.RaycastVehicle) {
        // Calculate steering
        const steering = VehicleUtil.calculateSteering(leader, follower);
    
        // Apply steering to the follower vehicle
        const maxSteering = Math.PI / 6;  // Limit steering angle
        follower.setSteeringValue(Math.max(-maxSteering, Math.min(maxSteering, steering)), 0);  // Front wheels
    
        // Match speed or follow based on distance
        const distance = leader.chassisBody.position.distanceTo(follower.chassisBody.position);
        const maxSpeed = 1000;
        const minDistance = 5;
        const acceleration = distance > minDistance ? 1 : 0;  // Stop when close to the leader
    
        follower.applyEngineForce(acceleration * maxSpeed, 2);  // Rear wheels
    }
    
    static updateFollowerBehaviorOnIPlayerVehicle(leader: IPlayerVehicle, follower: IPlayerVehicle) {
        // Calculate steering
        const steering = VehicleUtil.calculateSteeringOnIPlayerVehicle(leader, follower);
    
        // Apply steering to the follower vehicle
        const maxSteering = 1;//Math.PI / 2;  // Limit steering angle
        //follower.setSteeringValue(Math.max(-maxSteering, Math.min(maxSteering, steering)), 0);  // Front wheels
        follower.tryTurn(Math.max(-maxSteering, Math.min(maxSteering, steering)));
    
        //// Match speed or follow based on distance
        const distance = leader.getCannonVehicleChassisBody()!.position.distanceTo(follower.getCannonVehicleChassisBody()!.position);
        
        //const maxSpeed = 30; //1000;
        const distantThreshold = 20;
        const closeThreshold = 10;
        //const acceleration = distance > minDistance ? 1 : 0;  // Stop when close to the leader
    
        //follower.applyEngineForce(acceleration * maxSpeed, 2);  // Rear wheels
        
        if(distance > distantThreshold)            
            follower.tryAccelerate(1);
        else if(distance > closeThreshold)
            follower.tryAccelerate(0.5);
    }

    static calculateSteeringOnIPlayerVehicle(leader: IPlayerVehicle, follower: IPlayerVehicle): number {
        const leaderPosition = leader.getCannonVehicleChassisBody()!.position;
        const followerPosition = follower.getCannonVehicleChassisBody()!.position;
    
         // Get direction from follower to target
         const directionToTarget = new CANNON.Vec3(
            leaderPosition.x - followerPosition.x,
            0,  // We care about x and z, ignoring y for ground vehicles
            leaderPosition.z - followerPosition.z
        );

        // Normalize the direction vector
        directionToTarget.normalize();
    
        // Follower forward vector
        const followerForward = new CANNON.Vec3(-1, 0, 0);
        follower.getCannonVehicleChassisBody()!.quaternion.vmult(followerForward, followerForward);
    
        // Calculate angle between the directionToLeader and follower's forward vector
        const dotProduct = directionToTarget.dot(followerForward);
        const angle = Math.acos(dotProduct);
    
        // Determine if steering left or right
        const crossProduct = followerForward.cross(directionToTarget);
        const steering = crossProduct.y < 0 ? -angle : angle;
    
        return steering;
    }
    
}