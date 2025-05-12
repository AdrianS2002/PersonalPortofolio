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
  private authHeaders = new HttpHeaders({
    Authorization: `token ${environment.githubToken}`, 
    Accept: 'application/vnd.github.mercy-preview+json'
  });

  constructor(private http: HttpClient) {}


  getReposWithLanguages(): Observable<Repo[]> {
    const params = new HttpParams()
      .set('sort', 'created')
      .set('direction', 'desc')
      .set('per_page', '100');

    return this.http
      .get<Repo[]>(`${this.apiUrl}/${this.username}/repos`, {
        params,
        headers: this.authHeaders
      })
      .pipe(
        mergeMap(repos =>
          forkJoin(
            repos.map(repo =>
              this.http
                .get<Record<string, number>>(
                  `https://api.github.com/repos/${this.username}/${repo.name}/languages`,
                  { headers: this.authHeaders }
                )
                .pipe(
                  map(langObj => ({
                    ...repo,
                    languages: Object.keys(langObj)
                  }))
                )
            )
          )
        )
      );
  }

   getReadmeRawUrl(repoName: string): string {
    return `https://raw.githubusercontent.com/${this.username}/${repoName}/main/README.md`;
  }

  getReadmeMarkdown(repoName: string): Observable<string> {
    const url = this.getReadmeRawUrl(repoName);
    return this.http.get(url, { responseType: 'text' });
  }

}