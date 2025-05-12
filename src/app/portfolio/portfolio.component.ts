import { Component, OnInit } from '@angular/core';
import { GithubService, Repo } from '../github.service';
import { CommonModule } from '@angular/common';
import { MarkdownPipe } from '../markdown.pipe';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, MarkdownPipe],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css'
})
export class PortfolioComponent implements OnInit {
  
  repos: (Repo & { readme?: string })[] = [];

  constructor(public github: GithubService) {}

  ngOnInit(): void {
    this.github.getReposWithLanguages().subscribe(repos => {
      this.repos = repos;
      this.repos.forEach(repo => {
        this.github.getReadmeMarkdown(repo.name).subscribe(
          md => repo.readme = md,
          () => repo.readme = '_No README available._'
        );
      });
    });
  }
}