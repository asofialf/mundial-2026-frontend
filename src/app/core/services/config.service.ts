import { Injectable, signal } from '@angular/core';
import { AppConfig } from '../models/domain.models';
import { KNOCKOUT_STAGE_ORDER } from '../data/groups-mock.data';

const CONFIG_KEY = 'mp_admin_config';

const DEFAULT_CONFIG: AppConfig = {
  isGroupPhaseActive:    true,
  isKnockoutPhaseActive: true,
  knockoutStageActive:   KNOCKOUT_STAGE_ORDER.reduce(
    (acc, stageId) => ({ ...acc, [stageId]: false }), {} as Record<number, boolean>
  ),
};

/**
 * Servicio de configuración de fases.
 *
 * LIMITACIÓN: el backend no expone ningún endpoint de config global
 * (no hay tabla/controller para flags como "fase de grupos bloqueada").
 * Mientras no se pida ese endpoint, estos flags se persisten en
 * localStorage del navegador del admin — NO se sincronizan entre
 * usuarios ni dispositivos. Cuando exista GET/PUT /config en el
 * backend, reemplazar _loadConfig()/_persist() por llamadas HTTP.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private _config = signal<AppConfig>(this._loadConfig());

  readonly config = this._config.asReadonly();

  readonly isGroupPhaseActive    = () => this._config().isGroupPhaseActive;
  readonly isKnockoutPhaseActive = () => this._config().isKnockoutPhaseActive;

  isKnockoutStageActive(matchStageId: number): boolean {
    return !!this._config().knockoutStageActive[matchStageId];
  }

  setGroupPhase(active: boolean): void {
    this._update(c => ({ ...c, isGroupPhaseActive: active }));
  }

  setKnockoutPhase(active: boolean): void {
    this._update(c => ({ ...c, isKnockoutPhaseActive: active }));
  }

  setKnockoutStage(matchStageId: number, active: boolean): void {
    this._update(c => ({
      ...c,
      knockoutStageActive: { ...c.knockoutStageActive, [matchStageId]: active },
    }));
  }

  private _update(fn: (c: AppConfig) => AppConfig): void {
    const next = fn(this._config());
    this._config.set(next);
    this._persist(next);
  }

  private _persist(config: AppConfig): void {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }

  private _loadConfig(): AppConfig {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppConfig;
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          knockoutStageActive: { ...DEFAULT_CONFIG.knockoutStageActive, ...parsed.knockoutStageActive },
        };
      }
    } catch {
      // localStorage corrupto o no disponible -> usar default
    }
    return DEFAULT_CONFIG;
  }
}
