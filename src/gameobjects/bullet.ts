import * as THREE from "three";
import { PointLightObject } from './pointLightObject';

export default class Bullet
{
	public readonly group: THREE.Group;
	private readonly velocity = new THREE.Vector3();

	pointLight?: PointLightObject;

	private isDead = false;

	constructor(scene: THREE.Scene, group: THREE.Group)
	{
		this.group = group;

		this.pointLight = new PointLightObject(scene, new THREE.Color('white'), 0.9, 1, 0.1, 
			new THREE.Vector3(0, 0, 0));

		if(this.pointLight.pointLight != null)
			this.group.add(this.pointLight.pointLight);

		setTimeout(() => {
			this.isDead = true
		}, 1000);
	}

	get shouldRemove()
	{
		return this.isDead;
	}

	setVelocity(x: number, y: number, z: number)
	{
		this.velocity.set(x, y, z);
	}

	removeLight() {
		this.pointLight?.remove();
	}

	update()
	{
		this.group.position.x += this.velocity.x;
		this.group.position.y += this.velocity.y;
		this.group.position.z += this.velocity.z;
 
		if(this.pointLight != null) {
			//this.pointLight?.setPosition(this.group.position);
			//this.pointLight?.update();
		}
		
	}
}