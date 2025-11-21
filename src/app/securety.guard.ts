import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';

export const securityGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Array<string>; // roles permitidas
  const userStr = localStorage.getItem('user');

  if (!userStr) {
    // Não está logado, redireciona para login
    router.navigate(['/login']);
    return false;
  }

  const user = JSON.parse(userStr);

  if (!allowedRoles.includes(user.role)) {
    // Não tem permissão, redireciona para home
    router.navigate(['/']);
    return false;
  }

  return true;
};
