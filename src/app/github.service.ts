// src/app/services/github.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string;
  created_at: string;
  updated_at: string;
  topics: string[];
  languages: string[];
}

@Injectable({ providedIn: 'root' })
export class GithubService {
  private apiUrl = 'https://api.github.com/users';
  private username = 'AdrianS2002';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders | undefined {
    const token = environment.githubToken;
    return token
      ? new HttpHeaders({
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.mercy-preview+json'
        })
      : undefined;
  }

  getReposWithLanguages(): Observable<Repo[]> {
    const params = new HttpParams()
      .set('sort', 'created')
      .set('direction', 'desc')
      .set('per_page', '100');

    const headers = this.getAuthHeaders();

 
    return this.http
      .get<Repo[]>(`${this.apiUrl}/${this.username}/repos`, { params, headers })
      .pipe(
       
        mergeMap(repos =>
          forkJoin(
            repos.map(repo => {
              const langHeaders = this.getAuthHeaders();
              return this.http
                .get<Record<string, number>>(
                  `https://api.github.com/repos/${this.username}/${repo.name}/languages`,
                  { headers: langHeaders }
                )
                .pipe(
                  map(langObj => ({
                    ...repo,
                    languages: Object.keys(langObj)
                  }))
                );
            })
          )
        )
      );
  }

  getReadmeRawUrl(repoName: string): string {
    return `https://raw.githubusercontent.com/${this.username}/${repoName}/main/README.md`;
  }

  getReadmeMarkdown(repoName: string): Observable<string> {
    const url = this.getReadmeRawUrl(repoName);
    // pentru raw markdown nu avem nevoie de autentificare
    return this.http.get(url, { responseType: 'text' });
  }
}
