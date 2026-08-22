// Real Mathematical Waveform Analysis Library for Virtual Laboratory Instruments
// Strictly numerical operations on real simulation Float64Array / number[] time-series

export interface WaveformMetrics {
  vMax: number;
  vMin: number;
  vPp: number;
  vAvg: number;
  vRms: number;
  vAcRms: number;
  frequency: number;
  period: number;
  riseTime: number;
  fallTime: number;
  dutyCycle: number;
  hasValidSignal: boolean;
}

/**
 * Calculates mean/DC component of waveform
 */
export function calculateMean(values: ArrayLike<number>): number {
  if (!values || values.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
  }
  return sum / values.length;
}

/**
 * Calculates true RMS value: sqrt( 1/N * sum( v_i^2 ) )
 */
export function calculateRms(values: ArrayLike<number>): number {
  if (!values || values.length === 0) return 0;
  let sumSq = 0;
  for (let i = 0; i < values.length; i++) {
    sumSq += values[i] * values[i];
  }
  return Math.sqrt(sumSq / values.length);
}

/**
 * Calculates AC-coupled RMS: RMS( x(t) - mean(x) )
 */
export function calculateAcRms(values: ArrayLike<number>): number {
  if (!values || values.length === 0) return 0;
  const avg = calculateMean(values);
  let sumSq = 0;
  for (let i = 0; i < values.length; i++) {
    const diff = values[i] - avg;
    sumSq += diff * diff;
  }
  return Math.sqrt(sumSq / values.length);
}

/**
 * Calculates min, max, peak-to-peak
 */
export function calculateExtremes(values: ArrayLike<number>): { min: number; max: number; pp: number } {
  if (!values || values.length === 0) return { min: 0, max: 0, pp: 0 };
  let min = values[0];
  let max = values[0];
  for (let i = 1; i < values.length; i++) {
    if (values[i] < min) min = values[i];
    if (values[i] > max) max = values[i];
  }
  return { min, max, pp: max - min };
}

/**
 * Accurately extracts frequency and period using threshold crossing with linear interpolation
 */
export function calculateFrequencyAndPeriod(
  time: ArrayLike<number>,
  values: ArrayLike<number>,
  triggerLevel?: number
): { frequency: number; period: number; dutyCycle: number } {
  if (!time || !values || time.length < 4 || values.length < 4) {
    return { frequency: 0, period: 0, dutyCycle: 50 };
  }

  const { min, max, pp } = calculateExtremes(values);
  if (pp < 1e-4) {
    // Pure DC signal, no AC frequency
    return { frequency: 0, period: 0, dutyCycle: 0 };
  }

  const threshold = triggerLevel !== undefined ? triggerLevel : (min + max) / 2;
  const hysteresis = Math.max(pp * 0.05, 1e-6); // 5% noise rejection band

  const risingCrossings: number[] = [];
  const fallingCrossings: number[] = [];
  let state: 'low' | 'high' = values[0] < threshold ? 'low' : 'high';

  for (let i = 1; i < values.length; i++) {
    const vPrev = values[i - 1];
    const vCurr = values[i];
    const tPrev = time[i - 1];
    const tCurr = time[i];

    if (state === 'low' && vCurr >= threshold) {
      // Linear interpolation for sub-timestep precision
      const frac = (threshold - vPrev) / (vCurr - vPrev || 1e-12);
      const exactTime = tPrev + frac * (tCurr - tPrev);
      risingCrossings.push(exactTime);
      state = 'high';
    } else if (state === 'high' && vCurr < threshold - hysteresis) {
      const frac = (threshold - hysteresis - vPrev) / (vCurr - vPrev || 1e-12);
      const exactTime = tPrev + frac * (tCurr - tPrev);
      fallingCrossings.push(exactTime);
      state = 'low';
    }
  }

  if (risingCrossings.length >= 2) {
    const periods: number[] = [];
    for (let i = 1; i < risingCrossings.length; i++) {
      const p = risingCrossings[i] - risingCrossings[i - 1];
      if (p > 0) periods.push(p);
    }

    const avgPeriod = periods.reduce((a, b) => a + b, 0) / periods.length;
    const freq = avgPeriod > 0 ? 1 / avgPeriod : 0;

    // Calculate duty cycle if both rising and falling crossings exist
    let dutyCycle = 50;
    if (fallingCrossings.length > 0 && risingCrossings.length > 0) {
      const highTimes: number[] = [];
      for (const tRise of risingCrossings) {
        const nextFall = fallingCrossings.find(tFall => tFall > tRise);
        if (nextFall && nextFall - tRise < avgPeriod) {
          highTimes.push(nextFall - tRise);
        }
      }
      if (highTimes.length > 0 && avgPeriod > 0) {
        const avgHigh = highTimes.reduce((a, b) => a + b, 0) / highTimes.length;
        dutyCycle = Math.min(Math.max((avgHigh / avgPeriod) * 100, 0), 100);
      }
    }

    return { frequency: freq, period: avgPeriod, dutyCycle };
  }

  return { frequency: 0, period: 0, dutyCycle: 50 };
}

