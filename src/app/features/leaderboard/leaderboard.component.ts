import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { PredictionService } from '../../core/services/prediction.service';
import { MatchService } from '../../core/services/match.service';
import { KnockoutPredictionService } from '../../core/services/knockout-prediction.service';
import { LeaderboardScoringService, UserGroupPick, UserBestThirdPick } from '../../core/services/leaderboard-scoring.service';
import { Match } from '../../core/models/domain.models';
import { MatchStageId } from '../../core/data/groups-mock.data';

interface LeaderboardRow {
  userId: number;
  alias: string;
  totalPoints: number;
  rank: number;
}

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent implements OnInit {
  private auth = inject(AuthService);
  private predictionService = inject(PredictionService);
  private matchService = inject(MatchService);
  private knockoutPredictionService = inject(KnockoutPredictionService);
  private scoring = inject(LeaderboardScoringService);

  loading = signal(true);
  errorMsg = signal<string | null>(null);
  rows = signal<LeaderboardRow[]>([]);

  get currentUserId(): number | undefined {
    return this.auth.session()?.userId;
  }

  ngOnInit(): void {
    this._load();
  }

  private _load(): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    forkJoin({
      users: this.auth.getAllUsers().pipe(catchError(() => of([]))),
      matches: this.matchService.getMatches().pipe(catchError(() => of([]))),
    }).subscribe(({ users, matches }) => {
      const matchesMapped: Match[] = matches.map(r => this._mapMatch(r));
      const matchesById = new Map(matchesMapped.map(m => [m.matchId, m]));
      const groupMatches = matchesMapped.filter(m => m.matchStageId === MatchStageId.GROUP);

      const standingsByGroup = this.scoring.computeGroupStandings(groupMatches);
      const actualBestThirds = this.scoring.computeActualBestThirds(standingsByGroup);

      const userList = (users ?? []).map(u => ({
        userId: Number(u['userId'] ?? u['user_id']),
        alias: String(u['alias'] ?? u['username'] ?? u['email'] ?? `Usuario #${u['userId'] ?? u['user_id']}`),
      })).filter(u => !!u.userId);

      if (!userList.length) {
        this.rows.set([]);
        this.loading.set(false);
        return;
      }

      forkJoin(
        userList.map(u => forkJoin({
          user: of(u),
          groupPreds: this.predictionService.getUserGroupPrediction(u.userId).pipe(catchError(() => of([]))),
          thirdPreds: this.predictionService.getUserBestThird(u.userId).pipe(catchError(() => of([]))),
        }))
      ).subscribe(results => {
        const computed: LeaderboardRow[] = results.map(({ user, groupPreds, thirdPreds }) => {
          const groupPicks: UserGroupPick[] = (groupPreds ?? []).map(r => ({
            groupId: Number(r['groupId'] ?? r['group_id']),
            firstPlaceId: Number(r['firstPlaceId'] ?? r['first_place_id']) || undefined,
            secondPlaceId: Number(r['secondPlaceId'] ?? r['second_place_id']) || undefined,
          }));
          const thirdPicks: UserBestThirdPick[] = (thirdPreds ?? []).map(r => ({
            countryId: Number(r['countryId'] ?? r['country_id']),
          }));
          const knockoutPreds = this.knockoutPredictionService.getAllForUser(user.userId);

          const groupPts = this.scoring.scoreGroupPredictions(groupPicks, standingsByGroup);
          const thirdPts = this.scoring.scoreBestThirdPredictions(thirdPicks, actualBestThirds);
          const knockoutPts = this.scoring.scoreKnockoutPredictions(knockoutPreds, matchesById);

          return {
            userId: user.userId,
            alias: user.alias,
            totalPoints: groupPts + thirdPts + knockoutPts,
            rank: 0,
          };
        });

        computed.sort((a, b) => b.totalPoints - a.totalPoints);
        computed.forEach((row, idx) => row.rank = idx + 1);

        this.rows.set(computed);
        this.loading.set(false);
      });
    });
  }

  private _mapMatch(r: Record<string, unknown>): Match {
    const homeScore = r['homeScore'] ?? r['home_score'];
    const awayScore = r['awayScore'] ?? r['away_score'];
    const winnerTeamId = r['winnerTeamId'] ?? r['winner_team_id'];
    const penalties = r['penalties'];
    return {
      matchId: Number(r['matchId'] ?? r['match_id']),
      homeTeamId: Number(r['homeTeamId'] ?? r['home_team_id']),
      awayTeamId: Number(r['awayTeamId'] ?? r['away_team_id']),
      kickOffTime: String(r['kickOffTime'] ?? r['kick_off_time'] ?? ''),
      matchStatusId: Number(r['matchStatusId'] ?? r['match_status_id']),
      matchStageId: Number(r['matchStageId'] ?? r['match_stage_id']),
      isLocked: Number(r['isLocked'] ?? r['is_locked']) as 0 | 1,
      homeScore: homeScore == null ? undefined : Number(homeScore),
      awayScore: awayScore == null ? undefined : Number(awayScore),
      winnerTeamId: winnerTeamId == null ? undefined : Number(winnerTeamId),
      penalties: penalties == null ? undefined : Number(penalties),
    };
  }
}
