import React, { useState, useEffect, useRef, useCallback } from "react";
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
  TrendingUp
} from "lucide-react";

interface AimTrainerTarget {
  id: string;
  x: number;
  y: number;
  size: number;
  spawnTime: number;
  lifetime: number;
  isHit?: boolean;
}

interface TrainingSession {
  mode: string;
  score: number;
  accuracy: number;
  targetsHit: number;
  totalTargets: number;
  duration: number;
  averageReactionTime: number;
  bestReactionTime: number;
}

interface AimTrainerProps {
  selectedCrosshair?: {
    style: CrosshairProps["style"];
    color: string;
    size: number;
    opacity: number;
    thickness?: number;
    gap?: number;
  };
  onSessionComplete?: (session: TrainingSession) => void;
}

const TRAINING_MODES = [
  {
    id: "precision",
    name: "Precision Training",
    description: "Small targets that require accurate aiming",
    icon: Target,
    targetSize: 20,
    targetLifetime: 3000,
    spawnInterval: 2000,
    maxTargets: 3,
    color: "#3b82f6"
  },
  {
    id: "speed",
    name: "Speed Training", 
    description: "Fast-appearing targets for quick reflexes",
    icon: Zap,
    targetSize: 35,
    targetLifetime: 1500,
    spawnInterval: 800,
    maxTargets: 5,
    color: "#eab308"
  },
  {
    id: "reaction",
    name: "Reaction Training",
    description: "Random timing to improve reaction speed",
    icon: Clock,
    targetSize: 30,
    targetLifetime: 2000,
    spawnInterval: 1200,
    maxTargets: 4,
    color: "#ef4444"
  },
  {
    id: "flick",
    name: "Flick Training",
    description: "Long-distance targets for flick shots",
    icon: TrendingUp,
    targetSize: 25,
    targetLifetime: 2500,
    spawnInterval: 1800,
    maxTargets: 2,
    color: "#8b5cf6"
  }
];

export function AimTrainer({ selectedCrosshair, onSessionComplete }: AimTrainerProps) {
  const [selectedMode, setSelectedMode] = useState(TRAINING_MODES[0]);
  const [isTraining, setIsTraining] = useState(false);
  const [targets, setTargets] = useState<AimTrainerTarget[]>([]);
  const [score, setScore] = useState(0);
  const [targetsHit, setTargetsHit] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<TrainingSession[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
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

  // Target spawning
  useEffect(() => {
    if (!isTraining || !containerRef.current) return;

    const spawnTarget = () => {
      if (targets.length >= selectedMode.maxTargets || !containerRef.current) return;

      const container = containerRef.current.getBoundingClientRect();
      const padding = selectedMode.targetSize;
      
      const newTarget: AimTrainerTarget = {
        id: `target_${Date.now()}_${Math.random()}`,
        x: padding + Math.random() * (container.width - padding * 2),
        y: padding + Math.random() * (container.height - padding * 2),
        size: selectedMode.targetSize,
        spawnTime: Date.now(),
        lifetime: selectedMode.targetLifetime
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
    
    setScore(prev => prev + 100);
    setTargetsHit(prev => prev + 1);
    setReactionTimes(prev => [...prev, reactionTime]);

    // Clear timeout for this target
    const timeout = targetTimeoutsRef.current.get(targetId);
    if (timeout) {
      clearTimeout(timeout);
      targetTimeoutsRef.current.delete(targetId);
    }

    // Remove target after brief delay to show hit effect
    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== targetId));
    }, 200);
  }, [targets]);

  const startTraining = () => {
    setIsTraining(true);
    setTargets([]);
    setScore(0);
    setTargetsHit(0);
    setTotalTargets(0);
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

    const session: TrainingSession = {
      mode: selectedMode.name,
      score,
      accuracy,
      targetsHit,
      totalTargets,
      duration,
      averageReactionTime,
      bestReactionTime
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
    setSessionDuration(0);
    setReactionTimes([]);
    setShowResults(false);
  };

  const formatTime = (ms: number) => {
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  };

  const formatReactionTime = (ms: number) => {
    return `${ms}ms`;
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-gaming-purple" />
            <span>Training Mode</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TRAINING_MODES.map((mode) => {
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </div>

      {/* Training Area */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={containerRef}
            className="relative w-full h-96 bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden rounded-lg"
            style={{ cursor: 'crosshair' }}
          >
            {/* Training area background */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />
            </div>

            {/* Crosshair */}
            {selectedCrosshair && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <Crosshair
                  style={selectedCrosshair.style}
                  color={selectedCrosshair.color}
                  size={selectedCrosshair.size}
                  opacity={selectedCrosshair.opacity}
                  thickness={selectedCrosshair.thickness}
                  gap={selectedCrosshair.gap}
                />
              </div>
            )}

            {/* Targets */}
            {targets.map((target) => (
              <div
                key={target.id}
                className={cn(
                  "absolute rounded-full border-2 transition-all duration-200 cursor-pointer",
                  target.isHit 
                    ? "bg-gaming-green border-gaming-green scale-125 opacity-50" 
                    : "bg-gaming-red border-gaming-red hover:scale-110"
                )}
                style={{
                  left: target.x - target.size / 2,
                  top: target.y - target.size / 2,
                  width: target.size,
                  height: target.size,
                  boxShadow: target.isHit ? "0 0 20px rgba(34, 197, 94, 0.5)" : "0 0 10px rgba(239, 68, 68, 0.3)"
                }}
                onClick={() => handleTargetHit(target.id)}
              >
                {/* Target center dot */}
                <div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                  style={{ width: target.size * 0.2, height: target.size * 0.2 }}
                />
              </div>
            ))}

            {/* Overlay messages */}
            {!isTraining && !showResults && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Ready to Train?</h3>
                  <p className="text-muted-foreground">Click Start to begin {selectedMode.name}</p>
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
            Start Training
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
      </div>

      {/* Session Results */}
      {showResults && (
        <Card className="border-gaming-green/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gaming-green">
              <Trophy className="w-5 h-5" />
              <span>Session Complete!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session History */}
      {sessionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Sessions</CardTitle>
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

      {/* Instructions */}
      <Card className="border-gaming-blue/30">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <CrosshairIcon className="w-5 h-5 text-gaming-blue mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-gaming-blue">How to Use:</p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• Select a training mode and optionally choose a crosshair</li>
                <li>• Click red targets as quickly and accurately as possible</li>
                <li>• Targets disappear after a few seconds if not hit</li>
                <li>• Track your progress with accuracy and reaction time metrics</li>
                <li>• Practice regularly to improve your aim</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