/**
 * Calculates 10% to 90% rise time and 90% to 10% fall time
 */
export function calculateRiseFallTime(
  time: ArrayLike<number>,
  values: ArrayLike<number>
): { riseTime: number; fallTime: number } {
  if (!time || !values || time.length < 4) {
    return { riseTime: 0, fallTime: 0 };
  }

  const { min, max, pp } = calculateExtremes(values);
  if (pp < 1e-4) return { riseTime: 0, fallTime: 0 };

  const lowThresh = min + 0.1 * pp;
  const highThresh = min + 0.9 * pp;

  let riseStart: number | null = null;
  let riseEnd: number | null = null;
  let fallStart: number | null = null;
  let fallEnd: number | null = null;

  for (let i = 1; i < values.length; i++) {
    const vPrev = values[i - 1];
    const vCurr = values[i];
    const tCurr = time[i];

    // Rising
    if (vPrev < lowThresh && vCurr >= lowThresh && riseStart === null) {
      riseStart = tCurr;
    }
    if (vPrev < highThresh && vCurr >= highThresh && riseStart !== null && riseEnd === null) {
      riseEnd = tCurr;
    }

    // Falling
    if (vPrev > highThresh && vCurr <= highThresh && fallStart === null) {
      fallStart = tCurr;
    }
    if (vPrev > lowThresh && vCurr <= lowThresh && fallStart !== null && fallEnd === null) {
      fallEnd = tCurr;
    }
  }

  const riseTime = (riseStart !== null && riseEnd !== null && riseEnd > riseStart) ? (riseEnd - riseStart) : 0;
  const fallTime = (fallStart !== null && fallEnd !== null && fallEnd > fallStart) ? (fallEnd - fallStart) : 0;

  return { riseTime, fallTime };
}

/**
 * Comprehensive numerical analysis of a waveform time-series
 */
export function analyzeWaveform(
  time: ArrayLike<number>,
  values: ArrayLike<number>,
  triggerLevel?: number
): WaveformMetrics {
  if (!time || !values || values.length === 0) {
    return {
      vMax: 0,
      vMin: 0,
      vPp: 0,
      vAvg: 0,
      vRms: 0,
      vAcRms: 0,
      frequency: 0,
      period: 0,
      riseTime: 0,
      fallTime: 0,
      dutyCycle: 0,
      hasValidSignal: false
    };
  }

  const { min, max, pp } = calculateExtremes(values);
  const vAvg = calculateMean(values);
  const vRms = calculateRms(values);
  const vAcRms = calculateAcRms(values);
  const { frequency, period, dutyCycle } = calculateFrequencyAndPeriod(time, values, triggerLevel);
  const { riseTime, fallTime } = calculateRiseFallTime(time, values);

  return {
    vMax: max,
    vMin: min,
    vPp: pp,
    vAvg,
    vRms,
    vAcRms,
    frequency,
    period,
    riseTime,
    fallTime,
    dutyCycle,
    hasValidSignal: true
  };
}

/**
 * Real Edge Trigger Alignment: finds the trigger crossing point and calculates time window
 */
export function alignTrigger(
  time: number[],
  values: number[],
  triggerLevel: number,
  slope: 'rising' | 'falling' = 'rising',
  mode: 'AUTO' | 'NORMAL' | 'SINGLE' = 'AUTO'
): { triggerIndex: number; triggerTime: number; isTriggered: boolean } {
  if (!time || !values || values.length < 2) {
    return { triggerIndex: 0, triggerTime: 0, isTriggered: false };
  }

  const { pp } = calculateExtremes(values);
  const hysteresis = Math.max(pp * 0.02, 1e-4);

  for (let i = 1; i < values.length; i++) {
    const vPrev = values[i - 1];
    const vCurr = values[i];

    if (slope === 'rising') {
      if (vPrev < triggerLevel - hysteresis && vCurr >= triggerLevel) {
        return { triggerIndex: i, triggerTime: time[i], isTriggered: true };
      }
    } else {
      if (vPrev > triggerLevel + hysteresis && vCurr <= triggerLevel) {
        return { triggerIndex: i, triggerTime: time[i], isTriggered: true };
      }
    }
  }

  // If in AUTO mode, fall back to index 0
  return {
    triggerIndex: 0,
    triggerTime: time[0] ?? 0,
    isTriggered: mode === 'AUTO'
  };
}

