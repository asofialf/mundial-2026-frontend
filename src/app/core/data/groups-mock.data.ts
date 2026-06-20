/**
 * MOCK — Grupos, países y matchStage de la Copa Mundial 2026.
 *
 * El backend (mundial-2026-service) NO expone ningún endpoint para listar
 * grupos/países/equipos (no existe GroupController ni CountryController,
 * aunque las tablas Groups/Countries/GroupCountries existen en la BD).
 *
 * Estos `countryId` son INVENTADOS y casi seguro NO coinciden con los
 * country_id reales de la base de datos. Mientras no exista
 * GET /group/all (pendiente de pedir al backend), las predicciones de
 * grupos guardadas contra el backend real usarán IDs incorrectos.
 *
 * TODO(backend): pedir GET /group/all -> { groupId, name, countries: [{countryId, name, fifaCode, image}] }
 * y reemplazar este archivo por datos reales.
 */

export interface MockCountry {
  countryId: number;
  name: string;
  fifaCode: string;
  flag: string; // emoji como placeholder de bandera
}

export interface MockGroup {
  groupId: number;
  name: string; // "Grupo A"
  countries: MockCountry[];
}

export const GROUPS_MOCK: MockGroup[] = [
  { groupId: 1, name: 'Grupo A', countries: [
    { countryId: 101, name: 'México', fifaCode: 'MEX', flag: '🇲🇽' },
    { countryId: 102, name: 'Japón', fifaCode: 'JPN', flag: '🇯🇵' },
    { countryId: 103, name: 'Polonia', fifaCode: 'POL', flag: '🇵🇱' },
    { countryId: 104, name: 'Corea del Sur', fifaCode: 'KOR', flag: '🇰🇷' },
  ]},
  { groupId: 2, name: 'Grupo B', countries: [
    { countryId: 105, name: 'Marruecos', fifaCode: 'MAR', flag: '🇲🇦' },
    { countryId: 106, name: 'Ecuador', fifaCode: 'ECU', flag: '🇪🇨' },
    { countryId: 107, name: 'Dinamarca', fifaCode: 'DEN', flag: '🇩🇰' },
    { countryId: 108, name: 'Egipto', fifaCode: 'EGY', flag: '🇪🇬' },
  ]},
  { groupId: 3, name: 'Grupo C', countries: [
    { countryId: 109, name: 'Turquía', fifaCode: 'TUR', flag: '🇹🇷' },
    { countryId: 110, name: 'Arabia Saudita', fifaCode: 'KSA', flag: '🇸🇦' },
    { countryId: 111, name: 'Suiza', fifaCode: 'SUI', flag: '🇨🇭' },
    { countryId: 112, name: 'Estados Unidos', fifaCode: 'USA', flag: '🇺🇸' },
  ]},
  { groupId: 4, name: 'Grupo D', countries: [
    { countryId: 113, name: 'Nigeria', fifaCode: 'NGA', flag: '🇳🇬' },
    { countryId: 114, name: 'Croacia', fifaCode: 'CRO', flag: '🇭🇷' },
    { countryId: 115, name: 'Bélgica', fifaCode: 'BEL', flag: '🇧🇪' },
    { countryId: 116, name: 'Corea del Sur 2', fifaCode: 'KOR2', flag: '🏴' },
  ]},
  { groupId: 5, name: 'Grupo E', countries: [
    { countryId: 117, name: 'Serbia', fifaCode: 'SRB', flag: '🇷🇸' },
    { countryId: 118, name: 'Australia', fifaCode: 'AUS', flag: '🇦🇺' },
    { countryId: 119, name: 'Noruega', fifaCode: 'NOR', flag: '🇳🇴' },
    { countryId: 120, name: 'Camerún', fifaCode: 'CMR', flag: '🇨🇲' },
  ]},
  { groupId: 6, name: 'Grupo F', countries: [
    { countryId: 121, name: 'Túnez', fifaCode: 'TUN', flag: '🇹🇳' },
    { countryId: 122, name: 'Uruguay', fifaCode: 'URU', flag: '🇺🇾' },
    { countryId: 123, name: 'Irán', fifaCode: 'IRN', flag: '🇮🇷' },
    { countryId: 124, name: 'Ghana', fifaCode: 'GHA', flag: '🇬🇭' },
  ]},
  { groupId: 7, name: 'Grupo G', countries: [
    { countryId: 125, name: 'Brasil', fifaCode: 'BRA', flag: '🇧🇷' },
    { countryId: 126, name: 'Senegal', fifaCode: 'SEN', flag: '🇸🇳' },
    { countryId: 127, name: 'Inglaterra', fifaCode: 'ENG', flag: '🏴' },
    { countryId: 128, name: 'Gales', fifaCode: 'WAL', flag: '🏴' },
  ]},
  { groupId: 8, name: 'Grupo H', countries: [
    { countryId: 129, name: 'Argentina', fifaCode: 'ARG', flag: '🇦🇷' },
    { countryId: 130, name: 'Francia', fifaCode: 'FRA', flag: '🇫🇷' },
    { countryId: 131, name: 'Colombia', fifaCode: 'COL', flag: '🇨🇴' },
    { countryId: 132, name: 'Catar', fifaCode: 'QAT', flag: '🇶🇦' },
  ]},
  { groupId: 9, name: 'Grupo I', countries: [
    { countryId: 133, name: 'Alemania', fifaCode: 'GER', flag: '🇩🇪' },
    { countryId: 134, name: 'Países Bajos', fifaCode: 'NED', flag: '🇳🇱' },
    { countryId: 135, name: 'Costa de Marfil', fifaCode: 'CIV', flag: '🇨🇮' },
    { countryId: 136, name: 'Canadá', fifaCode: 'CAN', flag: '🇨🇦' },
  ]},
  { groupId: 10, name: 'Grupo J', countries: [
    { countryId: 137, name: 'España', fifaCode: 'ESP', flag: '🇪🇸' },
    { countryId: 138, name: 'Portugal', fifaCode: 'POR', flag: '🇵🇹' },
    { countryId: 139, name: 'Chile', fifaCode: 'CHI', flag: '🇨🇱' },
    { countryId: 140, name: 'Panamá', fifaCode: 'PAN', flag: '🇵🇦' },
  ]},
  { groupId: 11, name: 'Grupo K', countries: [
    { countryId: 141, name: 'Italia', fifaCode: 'ITA', flag: '🇮🇹' },
    { countryId: 142, name: 'Bolivia', fifaCode: 'BOL', flag: '🇧🇴' },
    { countryId: 143, name: 'Jamaica', fifaCode: 'JAM', flag: '🇯🇲' },
    { countryId: 144, name: 'Nueva Zelanda', fifaCode: 'NZL', flag: '🇳🇿' },
  ]},
  { groupId: 12, name: 'Grupo L', countries: [
    { countryId: 145, name: 'Suecia', fifaCode: 'SWE', flag: '🇸🇪' },
    { countryId: 146, name: 'Costa Rica', fifaCode: 'CRC', flag: '🇨🇷' },
    { countryId: 147, name: 'Venezuela', fifaCode: 'VEN', flag: '🇻🇪' },
    { countryId: 148, name: 'Sudáfrica', fifaCode: 'RSA', flag: '🇿🇦' },
  ]},
];

