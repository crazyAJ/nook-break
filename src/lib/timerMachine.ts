export type TimerMachineMode =
  | 'idle_before_work'
  | 'working'
  | 'resting'
  | 'after_work';

export type TimerMachineConfig = {
  startTime: string;
  endTime: string;
  restInterval: number;
  restDuration: number;
  restReminderActive: boolean;
};

export type TimerMachineSnapshot = {
  version: 1;
  mode: TimerMachineMode;
  enteredAt: number;
  restCycleAnchorAt: number | null;
  restEndsAt: number | null;
  celebratedWorkdayKey: string | null;
  configSnapshot: TimerMachineConfig;
};

export type TimerMachineDerived = {
  snapshot: TimerMachineSnapshot;
  nextBreakSeconds: number;
  restTimeLeft: number;
  isResting: boolean;
  hasCelebratedToday: boolean;
};

const SNAPSHOT_VERSION = 1;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;

export function createInitialTimerMachineSnapshot(
  config: TimerMachineConfig,
  now: number,
  workdayKey: string,
): TimerMachineSnapshot {
  const workStartAt = resolveWorkdayTime(workdayKey, config.startTime);
  const workEndAt = resolveWorkdayTime(workdayKey, config.endTime);

  if (now >= workEndAt) {
    return {
      version: SNAPSHOT_VERSION,
      mode: 'after_work',
      enteredAt: now,
      restCycleAnchorAt: null,
      restEndsAt: null,
      celebratedWorkdayKey: workdayKey,
      configSnapshot: config,
    };
  }

  if (now >= workStartAt) {
    return {
      version: SNAPSHOT_VERSION,
      mode: 'working',
      enteredAt: now,
      restCycleAnchorAt: now,
      restEndsAt: null,
      celebratedWorkdayKey: null,
      configSnapshot: config,
    };
  }

  return {
    version: SNAPSHOT_VERSION,
    mode: 'idle_before_work',
    enteredAt: now,
    restCycleAnchorAt: null,
    restEndsAt: null,
    celebratedWorkdayKey: null,
    configSnapshot: config,
  };
}

export function deriveTimerMachineState(
  snapshot: TimerMachineSnapshot,
  config: TimerMachineConfig,
  now: number,
  workdayKey: string,
): TimerMachineDerived {
  return reconcileTimerMachineSnapshot(snapshot, config, now, workdayKey);
}

export function reconcileTimerMachineSnapshot(
  snapshot: TimerMachineSnapshot,
  config: TimerMachineConfig,
  now: number,
  workdayKey: string,
): TimerMachineDerived {
  const reconciledSnapshot = rebuildForNewWorkday(
    rebuildForConfigChange(snapshot, config, now, workdayKey),
    config,
    now,
    workdayKey,
  );
  const workEndAt = resolveWorkdayTime(workdayKey, config.endTime);

  if (now >= workEndAt) {
    const nextSnapshot: TimerMachineSnapshot = {
      version: SNAPSHOT_VERSION,
      mode: 'after_work',
      enteredAt: workEndAt,
      restCycleAnchorAt: reconciledSnapshot.restCycleAnchorAt,
      restEndsAt: null,
      celebratedWorkdayKey: workdayKey,
      configSnapshot: config,
    };

    return buildDerived(nextSnapshot, workdayKey, {
      hasCelebratedToday: true,
    }, config);
  }

  if (reconciledSnapshot.mode === 'resting') {
    return reconcileRestingSnapshot(reconciledSnapshot, config, now, workdayKey);
  }

  if (reconciledSnapshot.mode === 'working') {
    return buildWorkingDerived(reconciledSnapshot, config, now, workdayKey);
  }

  if (reconciledSnapshot.mode === 'idle_before_work') {
    const workStartAt = resolveWorkdayTime(workdayKey, config.startTime);

    if (now >= workStartAt) {
      return buildWorkingDerived(
        createInitialTimerMachineSnapshot(config, now, workdayKey),
        config,
        now,
        workdayKey,
      );
    }
  }

  return {
    ...buildDerived(reconciledSnapshot, workdayKey, {}, config),
  };
}

function hasConfigChanged(
  snapshot: TimerMachineSnapshot,
  config: TimerMachineConfig,
) {
  const previousConfig = snapshot.configSnapshot;

  return (
    previousConfig.startTime !== config.startTime ||
    previousConfig.endTime !== config.endTime ||
    previousConfig.restInterval !== config.restInterval ||
    previousConfig.restDuration !== config.restDuration ||
    previousConfig.restReminderActive !== config.restReminderActive
  );
}