/**
 * Decimates waveform for high-performance Canvas rendering while strictly preserving min/max peak envelopes
 */
export function decimateForDisplay(
  time: number[],
  values: number[],
  maxPoints: number = 800
): { time: number[]; values: number[] } {
  if (!time || !values || values.length <= maxPoints) {
    return { time, values };
  }

  const step = values.length / maxPoints;
  const outTime: number[] = [];
  const outValues: number[] = [];

  for (let i = 0; i < maxPoints; i++) {
    const startIdx = Math.floor(i * step);
    const endIdx = Math.min(Math.floor((i + 1) * step), values.length);

    let minVal = values[startIdx];
    let maxVal = values[startIdx];
    let minIdx = startIdx;
    let maxIdx = startIdx;

    for (let j = startIdx + 1; j < endIdx; j++) {
      if (values[j] < minVal) {
        minVal = values[j];
        minIdx = j;
      }
      if (values[j] > maxVal) {
        maxVal = values[j];
        maxIdx = j;
      }
    }

    if (minIdx < maxIdx) {
      outTime.push(time[minIdx]);
      outValues.push(minVal);
      outTime.push(time[maxIdx]);
      outValues.push(maxVal);
    } else {
      outTime.push(time[maxIdx]);
      outValues.push(maxVal);
      outTime.push(time[minIdx]);
      outValues.push(minVal);
    }
  }

  return { time: outTime, values: outValues };
}

/**
 * High-performance full-screen polyline generator for Oscilloscope Graticule
 * (Scales across 10 horizontal divisions by 8 vertical divisions)
 */
export function generateScopePolyline(
  time: number[],
  values: number[],
  totalTimeSpan: number,
  vDiv: number,
  offsetDiv: number,
  triggerLevel: number = 0,
  triggerSlope: 'RISING' | 'FALLING' = 'RISING'
): string {
  if (!time || !values || time.length < 2 || values.length < 2) return '';

  const { min, max, pp } = calculateExtremes(values);
  const isDc = pp < 1e-4;

  // Pure DC: draw straight line across full screen width (0% to 100%)
  if (isDc) {
    const v = values[0] ?? 0;
    const divFromCenter = (v / (vDiv || 1)) + offsetDiv;
    const yPercent = Math.min(Math.max(50 - (divFromCenter * 12.5), 0), 100);
    return `0,${yPercent.toFixed(2)} 100,${yPercent.toFixed(2)}`;
  }

  // Find trigger start index for stable, jitter-free display
  let startIdx = 0;
  for (let i = 1; i < Math.min(values.length, 300); i++) {
    if (triggerSlope === 'RISING' && values[i - 1] < triggerLevel && values[i] >= triggerLevel) {
      startIdx = i;
      break;
    } else if (triggerSlope === 'FALLING' && values[i - 1] > triggerLevel && values[i] <= triggerLevel) {
      startIdx = i;
      break;
    }
  }

  const startTime = time[startIdx] ?? time[0] ?? 0;
  const endTime = time[time.length - 1] ?? (startTime + 0.001);
  const dataSpan = Math.max(endTime - startTime, 1e-9);

  // Generate 400 crisp points across 0% to 100% of the screen
  const points: { x: number; y: number }[] = [];
  const numSteps = 400;

  for (let step = 0; step <= numSteps; step++) {
    const screenXPercent = (step / numSteps) * 100;
    const targetT = (step / numSteps) * totalTimeSpan;

    // Periodic sweep wrapping if user zoomed out beyond simulated data length
    let sampleT = targetT;
    if (dataSpan > 0 && sampleT > dataSpan) {
      sampleT = sampleT % dataSpan;
    }
    const queryTime = startTime + sampleT;

    // Linear interpolate value at queryTime
    let val = values[startIdx] ?? values[0] ?? 0;
    for (let i = 1; i < time.length; i++) {
      if (time[i] >= queryTime) {
        const t0 = time[i - 1] ?? 0;
        const t1 = time[i] ?? 1;
        const v0 = values[i - 1] ?? 0;
        const v1 = values[i] ?? 0;
        const frac = (t1 - t0 > 1e-12) ? (queryTime - t0) / (t1 - t0) : 0;
        val = v0 + frac * (v1 - v0);
        break;
      }
    }

    const divFromCenter = (val / (vDiv || 1)) + offsetDiv;
    const yPercent = Math.min(Math.max(50 - (divFromCenter * 12.5), 0), 100);
    points.push({ x: screenXPercent, y: yPercent });
  }

  return points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}

