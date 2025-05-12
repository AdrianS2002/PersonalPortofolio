import { Routes } from '@angular/router';
import { PortfolioComponent } from './portfolio/portfolio.component';

export const routes: Routes = [
     { path: '', redirectTo: '/personalProjects', pathMatch: 'full' },
     { path: 'personalProjects', component: PortfolioComponent },
];
