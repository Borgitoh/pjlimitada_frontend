import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { User, TableColumn, TableAction } from '../../models/admin.models';
import { AuthService } from 'src/app/services/auth.service.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  users: any[] = [];
  currentUser: any = {
    id: null,
    name: '',
    email: '',
    role: '',
    active: true,
    password: ''
  };

  isModalOpen = false;
  isDeleteModalOpen = false;
  isAffiliatesOpen = false;
  editMode = false;
  modalTitle = '';
  userToDelete: User | null = null;
  selectedUserForAffiliates: User | null = null;
  isLoading: boolean = false;

  private destroy$ = new Subject<void>();

  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Nome', sortable: true, type: 'text' },
    { key: 'email', label: 'E-mail', sortable: true, type: 'text' },
    { key: 'roleLabel', label: 'Cargo', sortable: true, type: 'text' },
    { key: 'active', label: 'Status', type: 'status' },
    { key: 'last_login', label: 'Último Login', type: 'date', sortable: true },
    { key: 'actions', label: 'Ações', type: 'actions', width: '120px' }
  ];

  tableActions: TableAction[] = [
    {
      label: 'Afiliados',
      icon: 'M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM15 20H9v-2a6 6 0 0112 0v2z',
      type: 'primary',
      action: (user: User) => this.viewUserAffiliates(user)
    },
    {
      label: 'Editar',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      type: 'primary',
      action: (user: User) => this.editUser(user)
    },
    {
      label: 'Excluir',
      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      type: 'danger',
      action: (user: User) => this.deleteUser(user)
    }
  ];

  constructor(private adminService: AdminService, private authService: AuthService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openUserModal(): void {
    this.editMode = false;
    this.modalTitle = 'Novo Usuário';
    this.currentUser = {
      name: '',
      email: '',
      role: '',
      active: true,
      password: ''
    };
    this.isModalOpen = true;
  }

  viewUserAffiliates(user: User): void {
    this.selectedUserForAffiliates = user;
    this.isAffiliatesOpen = true;
  }

  closeAffiliatesPanel(): void {
    this.isAffiliatesOpen = false;
    this.selectedUserForAffiliates = null;
  }

  onAffiliatesPanelBackdropClick(event: MouseEvent): void {
    // Fechar apenas se clicar no backdrop (div com fixed inset-0)
    const target = event.target as HTMLElement;
    if (target.classList.contains('fixed') && target.classList.contains('inset-0')) {
      this.closeAffiliatesPanel();
    }
  }

  editUser(user: User): void {
    this.editMode = true;
    this.modalTitle = 'Editar Usuário';
    this.currentUser = {
      ...user,
      password: ''
    };
    this.isModalOpen = true;
  }

  deleteUser(user: User): void {
    this.userToDelete = user;
    this.isDeleteModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.userToDelete = null;
  }

  isFormValid(): boolean {
    return !!(
      this.currentUser.name &&
      this.currentUser.email &&
      this.currentUser.role &&
      (this.editMode || this.currentUser.password)
    );
  }

  saveUser(): void {
    if (!this.isFormValid()) return;
    if (this.editMode) {
      // UPDATE NO LARAVEL
      const payload = {
        name: this.currentUser.name,
        email: this.currentUser.email,
        role: this.currentUser.role,
        active: this.currentUser.active,
        password: this.currentUser.password ? this.currentUser.password : undefined
      };

      this.authService.updateUser(this.currentUser.id, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated: any) => {
            // Atualiza localmente
            const idx = this.users.findIndex(u => u.id === updated.user.id);
            if (idx !== -1) {
              this.users[idx] = {
                ...updated.user,
                roleLabel: this.getRoleLabel(updated.user.role)
              };
            }

            this.closeModal();
            this.isLoading = true;
            this.loadUsers();
          },
          error: (err) => console.error(err)
        });

    } else {
      const payload = {
        name: this.currentUser.name,
        email: this.currentUser.email,
        role: this.currentUser.role,
        active: this.currentUser.active,
        password: this.currentUser.password
      };

      this.authService.register(payload).subscribe(newUser => {
        this.users.push({
          ...newUser,
          roleLabel: this.getRoleLabel(newUser.role)
        });

        this.closeModal();
        this.isLoading = true;
        this.loadUsers();
      });
      return;
    }
  }

  confirmDelete(): void {
    if (this.userToDelete) {
      const payload = {
       
        active: false,
      
      };

      this.authService.updateUser(Number(this.userToDelete.id), payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated: any) => {
           this.closeDeleteModal();
            this.loadUsers();
          },
          error: (err) => console.error(err)
        });
      
    }
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'admin': 'Administrador',
      'gestor': 'Gerente',
      'vendedor': 'Vendedor'
    };
    return labels[role] || role;
  }

  private loadUsers(): void {
    this.isLoading = true;

    this.authService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {

          if (res.users === null || res.users.length === 0) {

            this.isLoading = false;
            return;
          }
          this.users = res.users.map((user: any) => ({
            ...user,
            roleLabel: this.getRoleLabel(user.role)
          }));
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  private resetForm(): void {
    this.currentUser = {
      name: '',
      email: '',
      role: '',
      active: true,
      password: ''
    };
  }
}