function buildWorkingDerived(
  snapshot: TimerMachineSnapshot,
  config: TimerMachineConfig,
  now: number,
  workdayKey: string,
): TimerMachineDerived {
  if (!config.restReminderActive || snapshot.restCycleAnchorAt === null) {
    return buildDerived(snapshot, workdayKey, {}, config);
  }

  const elapsedSeconds = Math.max(
    0,
    Math.floor((now - snapshot.restCycleAnchorAt) / MILLISECONDS_PER_SECOND),
  );
  const nextBreakSeconds = Math.max(
    0,
    config.restInterval * SECONDS_PER_MINUTE - elapsedSeconds,
  );

  if (nextBreakSeconds === 0) {
    const nextSnapshot: TimerMachineSnapshot = {
      ...snapshot,
      mode: 'resting',
      enteredAt: now,
      restEndsAt:
        now + config.restDuration * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND,
      configSnapshot: config,
    };

    return buildDerived(nextSnapshot, workdayKey, {
      isResting: true,
      nextBreakSeconds: 0,
      restTimeLeft: config.restDuration * SECONDS_PER_MINUTE,
    }, config);
  }

  return buildDerived(snapshot, workdayKey, {
    nextBreakSeconds,
    restTimeLeft: 0,
  }, config);
}

function rebuildForConfigChange(
  snapshot: TimerMachineSnapshot,
  config: TimerMachineConfig,
  now: number,
  workdayKey: string,
): TimerMachineSnapshot {
  if (!hasConfigChanged(snapshot, config)) {
    return snapshot;
  }

  const previousConfig = snapshot.configSnapshot;
  const scheduleChanged =
    previousConfig.startTime !== config.startTime ||
    previousConfig.endTime !== config.endTime;

  if (scheduleChanged) {
    return preserveCelebrationFlag(
      createInitialTimerMachineSnapshot(config, now, workdayKey),
      snapshot,
      workdayKey,
    );
  }

  if (!config.restReminderActive) {
    if (snapshot.mode === 'resting' || snapshot.mode === 'working') {
      return {
        ...snapshot,
        mode: 'working',
        enteredAt: now,
        restCycleAnchorAt: now,
        restEndsAt: null,
        configSnapshot: config,
      };
    }

    return preserveCelebrationFlag({
      ...snapshot,
      configSnapshot: config,
    }, snapshot, workdayKey);
  }

  if (snapshot.mode === 'working') {
    return {
      ...snapshot,
      enteredAt: now,
      restCycleAnchorAt: now,
      restEndsAt: null,
      configSnapshot: config,
    };
  }

  if (snapshot.mode === 'resting') {
    return {
      ...snapshot,
      enteredAt: now,
      restEndsAt:
        now + config.restDuration * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND,
      configSnapshot: config,
    };
  }

  return {
    ...snapshot,
    configSnapshot: config,
  };
}

function rebuildForNewWorkday(
  snapshot: TimerMachineSnapshot,
  config: TimerMachineConfig,
  now: number,
  workdayKey: string,
): TimerMachineSnapshot {
  if (
    snapshot.mode === 'after_work' &&
    snapshot.celebratedWorkdayKey !== null &&
    snapshot.celebratedWorkdayKey !== workdayKey
  ) {
    return createInitialTimerMachineSnapshot(config, now, workdayKey);
  }

  return snapshot;
}

function reconcileRestingSnapshot(
  snapshot: TimerMachineSnapshot,
  config: TimerMachineConfig,
  now: number,
  workdayKey: string,
): TimerMachineDerived {
  if (snapshot.restEndsAt === null) {
    return buildWorkingDerived(
      {
        ...snapshot,
        mode: 'working',
        enteredAt: now,
        restCycleAnchorAt: now,
      },
      config,
      now,
      workdayKey,
    );
  }

  if (snapshot.restEndsAt <= now) {
    return buildWorkingDerived(
      {
        ...snapshot,
        mode: 'working',
        enteredAt: snapshot.restEndsAt,
        restCycleAnchorAt: snapshot.restEndsAt,
        restEndsAt: null,
        configSnapshot: config,
      },
      config,
      now,
      workdayKey,
    );
  }

  return buildDerived(snapshot, workdayKey, {
    isResting: true,
    nextBreakSeconds: 0,
    restTimeLeft: Math.max(
      0,
      Math.ceil((snapshot.restEndsAt - now) / MILLISECONDS_PER_SECOND),
    ),
  }, config);
}

function buildDerived(
  snapshot: TimerMachineSnapshot,
  workdayKey: string,
  overrides: Partial<TimerMachineDerived> = {},
  config: TimerMachineConfig,
): TimerMachineDerived {
  return {
    snapshot,
    nextBreakSeconds: config.restInterval * SECONDS_PER_MINUTE,
    restTimeLeft: config.restDuration * SECONDS_PER_MINUTE,
    isResting: false,
    hasCelebratedToday: snapshot.celebratedWorkdayKey === workdayKey,
    ...overrides,
  };
}

function preserveCelebrationFlag(
  nextSnapshot: TimerMachineSnapshot,
  previousSnapshot: TimerMachineSnapshot,
  workdayKey: string,
): TimerMachineSnapshot {
  if (previousSnapshot.celebratedWorkdayKey === workdayKey) {
    return {
      ...nextSnapshot,
      celebratedWorkdayKey: workdayKey,
    };
  }

  return nextSnapshot;
}

function resolveWorkdayTime(workdayKey: string, time: string) {
  const [yearText, monthText, dayText] = workdayKey.split('-');
  const [hourText, minuteText] = time.split(':');

  return new Date(
    Number(yearText),
    Number(monthText) - 1,
    Number(dayText),
    Number(hourText),
    Number(minuteText),
    0,
    0,
  ).getTime();
}
