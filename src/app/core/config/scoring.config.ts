/**
 * Reglas de puntaje del Mundial Predictor.
 *
 * Edita estos números para cambiar el sistema de puntos sin tocar la
 * lógica de cálculo (ver LeaderboardComponent).
 */
export const SCORING_RULES = {
  grupos: {
    /** Acertar 1° Y 2° lugar exactos (en el orden correcto). */
    primeroYSegundoExacto: 3,
    /** Acertar un equipo dentro del top 2, pero en el lugar incorrecto. */
    equipoEnTop2SinOrden: 1,
    /** Por cada uno de los 8 "mejores terceros" acertado. */
    mejorTerceroAcertado: 1,
  },
  eliminatorias: {
    /** Marcador exacto en los 90 minutos. */
    marcadorExacto: 3,
    /** Solo se acertó el equipo que clasifica (sin marcador exacto). */
    clasificadoAcertado: 1,
    /** Acertar si hubo o no definición por penales. */
    penalesAcertado: 1,
  },
} as const;
