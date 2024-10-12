export default class SceneUtility {
    
    static getAllLoadedTextures(scene: THREE.Scene): THREE.Texture[] {
        const textures = new Set<THREE.Texture>();

        scene.traverse((object) => {
            if ((object as THREE.Mesh).isMesh) {
                const mesh = object as THREE.Mesh;
                const material = mesh.material;
                if (Array.isArray(material)) {
                    material.forEach((mat) => {
                        SceneUtility.collectTextures(mat, textures);
                    });
                } else if (material) {
                    SceneUtility.collectTextures(material, textures);
                }
            }
        });

        return Array.from(textures);
    }

    static collectTextures(material: THREE.Material, textures: Set<THREE.Texture>): void {
        const textureProps: string[] = [
            'map', 'lightMap', 'aoMap', 'emissiveMap', 'bumpMap', 'normalMap',
            'displacementMap', 'roughnessMap', 'metalnessMap', 'alphaMap',
            'envMap', 'clearcoatMap', 'clearcoatNormalMap', 'clearcoatRoughnessMap',
            'sheenColorMap', 'sheenRoughnessMap', 'transmissionMap', 'thicknessMap'
        ];

        textureProps.forEach((prop) => {
            //var temp = prop as keyof THREE.Material;
            const texture = material[prop as keyof THREE.Material] as THREE.Texture | undefined;
            if (texture) {
                textures.add(texture);
            }
        });
    }
}