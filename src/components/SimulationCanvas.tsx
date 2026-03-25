import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Sky } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

import { ClimateScene } from './scenes/ClimateScene';
import { TrafficScene } from './scenes/TrafficScene';
import { CityScene } from './scenes/CityScene';
import { OceanScene } from './scenes/OceanScene';
import { EnergyScene } from './scenes/EnergyScene';
import { PandemicScene } from './scenes/PandemicScene';
import { EconomyScene } from './scenes/EconomyScene';
import { AgricultureScene } from './scenes/AgricultureScene';
import { SpaceScene } from './scenes/SpaceScene';
import { WildlifeScene } from './scenes/WildlifeScene';
import { CyberScene } from './scenes/CyberScene';
import { EducationScene } from './scenes/EducationScene';
import { WeatherScene } from './scenes/WeatherScene';

import { CustomScene } from './scenes/CustomScene';
import type { Custom3DConfig } from '@/lib/scenarios';

interface SimulationCanvasProps {
  scenario: string;
  sliderValues: Record<string, number>;
  custom3D?: Custom3DConfig;
}

const cameraPresets: Record<string, { position: [number, number, number]; fov: number }> = {
  climate: { position: [0, 2, 5.5], fov: 50 },
  traffic: { position: [0, 4, 5], fov: 45 },
  city: { position: [0, 5, 6], fov: 45 },
  ocean: { position: [0, 1, 5], fov: 50 },
  energy: { position: [0, 4, 6], fov: 48 },
  pandemic: { position: [0, 5, 6], fov: 45 },
  economy: { position: [0, 3, 6], fov: 48 },
  agriculture: { position: [0, 3, 6], fov: 50 },
  space: { position: [0, 3, 6], fov: 50 },
  wildlife: { position: [0, 4, 6], fov: 48 },
  cyber: { position: [0, 3, 5], fov: 50 },
  education: { position: [0, 3, 5], fov: 48 },
  weather: { position: [0, 3, 6], fov: 50 },
  custom: { position: [0, 4, 8], fov: 45 },
};

const SceneComponent = ({ scenario, sliderValues, custom3D }: { scenario: string; sliderValues: Record<string, number>, custom3D?: Custom3DConfig }) => {
  if (scenario === 'custom' && custom3D) {
    return <CustomScene config={custom3D} sliders={sliderValues} />;
  }
  
  switch (scenario) {
    case 'climate': return <ClimateScene sliders={sliderValues} />;
    case 'traffic': return <TrafficScene sliders={sliderValues} />;
    case 'city': return <CityScene sliders={sliderValues} />;
    case 'ocean': return <OceanScene sliders={sliderValues} />;
    case 'energy': return <EnergyScene sliders={sliderValues} />;
    case 'pandemic': return <PandemicScene sliders={sliderValues} />;
    case 'economy': return <EconomyScene sliders={sliderValues} />;
    case 'agriculture': return <AgricultureScene sliders={sliderValues} />;
    case 'space': return <SpaceScene sliders={sliderValues} />;
    case 'wildlife': return <WildlifeScene sliders={sliderValues} />;
    case 'cyber': return <CyberScene sliders={sliderValues} />;
    case 'education': return <EducationScene sliders={sliderValues} />;
    case 'weather': return <WeatherScene sliders={sliderValues} />;
    default: return <ClimateScene sliders={sliderValues} />;
  }
};

const SimulationCanvas = ({ scenario, sliderValues, custom3D }: SimulationCanvasProps) => {
  const cam = cameraPresets[scenario] || cameraPresets.climate;

  return (
    <div className="w-full h-full bg-[#05070e] rounded-lg overflow-hidden">
      <Canvas camera={{ position: cam.position, fov: cam.fov }} dpr={[1, 1.5]} shadows>
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 15, 10]} 
          intensity={1.2} 
          color="#ffffff" 
          castShadow 
          shadow-mapSize={[2048, 2048]} 
          shadow-camera-far={50} 
          shadow-camera-left={-15} 
          shadow-camera-right={15} 
          shadow-camera-top={15} 
          shadow-camera-bottom={-15} 
          shadow-bias={-0.0001} 
        />
        <pointLight position={[-4, 3, -4]} intensity={0.5} color="#a855f7" distance={15} />
        <pointLight position={[4, 2, 4]} intensity={0.5} color="#00e5ff" distance={15} />
        <fog attach="fog" args={['#05070e', 10, 35]} />
        
        <Sky sunPosition={[10, 15, 10]} turbidity={0.1} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
        <Environment preset="city" background={false} />
        
        <ContactShadows position={[0, -0.005, 0]} opacity={0.6} scale={40} blur={2.5} far={10} resolution={256} color="#000000" />
        
        <SceneComponent scenario={scenario} sliderValues={sliderValues} custom3D={custom3D} />
        
        <EffectComposer>
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        <OrbitControls enableDamping dampingFactor={0.05} enableZoom autoRotate autoRotateSpeed={0.2} maxPolarAngle={Math.PI / 2.1} minDistance={2} maxDistance={30} />
      </Canvas>
    </div>
  );
};

export default SimulationCanvas;
