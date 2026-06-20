import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatchService } from '../../core/services/match.service';
import { ConfigService } from '../../core/services/config.service';
import { KnockoutPredictionService } from '../../core/services/knockout-prediction.service';
import { KnockoutPrediction } from '../../core/models/domain.models';
import { KNOCKOUT_STAGE_ORDER, MATCH_STAGE_LABEL, COUNTRY_BY_ID } from '../../core/data/groups-mock.data';

interface MatchView {
  matchId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  kickOffTime: string;
  matchStageId: number;
  isLocked: boolean;
}

interface MatchPredictionForm {
  scoreTeamA: number | null;
  scoreTeamB: number | null;
  advancingTeamId: number | null;
  hasPenalties: boolean | null;
}

@Component({
  selector: 'app-eliminatorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './eliminatorias.component.html',
  styleUrl: './eliminatorias.component.scss',
})
export class EliminatoriasComponent implements OnInit {
  private auth        = inject(AuthService);
  private matchService = inject(MatchService);
  private configService = inject(ConfigService);
  private knockoutPredictionService = inject(KnockoutPredictionService);

  readonly stages = KNOCKOUT_STAGE_ORDER;
  readonly stageLabel = MATCH_STAGE_LABEL;

  loading = signal(true);
  errorMsg = signal<string | null>(null);
  savedMatchIds = signal<Set<number>>(new Set());

  activeStage = signal<number>(KNOCKOUT_STAGE_ORDER[0]);
  allMatches = signal<MatchView[]>([]);
  forms = signal<Record<number, MatchPredictionForm>>({});

  readonly matchesForActiveStage = computed<MatchView[]>(() =>
    this.allMatches()
      .filter(m => m.matchStageId === this.activeStage())
      .sort((a, b) => new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime())
  );

  get knockoutPhaseLocked(): boolean {
    return !this.configService.isKnockoutPhaseActive();
  }

  isStageEnabled(stageId: number): boolean {
    return this.configService.isKnockoutStageActive(stageId);
  }

  ngOnInit(): void {
    this._loadMatches();
  }

  setActiveStage(stageId: number): void {
    if (!this.isStageEnabled(stageId)) return;
    this.activeStage.set(stageId);
  }

  isMatchLocked(match: MatchView): boolean {
    if (this.knockoutPhaseLocked) return true;
    if (!this.isStageEnabled(match.matchStageId)) return true;
    if (match.isLocked) return true;

    // Auto-bloqueo: 1 hora antes del kickoff (calculado en cliente,
    // ya que el backend no implementa esta regla automáticamente).
    const kickoff = new Date(match.kickOffTime).getTime();
    const oneHourBefore = kickoff - 60 * 60 * 1000;
    return Date.now() >= oneHourBefore;
  }

  updateForm(matchId: number, partial: Partial<MatchPredictionForm>): void {
    this.forms.update(f => ({
      ...f,
      [matchId]: { ...this._emptyForm(), ...f[matchId], ...partial },
    }));
  }

  savePrediction(match: MatchView): void {
    if (this.isMatchLocked(match)) return;
    const userId = this.auth.session()?.userId;
    if (!userId) return;

    const form = this.forms()[match.matchId];
    if (form?.scoreTeamA == null || form?.scoreTeamB == null || form?.advancingTeamId == null || form?.hasPenalties == null) {
      this.errorMsg.set('Completa marcador, clasificado y penales antes de guardar.');
      return;
    }

    this.errorMsg.set(null);

    const prediction: KnockoutPrediction = {
      matchId: match.matchId,
      userId,
      scoreTeamA: form.scoreTeamA,
      scoreTeamB: form.scoreTeamB,
      advancingTeamId: form.advancingTeamId,
      hasPenalties: form.hasPenalties,
    };

    this.knockoutPredictionService.upsert(prediction);
    this.savedMatchIds.update(s => new Set(s).add(match.matchId));
  }

  isSaved(matchId: number): boolean {
    return this.savedMatchIds().has(matchId);
  }

  teamName(countryId: number, fallback?: string): string {
    return fallback || COUNTRY_BY_ID[countryId]?.name || `Equipo #${countryId}`;
  }

  private _emptyForm(): MatchPredictionForm {
    return { scoreTeamA: null, scoreTeamB: null, advancingTeamId: null, hasPenalties: null };
  }

  private _loadMatches(): void {
    const userId = this.auth.session()?.userId;
    this.loading.set(true);

    this.matchService.getMatches().subscribe({
      next: (raw) => {
        const matches: MatchView[] = (raw ?? []).map(r => ({
          matchId:      Number(r['matchId'] ?? r['match_id']),
          homeTeamId:   Number(r['homeTeamId'] ?? r['home_team_id']),
          awayTeamId:   Number(r['awayTeamId'] ?? r['away_team_id']),
          homeTeamName: String(r['homeTeamName'] ?? r['home_team_name'] ?? ''),
          awayTeamName: String(r['awayTeamName'] ?? r['away_team_name'] ?? ''),
          kickOffTime:  String(r['kickOffTime'] ?? r['kick_off_time'] ?? r['kickoffTime'] ?? ''),
          matchStageId: Number(r['matchStageId'] ?? r['match_stage_id']),
          isLocked:     Number(r['isLocked'] ?? r['is_locked']) === 1,
        })).filter(m => !!m.matchId);

        this.allMatches.set(matches);

        if (!this.matchesForActiveStage().length) {
          const firstWithMatches = this.stages.find(s => matches.some(m => m.matchStageId === s));
          if (firstWithMatches) this.activeStage.set(firstWithMatches);
        }

        if (userId) {
          const existing = this.knockoutPredictionService.getAllForUser(userId);
          const forms: Record<number, MatchPredictionForm> = {};
          const saved = new Set<number>();
          existing.forEach(p => {
            forms[p.matchId] = {
              scoreTeamA: p.scoreTeamA,
              scoreTeamB: p.scoreTeamB,
              advancingTeamId: p.advancingTeamId,
              hasPenalties: p.hasPenalties,
            };
            saved.add(p.matchId);
          });
          this.forms.set(forms);
          this.savedMatchIds.set(saved);
        }

        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('No se pudieron cargar los partidos.');
        this.loading.set(false);
      },
    });
  }
}
