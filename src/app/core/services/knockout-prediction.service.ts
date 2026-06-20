import { Injectable } from '@angular/core';
import { KnockoutPrediction } from '../models/domain.models';

const STORAGE_KEY = 'mp_knockout_predictions';

/**
 * Predicciones de Eliminatorias — TEMPORAL / MOCK.
 *
 * El backend (mundial-2026-service) no tiene ningún endpoint para
 * guardar la predicción de un usuario sobre un partido de eliminatoria
 * (marcador, clasificado, penales). Solo existen endpoints para
 * predicciones de fase de grupos y mejores terceros.
 *
 * Mientras tanto, esto se guarda en localStorage del navegador del
 * usuario: NO se sincroniza entre dispositivos, se pierde si limpia
 * datos del navegador, y no es visible para el leaderboard de otros
 * usuarios (cada usuario solo ve y persiste lo suyo).
 *
 * TODO(backend): pedir endpoints reales, ej.
 *   POST /prediction/create-user-knockout-prediction
 *   PUT  /prediction/update-user-knockout-prediction
 *   GET  /prediction/get-user-knockout-prediction?userId=
 * y reemplazar este servicio por llamadas HTTP equivalentes a
 * PredictionService.
 */
@Injectable({ providedIn: 'root' })
export class KnockoutPredictionService {
  getAllForUser(userId: number): KnockoutPrediction[] {
    return this._loadAll().filter(p => p.userId === userId);
  }

  getForMatch(userId: number, matchId: number): KnockoutPrediction | undefined {
    return this._loadAll().find(p => p.userId === userId && p.matchId === matchId);
  }

  upsert(prediction: KnockoutPrediction): KnockoutPrediction {
    const all = this._loadAll();
    const idx = all.findIndex(p => p.userId === prediction.userId && p.matchId === prediction.matchId);

    if (idx >= 0) {
      all[idx] = { ...all[idx], ...prediction };
    } else {
      all.push(prediction);
    }

    this._persist(all);
    return prediction;
  }

  /** Todas las predicciones de todos los usuarios — usado por el leaderboard. */
  getAll(): KnockoutPrediction[] {
    return this._loadAll();
  }

  private _loadAll(): KnockoutPrediction[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as KnockoutPrediction[]) : [];
    } catch {
      return [];
    }
  }

  private _persist(all: KnockoutPrediction[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
}
