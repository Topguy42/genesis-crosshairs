import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Sphere, Box, Cylinder, Environment, Stars, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "./button";
import { SoundButton } from "./sound-button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Crosshair, CrosshairProps } from "./crosshair";
import { cn } from "@/lib/utils";
import { 
  Target, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Trophy,
  Zap,
  Clock,
  Crosshair as CrosshairIcon,
  TrendingUp,
  Volume2,
  VolumeX,
  Eye,
  Layers3,
  Gamepad2,
  Maximize
} from "lucide-react";

interface Target3D {
  id: string;
  position: [number, number, number];
  size: number;
  spawnTime: number;
  lifetime: number;
  isHit?: boolean;
  color: string;
  type: 'sphere' | 'cube' | 'cylinder';
  velocity?: [number, number, number];
  rotation?: [number, number, number];
}

interface TrainingSession3D {
  mode: string;
  score: number;
  accuracy: number;
  targetsHit: number;
  totalTargets: number;
  duration: number;
  averageReactionTime: number;
  bestReactionTime: number;
  headshots: number;
  trackingAccuracy: number;
}

interface AimTrainer3DProps {
  selectedCrosshair?: {
    style: CrosshairProps["style"];
    color: string;
    size: number;
    opacity: number;
    thickness?: number;
    gap?: number;
  };
  onSessionComplete?: (session: TrainingSession3D) => void;
}

// Mouse Look Camera Component with Pointer Lock
function MouseLookCamera() {
  const { camera, gl } = useThree();
  const [isActive, setIsActive] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const rotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      setIsPointerLocked(locked);
      setIsActive(locked);

      // Reset camera rotation to center when pointer lock activates
      if (locked) {
        rotationRef.current = { x: 0, y: 0 };
        camera.rotation.set(0, 0, 0);
        camera.rotation.order = 'YXZ';
      }
    };

    const onPointerLockError = () => {
      console.warn('Pointer lock failed');
      setIsPointerLocked(false);
      setIsActive(false);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isPointerLocked && isActive) {
        // Use movementX/Y for pointer lock (gives relative movement)
        const sensitivity = 0.003;
        rotationRef.current.x -= event.movementY * sensitivity;
        rotationRef.current.y -= event.movementX * sensitivity;

        // Clamp vertical rotation
        rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x));
      }
    };

    const onCanvasClick = () => {
      if (!isPointerLocked) {
        // Reset camera to center
        rotationRef.current = { x: 0, y: 0 };
        camera.rotation.set(0, 0, 0);
        camera.rotation.order = 'YXZ';

        // Request pointer lock
        canvas.requestPointerLock();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      // Allow escape to exit pointer lock
      if (event.key === 'Escape' && isPointerLocked) {
        document.exitPointerLock();
      }
    };

    // Add event listeners
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('pointerlockerror', onPointerLockError);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('click', onCanvasClick);

    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('pointerlockerror', onPointerLockError);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('click', onCanvasClick);
    };
  }, [gl, camera, isActive, isPointerLocked]);

  useFrame(() => {
    if (isActive && isPointerLocked) {
      // Apply rotation to camera
      camera.rotation.x = rotationRef.current.x;
      camera.rotation.y = rotationRef.current.y;
      camera.rotation.order = 'YXZ';
    }
  });

  return null;
}

const TRAINING_MODES_3D = [
  {
    id: "sphere-precision",
    name: "3D Precision",
    description: "Spherical targets floating in 3D space",
    icon: Target,
    targetSize: 0.8,
    targetLifetime: 4000,
    spawnInterval: 2500,
    maxTargets: 4,
    color: "#3b82f6",
    environment: "city",
    allowMovement: false
  },
  {
    id: "speed-cubes",
    name: "Speed Cubes",
    description: "Fast-moving cubic targets for quick reflexes",
    icon: Zap,
    targetSize: 1.0,
    targetLifetime: 2000,
    spawnInterval: 1200,
    maxTargets: 6,
    color: "#eab308",
    environment: "sunset",
    allowMovement: true
  },
  {
    id: "depth-training",
    name: "Depth Perception",
    description: "Targets at various distances to train depth perception",
    icon: Eye,
    targetSize: 0.6,
    targetLifetime: 3500,
    spawnInterval: 2000,
    maxTargets: 5,
    color: "#8b5cf6",
    environment: "dawn",
    allowMovement: false
  },
  {
    id: "tracking-cylinders",
    name: "Tracking Training",
    description: "Moving cylindrical targets for tracking practice",
    icon: TrendingUp,
    targetSize: 0.7,
    targetLifetime: 5000,
    spawnInterval: 3000,
    maxTargets: 3,
    color: "#ef4444",
    environment: "night",
    allowMovement: true
  },
  {
    id: "mixed-shapes",
    name: "Mixed Geometry",
    description: "Various 3D shapes with different behaviors",
    icon: Layers3,
    targetSize: 0.9,
    targetLifetime: 3000,
    spawnInterval: 1800,
    maxTargets: 5,
    color: "#10b981",
    environment: "warehouse",
    allowMovement: true
  }
];