/** Mapa rápido countryId -> MockCountry, usado por leaderboard/eliminatorias para mostrar nombre/bandera. */
export const COUNTRY_BY_ID: Record<number, MockCountry> = GROUPS_MOCK
  .flatMap(g => g.countries)
  .reduce((acc, c) => ({ ...acc, [c.countryId]: c }), {} as Record<number, MockCountry>);

/**
 * MOCK — matchStageId. El backend guarda enteros crudos sin tabla de
 * lookup expuesta; estos valores son una SUPOSICIÓN basada en convención
 * habitual (1=Grupos, 2=Octavos, ...). Confirmar con backend antes de
 * confiar en ellos para crear partidos reales (ver módulo CSV/Admin).
 */
export enum MatchStageId {
  GROUP       = 1,
  ROUND_OF_32 = 2, // Dieciseisavos (el Mundial 2026 tiene 48 equipos -> ronda extra antes de octavos)
  ROUND_OF_16 = 3, // Octavos
  QUARTER     = 4,
  SEMI        = 5,
  FINAL       = 6,
}

export const MATCH_STAGE_LABEL: Record<number, string> = {
  [MatchStageId.GROUP]:       'Fase de Grupos',
  [MatchStageId.ROUND_OF_32]: 'Dieciseisavos',
  [MatchStageId.ROUND_OF_16]: 'Octavos',
  [MatchStageId.QUARTER]:     'Cuartos',
  [MatchStageId.SEMI]:        'Semifinales',
  [MatchStageId.FINAL]:       'Final',
};

/** Orden de las sub-fases eliminatorias para tabs/iteración. */
export const KNOCKOUT_STAGE_ORDER: number[] = [
  MatchStageId.ROUND_OF_32,
  MatchStageId.ROUND_OF_16,
  MatchStageId.QUARTER,
  MatchStageId.SEMI,
  MatchStageId.FINAL,
];
