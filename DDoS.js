import React, { useState, useEffect } from 'react';
import { Shield, Zap, Server, RefreshCw, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const DDOSDefenseGame = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [serverHealth, setServerHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [attackers, setAttackers] = useState([]);
  const [gameLevel, setGameLevel] = useState(1);
  const [logs, setLogs] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [combo, setCombo] = useState(0);

  const tools = [
    { 
      id: 'firewall', 
      name: 'Firewall', 
      color: 'bg-blue-500', 
      power: 1,
      targetType: 'basic',
      description: 'Effective against basic attacks'
    },
    { 
      id: 'antiDDoS', 
      name: 'Anti-DDoS', 
      color: 'bg-purple-500', 
      power: 2,
      targetType: 'botnet',
      description: 'Best against botnet attacks'
    },
    { 
      id: 'analyzer', 
      name: 'Traffic Analyzer', 
      color: 'bg-green-500', 
      power: 2,
      targetType: 'stealth',
      description: 'Detects stealth attacks'
    },
  ];

  const addLog = (message) => {
    setLogs(prev => [message, ...prev].slice(0, 5));
  };

  const spawnAttacker = () => {
    const attackTypes = [
      { type: 'basic', speed: 3, size: 4, health: 1 },
      { type: 'botnet', speed: 4, size: 5, health: 2 },
      { type: 'stealth', speed: 5, size: 3, health: 1 }
    ];
    
    const attackType = attackTypes[Math.floor(Math.random() * Math.min(gameLevel, 3))];
    const newAttacker = {
      id: Date.now(),
      ...attackType,
      position: 10,
      health: attackType.health * Math.ceil(gameLevel / 2),
      clicked: false
    };
    setAttackers(prev => [...prev, newAttacker]);
  };

  const handleAttackerClick = (attackerId) => {
    if (!selectedTool) {
      addLog('⚠️ Select a defense tool first!');
      return;
    }

    setAttackers(prev => prev.map(attacker => {
      if (attacker.id === attackerId && !attacker.clicked) {
        const tool = tools.find(t => t.id === selectedTool);
        const isEffective = tool.targetType === attacker.type;
        const damage = isEffective ? tool.power * 2 : tool.power;
        
        const newHealth = attacker.health - damage;
        
        if (newHealth <= 0) {
          // Attacker eliminated
          if (isEffective) {
            setCombo(prev => prev + 1);
            setScore(prev => prev + (10 * combo * gameLevel));
            addLog(`🎯 Perfect counter! +${10 * combo * gameLevel} points`);
          } else {
            setCombo(0);
            setScore(prev => prev + (5 * gameLevel));
            addLog(`✅ Attack blocked! +${5 * gameLevel} points`);
          }
          return { ...attacker, health: 0, clicked: true };
        }
        
        return { ...attacker, health: newHealth };
      }
      return attacker;
    }));
  };

  // Game loop
  useEffect(() => {
    let gameInterval;
    if (isPlaying && !gameOver) {
      gameInterval = setInterval(() => {
        // Spawn attackers
        if (Math.random() < 0.1 * gameLevel) {
          spawnAttacker();
        }

        // Move attackers and check for damage
        setAttackers(prev => {
          const updatedAttackers = prev
            .map(attacker => ({
              ...attacker,
              position: attacker.position + (attacker.clicked ? 0 : attacker.speed)
            }))
            .filter(attacker => {
              if (attacker.position >= 90 && !attacker.clicked) {
                setServerHealth(h => Math.max(0, h - 10));
                addLog(`💥 Server hit! -10 health`);
                return false;
              }
              return attacker.position < 100;
            });

          return updatedAttackers;
        });

        // Level progression
        if (score > gameLevel * 1000) {
          setGameLevel(prev => prev + 1);
          addLog(`🎉 Level ${gameLevel + 1}! Attacks intensifying!`);
        }

        // Check game over
        if (serverHealth <= 0) {
          setGameOver(true);
          setIsPlaying(false);
          addLog('💥 Server down! Game Over!');
        }
      }, 100);
    }
    return () => clearInterval(gameInterval);
  }, [isPlaying, gameLevel, gameOver]);

  const resetGame = () => {
    setIsPlaying(false);
    setServerHealth(100);
    setScore(0);
    setAttackers([]);
    setGameLevel(1);
    setLogs([]);
    setGameOver(false);
    setCombo(0);
    setSelectedTool(null);
  };

  return (
    <div className="w-full max-w-4xl p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>DDoS Defense Game - Level {gameLevel}</span>
            <span className="flex items-center gap-4">
              <Trophy className="w-5 h-5" /> {score}
              {combo > 1 && <span className="text-green-500">x{combo} Combo!</span>}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Game Controls */}
          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2"
              disabled={gameOver}
            >
              {isPlaying ? 'Pause' : 'Start'} Game
            </Button>
            <Button
              onClick={resetGame}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              New Game
            </Button>
          </div>

          {/* Defense Tools */}
          <div className="flex gap-4 mb-6">
            {tools.map(tool => (
              <Button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`${tool.color} text-white ${selectedTool === tool.id ? 'ring-4' : ''}`}
                title={tool.description}
              >
                {tool.name}
              </Button>
            ))}
          </div>

          {/* Game Board */}
          <div className="relative h-64 bg-gray-100 rounded-lg mb-6 overflow-hidden">
            {/* Server */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Server className={`w-12 h-12 ${serverHealth < 50 ? 'text-red-500' : 'text-blue-500'}`} />
            </div>

            {/* Attackers */}
            {attackers.map(attacker => (
              <div
                key={attacker.id}
                onClick={() => handleAttackerClick(attacker.id)}
                className={`absolute cursor-pointer transition-all duration-100
                  ${attacker.type === 'basic' ? 'bg-red-500' : 
                    attacker.type === 'botnet' ? 'bg-purple-500' : 'bg-green-500'}
                  ${attacker.clicked ? 'opacity-50' : 'hover:scale-110'}
                  rounded-full`}
                style={{ 
                  left: `${attacker.position}%`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: `${attacker.size * 8}px`,
                  height: `${attacker.size * 8}px`,
                }}
                title={`${attacker.type} - Health: ${attacker.health}`}
              />
            ))}
          </div>

          {/* Server Health */}
          <div className="mb-6">
            <div className="text-sm mb-2">Server Health: {serverHealth}%</div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  serverHealth > 60 ? 'bg-green-500' : 
                  serverHealth > 30 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${serverHealth}%` }}
              />
            </div>
          </div>

          {/* Event Log */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Event Log</h3>
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div key={index} className="text-sm">{log}</div>
              ))}
            </div>
          </div>

          {/* Game Over Screen */}
          {gameOver && (
            <Alert className="mt-6">
              <AlertTitle>Game Over!</AlertTitle>
              <AlertDescription>
                Final Score: {score}
                <br />
                Level Reached: {gameLevel}
                <br />
                <Button onClick={resetGame} className="mt-4">
                  Play Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Tutorial Alert */}
          {!isPlaying && !gameOver && (
            <Alert className="mt-6">
              <AlertTitle>How to Play</AlertTitle>
              <AlertDescription>
                <ul className="list-disc ml-6 mt-2">
                  <li>Select a defense tool to counter incoming attacks</li>
                  <li>Click on incoming attacks to neutralize them</li>
                  <li>Match the right tool with each attack type for bonus points</li>
                  <li>Chain successful counters for combo multipliers</li>
                  <li>Don't let attacks reach your server!</li>
                </ul>
                <div className="mt-4">
                  <strong>Attack Types:</strong>
                  <ul className="list-disc ml-6 mt-2">
                    <li>Basic Attacks (Red) - Vulnerable to Firewall</li>
                    <li>Botnet Attacks (Purple) - Best countered by Anti-DDoS</li>
                    <li>Stealth Attacks (Green) - Detected by Traffic Analyzer</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DDOSDefenseGame;
