import { MatchStageId } from '../data/match-stage.data';

/**
 * Reglas de puntaje del Mundial Predictor.
 *
 * Edita estos números para cambiar el sistema de puntos sin tocar la
 * lógica de cálculo (ver LeaderboardComponent / LeaderboardService.java).
 *
 * Eliminatorias — puntaje BASE por partido (máximo 8 pts):
 *   Marcador exacto (90 min): 2 pts
 *   Equipo clasificado:        5 pts
 *   Penales sí/no:             1 pt
 * Luego se multiplica por el multiplicador de ronda.
 */
export const SCORING_RULES = {
  grupos: {
    primeroYSegundoExacto: 3,
    equipoEnTop2SinOrden: 1,
    mejorTerceroAcertado: 1,
  },
  eliminatorias: {
    /** Marcador exacto en los 90 minutos. */
    marcadorExacto: 2,
    /** Equipo que avanza acertado (sin marcador exacto). */
    clasificadoAcertado: 5,
    /** Acertar si hubo o no definición por penales. */
    penalesAcertado: 1,
    /** Máximo base por partido antes del multiplicador. */
    maxBase: 8,
  },
  /**
   * Multiplicador por ronda. Se aplica al puntaje base del partido.
   * Resultado se redondea al entero más cercano.
   */
  stageMultiplier: {
    [MatchStageId.ROUND_OF_32]: 1,
    [MatchStageId.ROUND_OF_16]: 1.5,
    [MatchStageId.QUARTER]:     1.5,
    [MatchStageId.SEMI]:        2,
    [MatchStageId.FINAL]:       3,
  } as Record<number, number>,
} as const;
