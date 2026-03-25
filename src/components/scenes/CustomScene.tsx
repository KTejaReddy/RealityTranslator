import { Suspense } from 'react';
import { useGLTF, Html, Center } from '@react-three/drei';
import { Custom3DConfig } from '@/lib/scenarios';
import { Ground, Particles, AmbientDust, Building, Tree, Water, MovingObject, Human, Furniture, Decoration, Plant, Nature, Dome, Road, Tower } from './ScenePrimitives';

interface CustomSceneProps {
  config: Custom3DConfig;
  sliders: Record<string, number>;
}

export function CustomScene({ config, sliders }: CustomSceneProps) {
  if (!config) return <Ground />;
  
  const sliderVals = Object.values(sliders);
  const sliderAvg = sliderVals.length > 0 ? sliderVals.reduce((a, b) => a + b, 0) / sliderVals.length : 50;
  const intensity = (sliderAvg / 100) * 1.0 + 0.5;

  return (
    <group>
      <Ground color={config.groundColor || '#1a1e2e'} size={12} />
      
      {config.objects.map((obj, i) => {
         const factor = (obj.linkedSlider && sliders[obj.linkedSlider] !== undefined)
           ? Math.max(0, sliders[obj.linkedSlider] / 50)
           : intensity;

         switch(obj.type) {
           case 'particles':
             return <Particles key={i} color={obj.color || '#ffffff'} count={Math.floor((obj.count || 500) * factor)} spread={obj.size || 10} speed={(obj.speed || 1) * factor} />;
           case 'ambientDust':
             return <AmbientDust key={i} color={obj.color || '#a855f7'} count={Math.floor((obj.count || 200) * factor)} />;
           case 'building':
             return <Building key={i} color={obj.color || '#1a2a4a'} height={(obj.height || 5) * factor} width={obj.width || 2} position={obj.position || [0, 0, 0]} rotation={obj.rotation || [0, 0, 0]} />;
           case 'tower':
             return <Tower key={i} color={obj.color || '#223344'} height={(obj.height || 8) * factor} width={obj.width || 1.5} position={obj.position || [0, 0, 0]} rotation={obj.rotation || [0, 0, 0]} />;
           case 'dome':
             return <Dome key={i} color={obj.color || '#ffffff'} size={(obj.size || 2) * factor} position={obj.position || [0, 0, 0]} />;
           case 'road':
             return <Road key={i} color={obj.color || '#222222'} width={obj.width || 4} height={obj.height || 10} position={obj.position || [0, 0, 0]} rotation={obj.rotation || [0, 0, 0]} />;
           case 'tree':
             return <Tree key={i} position={obj.position || [0, 0, 0]} scale={(obj.size || 1) * factor} />;
           case 'water':
             return <Water key={i} color={obj.color || '#0066aa'} size={obj.size || 15} intensity={factor} />;
           case 'human':
             return <Human key={i} position={obj.position || [0, 0, 0]} color={obj.color || '#ffcc99'} scale={(obj.size || 1) * factor} />;
           case 'furniture':
             return <Furniture key={i} position={obj.position || [0, 0, 0]} color={obj.color || '#8b5a2b'} scale={(obj.size || 1) * factor} />;
           case 'decoration':
             return <Decoration key={i} position={obj.position || [0, 0, 0]} color={obj.color || '#ff0055'} scale={(obj.size || 1) * factor} />;
           case 'plant':
             return <Plant key={i} position={obj.position || [0, 0, 0]} color={obj.color || '#2d8a4e'} scale={(obj.size || 1) * factor} />;
           case 'nature':
             return <Nature key={i} position={obj.position || [0, 0, 0]} color={obj.color || '#555555'} scale={(obj.size || 1) * factor} />;
           case 'vehicle':
           case 'movingObject':
             if (obj.path && obj.path.length > 0) {
                 return <MovingObject key={i} color={obj.color || '#ffffff'} path={obj.path} speed={(obj.speed || 0.1) * factor} size={obj.size || 0.5} />;
             }
             return null;
           default: return null;
         }
      })}
    </group>
  );
}
