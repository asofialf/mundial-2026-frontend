import { Injectable } from '@angular/core';
import { GROUPS_MOCK, MockGroup } from '../data/groups-mock.data';
import { SCORING_RULES } from '../config/scoring.config';
import { KnockoutPrediction, Match } from '../models/domain.models';

export interface GroupStandingRow {
  countryId: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface UserGroupPick {
  groupId: number;
  firstPlaceId?: number;
  secondPlaceId?: number;
}

export interface UserBestThirdPick {
  countryId: number;
}

/**
 * Cálculo de tabla de posiciones de grupo y mejores terceros.
 *
 * LIMITACIÓN: no existe en el backend una tabla de standings de grupo
 * ni de "mejores terceros reales" — se calculan aquí a partir de los
 * resultados de partidos de fase de grupos (homeScore/awayScore) y de
 * la composición de grupos MOCK (groups-mock.data.ts). El criterio de
 * desempate usado es simplificado: puntos -> diferencia de goles ->
 * goles a favor (no incluye head-to-head ni fair play como las reglas
 * oficiales FIFA).
 */
@Injectable({ providedIn: 'root' })
export class LeaderboardScoringService {
  /** Calcula la tabla de cada grupo a partir de partidos de fase de grupos ya jugados. */
  computeGroupStandings(groupMatches: Match[]): Map<number, GroupStandingRow[]> {
    const standingsByGroup = new Map<number, Map<number, GroupStandingRow>>();

    for (const group of GROUPS_MOCK) {
      const rows = new Map<number, GroupStandingRow>();
      for (const country of group.countries) {
        rows.set(country.countryId, { countryId: country.countryId, points: 0, goalsFor: 0, goalsAgainst: 0 });
      }
      standingsByGroup.set(group.groupId, rows);
    }

    const groupOf = (countryId: number): MockGroup | undefined =>
      GROUPS_MOCK.find(g => g.countries.some(c => c.countryId === countryId));

    for (const match of groupMatches) {
      if (match.homeScore == null || match.awayScore == null) continue;

      const group = groupOf(match.homeTeamId);
      if (!group || !groupOf(match.awayTeamId) || group.groupId !== groupOf(match.awayTeamId)?.groupId) continue;

      const rows = standingsByGroup.get(group.groupId)!;
      const home = rows.get(match.homeTeamId);
      const away = rows.get(match.awayTeamId);
      if (!home || !away) continue;

      home.goalsFor += match.homeScore; home.goalsAgainst += match.awayScore;
      away.goalsFor += match.awayScore; away.goalsAgainst += match.homeScore;

      if (match.homeScore > match.awayScore) home.points += 3;
      else if (match.homeScore < match.awayScore) away.points += 3;
      else { home.points += 1; away.points += 1; }
    }

    const result = new Map<number, GroupStandingRow[]>();
    standingsByGroup.forEach((rows, groupId) => {
      result.set(groupId, [...rows.values()].sort((a, b) =>
        b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor
      ));
    });
    return result;
  }

  /** Top 8 terceros lugares reales, entre todos los grupos. */
  computeActualBestThirds(standingsByGroup: Map<number, GroupStandingRow[]>): Set<number> {
    const thirds = [...standingsByGroup.values()]
      .map(rows => rows[2])
      .filter((row): row is GroupStandingRow => !!row)
      .sort((a, b) =>
        b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor
      )
      .slice(0, 8);
    return new Set(thirds.map(t => t.countryId));
  }

  scoreGroupPredictions(picks: UserGroupPick[], standingsByGroup: Map<number, GroupStandingRow[]>): number {
    let points = 0;
    for (const pick of picks) {
      const rows = standingsByGroup.get(pick.groupId);
      if (!rows || rows.every(r => r.points === 0 && r.goalsFor === 0 && r.goalsAgainst === 0)) continue;

      const actualFirst = rows[0]?.countryId;
      const actualSecond = rows[1]?.countryId;

      if (pick.firstPlaceId === actualFirst && pick.secondPlaceId === actualSecond) {
        points += SCORING_RULES.grupos.primeroYSegundoExacto;
        continue;
      }

      const top2 = new Set([actualFirst, actualSecond].filter(Boolean));
      if (pick.firstPlaceId && top2.has(pick.firstPlaceId)) points += SCORING_RULES.grupos.equipoEnTop2SinOrden;
      if (pick.secondPlaceId && top2.has(pick.secondPlaceId)) points += SCORING_RULES.grupos.equipoEnTop2SinOrden;
    }
    return points;
  }

  scoreBestThirdPredictions(picks: UserBestThirdPick[], actualBestThirds: Set<number>): number {
    return picks.filter(p => actualBestThirds.has(p.countryId)).length * SCORING_RULES.grupos.mejorTerceroAcertado;
  }

  scoreKnockoutPredictions(predictions: KnockoutPrediction[], matchesById: Map<number, Match>): number {
    let points = 0;
    for (const pred of predictions) {
      const match = matchesById.get(pred.matchId);
      if (!match || match.homeScore == null || match.awayScore == null) continue;

      if (pred.scoreTeamA === match.homeScore && pred.scoreTeamB === match.awayScore) {
        points += SCORING_RULES.eliminatorias.marcadorExacto;
      } else if (match.winnerTeamId && pred.advancingTeamId === match.winnerTeamId) {
        points += SCORING_RULES.eliminatorias.clasificadoAcertado;
      }

      if (match.penalties != null && pred.hasPenalties === (match.penalties === 1)) {
        points += SCORING_RULES.eliminatorias.penalesAcertado;
      }
    }
    return points;
  }
}