const ENVIRONMENTS = {
  city: "city",
  sunset: "sunset", 
  dawn: "dawn",
  night: "night",
  warehouse: "warehouse"
};

// 3D Target Component
function Target3DObject({
  target,
  onHit,
  mode,
  centerHovered
}: {
  target: Target3D;
  onHit: (id: string) => void;
  mode: any;
  centerHovered: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [mouseHovered, setMouseHovered] = useState(false);

  // Combined hover state (either mouse hover or center crosshair hover)
  const isHovered = mouseHovered || centerHovered;

  useFrame((state, delta) => {
    if (meshRef.current && !target.isHit) {
      // Rotation animation
      if (target.rotation) {
        meshRef.current.rotation.x += target.rotation[0] * delta;
        meshRef.current.rotation.y += target.rotation[1] * delta;
        meshRef.current.rotation.z += target.rotation[2] * delta;
      }

      // Movement animation for moving targets
      if (target.velocity && mode.allowMovement) {
        meshRef.current.position.x += target.velocity[0] * delta;
        meshRef.current.position.y += target.velocity[1] * delta;
        meshRef.current.position.z += target.velocity[2] * delta;
        
        // Bounce off boundaries
        if (Math.abs(meshRef.current.position.x) > 15) {
          target.velocity[0] *= -1;
        }
        if (Math.abs(meshRef.current.position.y) > 8) {
          target.velocity[1] *= -1;
        }
        if (Math.abs(meshRef.current.position.z) > 15) {
          target.velocity[2] *= -1;
        }
      }

      // Pulsing effect
      const timeSinceSpawn = Date.now() - target.spawnTime;
      const pulseFreq = 2;
      const scale = 1 + Math.sin(timeSinceSpawn * 0.001 * pulseFreq) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const targetGeometry = useMemo(() => {
    switch (target.type) {
      case 'cube':
        return <boxGeometry args={[target.size, target.size, target.size]} />;
      case 'cylinder':
        return <cylinderGeometry args={[target.size * 0.5, target.size * 0.5, target.size]} />;
      default:
        return <sphereGeometry args={[target.size * 0.5]} />;
    }
  }, [target.size, target.type]);

  const material = useMemo(() => (
    <meshStandardMaterial
      color={target.isHit ? "#22c55e" : (isHovered ? "#ffffff" : target.color)}
      emissive={target.isHit ? "#22c55e" : (isHovered ? target.color : "#000000")}
      emissiveIntensity={target.isHit ? 0.3 : (isHovered ? 0.1 : 0)}
      roughness={0.3}
      metalness={0.1}
      transparent={target.isHit}
      opacity={target.isHit ? 0.6 : 1}
    />
  ), [target.color, target.isHit, isHovered]);

  return (
    <mesh
      ref={meshRef}
      position={target.position}
      userData={{ targetId: target.id }}
      onPointerOver={() => setMouseHovered(true)}
      onPointerOut={() => setMouseHovered(false)}
    >
      {targetGeometry}
      {material}
      
      {/* Glow effect for targets */}
      <mesh scale={1.2}>
        {targetGeometry}
        <meshBasicMaterial 
          color={target.color} 
          transparent 
          opacity={0.1} 
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Hit effect */}
      {target.isHit && (
        <mesh scale={2}>
          <sphereGeometry args={[target.size * 0.8]} />
          <meshBasicMaterial 
            color="#22c55e" 
            transparent 
            opacity={0.3} 
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </mesh>
  );
}

// 3D Scene Setup Component
function Scene3D({
  targets,
  onTargetHit,
  selectedMode,
  selectedCrosshair,
  cameraPosition,
  enableControls,
  onCenterHover,
  centerHoveredTarget
}: {
  targets: Target3D[];
  onTargetHit: (id: string) => void;
  selectedMode: any;
  selectedCrosshair?: any;
  cameraPosition: [number, number, number];
  enableControls: boolean;
  onCenterHover: (targetId: string | null) => void;
  centerHoveredTarget: string | null;
}) {
  const { camera, gl, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  useEffect(() => {
    camera.position.set(...cameraPosition);
    camera.lookAt(0, 0, 0);
  }, [camera, cameraPosition]);

  // Handle center-screen clicking (crosshair-based targeting)
  useEffect(() => {
    const canvas = gl.domElement;

    const handleCenterClick = () => {
      // Cast ray from center of screen (where crosshair is)
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

      // Get all target meshes in the scene
      const targetMeshes: THREE.Object3D[] = [];
      scene.traverse((child) => {
        if (child.userData.targetId) {
          targetMeshes.push(child);
        }
      });

      // Check for intersections
      const intersects = raycaster.intersectObjects(targetMeshes, true);

      if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        const targetId = hitObject.userData.targetId;
        if (targetId) {
          onTargetHit(targetId);
        }
      }
    };

    canvas.addEventListener('click', handleCenterClick);

    return () => {
      canvas.removeEventListener('click', handleCenterClick);
    };
  }, [camera, gl, scene, raycaster, onTargetHit]);

  // Continuous center-screen hover detection
  useFrame(() => {
    // Cast ray from center of screen for hover detection
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    // Get all target meshes in the scene
    const targetMeshes: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (child.userData.targetId) {
        targetMeshes.push(child);
      }
    });

    // Check for intersections
    const intersects = raycaster.intersectObjects(targetMeshes, true);

    if (intersects.length > 0) {
      const hitObject = intersects[0].object;
      const targetId = hitObject.userData.targetId;
      onCenterHover(targetId);
    } else {
      onCenterHover(null);
    }
  });

  return (
    <>
      {/* Environment and Lighting */}
      <Environment preset={selectedMode.environment} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4f46e5" />
      
      {/* Free Camera Controls with Mouse Look */}
      {enableControls && <MouseLookCamera />}
      


      {/* Grid floor for reference */}
      <gridHelper args={[40, 40, "#444444", "#222222"]} position={[0, -10, 0]} />
      


      {/* 3D Targets */}
      {targets.map((target) => (
        <Target3DObject
          key={target.id}
          target={target}
          onHit={onTargetHit}
          mode={selectedMode}
          centerHovered={centerHoveredTarget === target.id}
        />
      ))}


    </>
  );
}

export function AimTrainer3D({ selectedCrosshair, onSessionComplete }: AimTrainer3DProps) {
  const [selectedMode, setSelectedMode] = useState(TRAINING_MODES_3D[0]);
  const [isTraining, setIsTraining] = useState(false);
  const [targets, setTargets] = useState<Target3D[]>([]);
  const [score, setScore] = useState(0);
  const [targetsHit, setTargetsHit] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);
  const [headshots, setHeadshots] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<TrainingSession3D[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 0, 10]);
  const [enableCameraControls, setEnableCameraControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [centerHoveredTarget, setCenterHoveredTarget] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const cameraRotationRef = useRef({ x: 0, y: 0 });
  const canvasElementRef = useRef<HTMLDivElement>(null);
  const sessionStartRef = useRef<number>(0);
  const spawnIntervalRef = useRef<NodeJS.Timeout>();
  const targetTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTraining) {
      interval = setInterval(() => {
        setSessionDuration(Date.now() - sessionStartRef.current);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTraining]);



  // Target spawning system
  useEffect(() => {
    if (!isTraining) return;

    const spawnTarget = () => {
      if (targets.length >= selectedMode.maxTargets) return;

      const targetTypes: ('sphere' | 'cube' | 'cylinder')[] = ['sphere', 'cube', 'cylinder'];
      const randomType = targetTypes[Math.floor(Math.random() * targetTypes.length)];
      
      // Random position in 3D space
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 16 + 2;
      const z = (Math.random() - 0.5) * 30;

      // Random movement for moving targets
      const velocity: [number, number, number] = selectedMode.allowMovement ? [
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 4
      ] : [0, 0, 0];

      const rotation: [number, number, number] = [
        Math.random() * 2,
        Math.random() * 2,
        Math.random() * 2
      ];

      const newTarget: Target3D = {
        id: `target3d_${Date.now()}_${Math.random()}`,
        position: [x, y, z],
        size: selectedMode.targetSize + (Math.random() - 0.5) * 0.3,
        spawnTime: Date.now(),
        lifetime: selectedMode.targetLifetime,
        color: selectedMode.color,
        type: randomType,
        velocity,
        rotation
      };

      setTargets(prev => [...prev, newTarget]);
      setTotalTargets(prev => prev + 1);

      // Auto-remove target after lifetime
      const timeout = setTimeout(() => {
        setTargets(prev => prev.filter(t => t.id !== newTarget.id));
      }, selectedMode.targetLifetime);

      targetTimeoutsRef.current.set(newTarget.id, timeout);
    };

    // Initial spawn
    spawnTarget();

    // Set up spawn interval
    spawnIntervalRef.current = setInterval(spawnTarget, selectedMode.spawnInterval);

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [isTraining, targets.length, selectedMode]);

  const handleTargetHit = useCallback((targetId: string) => {
    const target = targets.find(t => t.id === targetId);
    if (!target || target.isHit) return;

    const reactionTime = Date.now() - target.spawnTime;
    
    setTargets(prev => prev.map(t => 
      t.id === targetId ? { ...t, isHit: true } : t
    ));
    
    // Scoring system with bonuses
    let pointsEarned = 100;
    
    // Distance bonus (further targets = more points)
    const distance = Math.sqrt(
      target.position[0] ** 2 + 
      target.position[1] ** 2 + 
      target.position[2] ** 2
    );
    pointsEarned += Math.floor(distance * 2);
    
    // Reaction time bonus
    if (reactionTime < 500) pointsEarned += 50;
    else if (reactionTime < 1000) pointsEarned += 25;
    
    // Target type bonus
    if (target.type === 'sphere') pointsEarned += 10; // Easiest
    else if (target.type === 'cube') pointsEarned += 20; // Medium
    else if (target.type === 'cylinder') pointsEarned += 30; // Hardest
    
    // Headshot detection (upper portion of target)
    if (target.position[1] > 2) {
      setHeadshots(prev => prev + 1);
      pointsEarned += 25;
    }

    setScore(prev => prev + pointsEarned);
    setTargetsHit(prev => prev + 1);
    setReactionTimes(prev => [...prev, reactionTime]);

    // Sound effect
    if (soundEnabled) {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    }

    // Clear timeout for this target
    const timeout = targetTimeoutsRef.current.get(targetId);
    if (timeout) {
      clearTimeout(timeout);
      targetTimeoutsRef.current.delete(targetId);
    }

    // Remove target after brief delay to show hit effect
    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== targetId));
    }, 300);
  }, [targets, soundEnabled]);

  const startTraining = () => {
    setIsTraining(true);
    setTargets([]);
    setScore(0);
    setTargetsHit(0);
    setTotalTargets(0);
    setHeadshots(0);
    setSessionDuration(0);
    setReactionTimes([]);
    setShowResults(false);
    sessionStartRef.current = Date.now();
  };

  const stopTraining = () => {
    setIsTraining(false);
    
    // Clear all timeouts
    targetTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    targetTimeoutsRef.current.clear();
    
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
    }

    // Calculate session results
    const duration = Date.now() - sessionStartRef.current;
    const accuracy = totalTargets > 0 ? (targetsHit / totalTargets) * 100 : 0;
    const averageReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    const bestReactionTime = reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0;
    const trackingAccuracy = selectedMode.allowMovement ? accuracy * 1.2 : accuracy;

    const session: TrainingSession3D = {
      mode: selectedMode.name,
      score,
      accuracy,
      targetsHit,
      totalTargets,
      duration,
      averageReactionTime,
      bestReactionTime,
      headshots,
      trackingAccuracy
    };

    setSessionHistory(prev => [session, ...prev.slice(0, 4)]);
    setShowResults(true);
    onSessionComplete?.(session);
  };

  const resetSession = () => {
    setTargets([]);
    setScore(0);
    setTargetsHit(0);
    setTotalTargets(0);
    setHeadshots(0);
    setSessionDuration(0);
    setReactionTimes([]);
    setShowResults(false);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Use the canvas container div
        if (canvasRef.current) {
          await canvasRef.current.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn('Fullscreen not supported or failed:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatTime = (ms: number) => {
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  };

  const formatReactionTime = (ms: number) => {
    return `${ms}ms`;
  };

  const handleCenterHover = useCallback((targetId: string | null) => {
    setCenterHoveredTarget(targetId);
  }, []);

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layers3 className="w-5 h-5 text-gaming-purple" />
            <span>3D Training Mode</span>
            <Badge variant="secondary" className="bg-gaming-purple/20 text-gaming-purple">
              NEW
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {TRAINING_MODES_3D.map((mode) => {
              const IconComponent = mode.icon;
              return (
                <div
                  key={mode.id}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all",
                    selectedMode.id === mode.id
                      ? "border-gaming-purple bg-gaming-purple/10"
                      : "border-border hover:border-gaming-purple/50"
                  )}
                  onClick={() => !isTraining && setSelectedMode(mode)}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${mode.color}20`, color: mode.color }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{mode.name}</h3>
                      <p className="text-xs text-muted-foreground">{mode.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {mode.environment}
                        </Badge>
                        {mode.allowMovement && (
                          <Badge variant="outline" className="text-xs">
                            Moving
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Display */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gaming-blue">{score}</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gaming-green">
              {totalTargets > 0 ? Math.round((targetsHit / totalTargets) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gaming-purple">{targetsHit}/{totalTargets}</div>
            <div className="text-xs text-muted-foreground">Hits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gaming-orange">
              {formatTime(sessionDuration)}
            </div>
            <div className="text-xs text-muted-foreground">Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gaming-red">{headshots}</div>
            <div className="text-xs text-muted-foreground">Headshots</div>
          </CardContent>
        </Card>
      </div>

      {/* 3D Training Area */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={(node) => {
              canvasRef.current = node;
              canvasElementRef.current = node;
            }}
            className="relative w-full h-[600px] rounded-lg overflow-hidden bg-black"
            style={{ cursor: 'none' }}
          >
            <Canvas
              shadows
              camera={{ position: cameraPosition, fov: 75 }}
              style={{ background: 'linear-gradient(to bottom, #0f0f23, #000000)' }}
            >
              <Suspense fallback={null}>
                <Scene3D
                  targets={targets}
                  onTargetHit={handleTargetHit}
                  selectedMode={selectedMode}
                  selectedCrosshair={selectedCrosshair}
                  cameraPosition={cameraPosition}
                  enableControls={enableCameraControls}
                  onCenterHover={handleCenterHover}
                  centerHoveredTarget={centerHoveredTarget}
                />
              </Suspense>
            </Canvas>

            {/* 2D Crosshair Overlay - Perfectly Centered */}
            {selectedCrosshair && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    willChange: 'transform'
                  }}
                >
                  <Crosshair
                    style={selectedCrosshair.style}
                    color={selectedCrosshair.color}
                    size={selectedCrosshair.size}
                    opacity={selectedCrosshair.opacity * 0.8} // Slightly more visible
                    thickness={selectedCrosshair.thickness}
                    gap={selectedCrosshair.gap}
                  />
                </div>
              </div>
            )}



            {/* Control Overlay */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="bg-black/50 border-white/20 text-white hover:bg-white/10"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEnableCameraControls(!enableCameraControls)}
                className="bg-black/50 border-white/20 text-white hover:bg-white/10"
              >
                <Gamepad2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={toggleFullscreen}
                className="bg-black/50 border-white/20 text-white hover:bg-white/10"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>

            {/* Instructions Overlay */}
            {!isTraining && !showResults && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-center text-white">
                  <Layers3 className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <h3 className="text-2xl font-semibold mb-2">Ready for 3D Training?</h3>
                  <p className="text-muted-foreground mb-4">Click Start to begin {selectedMode.name}</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• <span className="text-gaming-cyan">Aim with crosshair at center of screen</span></p>
                    <p>• Use mouse to look around (if camera controls enabled)</p>
                    <p>• Click to shoot at whatever crosshair is pointing at</p>
                    <p>• Targets at different depths and distances</p>
                    <p>• Some targets move - track them carefully!</p>
                    <p>• Targets glow when crosshair is aimed at them</p>
                  </div>
                </div>
              </div>
            )}


          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        {!isTraining ? (
          <SoundButton
            onClick={startTraining}
            className="bg-gaming-green hover:bg-gaming-green/80"
            soundType="success"
            soundVolume={0.5}
          >
            <Play className="w-4 h-4 mr-2" />
            Start 3D Training
          </SoundButton>
        ) : (
          <SoundButton
            onClick={stopTraining}
            className="bg-gaming-red hover:bg-gaming-red/80"
            soundType="click"
            soundVolume={0.4}
          >
            <Pause className="w-4 h-4 mr-2" />
            Stop Training
          </SoundButton>
        )}
        
        <Button
          onClick={resetSession}
          variant="outline"
          disabled={isTraining}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>

        <Button
          onClick={() => setCameraPosition([0, 0, 10])}
          variant="outline"
          disabled={isTraining}
        >
          <Eye className="w-4 h-4 mr-2" />
          Reset Camera
        </Button>
      </div>

      {/* Session Results */}
      {showResults && (
        <Card className="border-gaming-green/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gaming-green">
              <Trophy className="w-5 h-5" />
              <span>3D Session Complete!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{score}</div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round((targetsHit / totalTargets) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {reactionTimes.length > 0 ? formatReactionTime(Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)) : "N/A"}
                </div>
                <div className="text-sm text-muted-foreground">Avg Reaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {reactionTimes.length > 0 ? formatReactionTime(Math.min(...reactionTimes)) : "N/A"}
                </div>
                <div className="text-sm text-muted-foreground">Best Reaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{headshots}</div>
                <div className="text-sm text-muted-foreground">Headshots</div>
              </div>
            </div>
            
            {/* 3D-specific stats */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2 text-sm">3D Performance Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-gaming-blue">
                    {headshots > 0 ? Math.round((headshots / targetsHit) * 100) : 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">Headshot Rate</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gaming-purple">
                    {selectedMode.allowMovement ? "Yes" : "No"}
                  </div>
                  <div className="text-xs text-muted-foreground">Moving Targets</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gaming-orange">
                    {selectedMode.environment}
                  </div>
                  <div className="text-xs text-muted-foreground">Environment</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session History */}
      {sessionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent 3D Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessionHistory.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border/30 rounded text-sm">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{session.mode}</Badge>
                    <span className="text-muted-foreground">
                      {Math.round(session.accuracy)}% accuracy
                    </span>
                    <span className="text-xs text-gaming-red">
                      {session.headshots} headshots
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs">
                    <span>{session.score} pts</span>
                    <span>{formatReactionTime(Math.round(session.averageReactionTime))} avg</span>
                    <span>{formatTime(session.duration)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3D Instructions */}
      <Card className="border-gaming-blue/30">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Layers3 className="w-5 h-5 text-gaming-blue mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-gaming-blue">3D Training Features:</p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• <span className="text-gaming-green">3D Environments:</span> Train in realistic 3D spaces with different lighting</li>
                <li>• <span className="text-gaming-purple">Depth Perception:</span> Targets at various distances improve spatial awareness</li>
                <li>• <span className="text-gaming-orange">Moving Targets:</span> Track moving objects in 3D space</li>
                <li>• <span className="text-gaming-blue">Multiple Shapes:</span> Spheres, cubes, and cylinders with different hit difficulty</li>
                <li>• <span className="text-gaming-red">Headshot Tracking:</span> Bonus points for precision upper target hits</li>
                <li>• <span className="text-gaming-cyan">Crosshair Targeting:</span> Aim with center crosshair, targets glow when aimed at</li>
                <li>• <span className="text-gaming-cyan">Camera Controls:</span> Use mouse to look around (toggle in controls)</li>
                <li>• Press F11 or use fullscreen button for immersive experience</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
