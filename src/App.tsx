  const totalStars = Object.values(progress).reduce((sum, p) => sum + (p?.bestStars ?? 0), 0);
  const fighters: [Fighter, Fighter] = mode === 1 ? [robotById(picks[0]), MONSTER] : [robotById(picks[0]), robotById(picks[1])];
  const toggleSound = () => setSoundOn((s) => !s);

  function handleComplete(stars: number, rounds: number[]) {
    setProgress((prev) => {
      const cur = prev[levelId] ?? { bestStars: 0, rounds: [] };
      const merged = Array.from({ length: TOTAL_QUESTIONS }, (_, i) => Math.max(cur.rounds?.[i] ?? 0, rounds[i] ?? 0));
      const next: ProgressMap = { ...prev, [levelId]: { bestStars: Math.max(cur.bestStars, stars), rounds: merged } };
      saveProgress(next);
      return next;
    });
  }

  function startBattle(id: number) {
    setLevelId(id);
    setRunKey((k) => k + 1);
    setScreen("battle");
  }

  function handleNextLevel() {
    const idx = LEVELS.findIndex((l) => l.id === levelId);
    startBattle(LEVELS[Math.min(idx + 1, LEVELS.length - 1)].id);
  }

  return (
    <div className="relative min-h-screen w-full bg-arena-950">
      <AnimatePresence mode="wait">
        {screen === "home" && (
          <motion.div key="home" {...fade}>
            <Home bestStars={totalStars} soundOn={soundOn} onToggleSound={toggleSound} onStart={() => setScreen("setup")} />
          </motion.div>
        )}

        {screen === "setup" && (
          <motion.div key="setup" {...fade}>
            <Setup
              mode={mode}
              setMode={(m) => {
                setMode(m);
                if (m === 2 && picks[0] === picks[1]) setPicks([picks[0], picks[0] === "biru" ? "kuning" : "biru"]);
              }}
              picks={picks}
              setPicks={setPicks}
              soundOn={soundOn}
              onToggleSound={toggleSound}
              onHome={() => setScreen("home")}
              onConfirm={() => setScreen("levels")}
            />
          </motion.div>
        )}

        {screen === "levels" && (
          <motion.div key="levels" {...fade}>
            <Levels
              progress={progress}
              soundOn={soundOn}
              onToggleSound={toggleSound}
              onHome={() => setScreen("home")}
              onPick={(id) => {
                setLevelId(id);
                setScreen("map");
              }}
            />
          </motion.div>
        )}

        {screen === "map" && (
          <motion.div key="map" {...fade}>
            <MapScreen
              levelId={levelId}
              progress={progress}
              fighters={fighters}
              mode={mode}
              soundOn={soundOn}
              onToggleSound={toggleSound}
              onBack={() => setScreen("levels")}
              onPlay={() => startBattle(levelId)}
            />
          </motion.div>
        )}

        {screen === "battle" && (
          <motion.div key="battle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <Battle
              key={`run-${runKey}`}
              mode={mode}
              level={LEVELS.find((l) => l.id === levelId) ?? LEVELS[0]}
              fighters={fighters}
              soundOn={soundOn}
              hasNextLevel={levelId < LEVELS.length}
              onToggleSound={toggleSound}
              onExit={() => setScreen("levels")}
              onHome={() => setScreen("home")}
              onRetry={() => startBattle(levelId)}
              onNextLevel={handleNextLevel}
              onComplete={handleComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
