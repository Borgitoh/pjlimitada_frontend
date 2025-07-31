import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { User, TableColumn, TableAction } from '../../models/admin.models';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  currentUser: any = {
    name: '',
    email: '',
    role: '',
    active: true,
    password: ''
  };
  
  isModalOpen = false;
  isDeleteModalOpen = false;
  editMode = false;
  modalTitle = '';
  userToDelete: User | null = null;
  
  private destroy$ = new Subject<void>();

  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Nome', sortable: true, type: 'text' },
    { key: 'email', label: 'E-mail', sortable: true, type: 'text' },
    { key: 'role', label: 'Cargo', sortable: true, type: 'text' },
    { key: 'active', label: 'Status', type: 'status' },
    { key: 'lastLogin', label: 'Último Login', type: 'date', sortable: true },
    { key: 'actions', label: 'Ações', type: 'actions', width: '120px' }
  ];

  tableActions: TableAction[] = [
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

  constructor(private adminService: AdminService) {}

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
      // Update existing user
      const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
      if (userIndex !== -1) {
        this.users[userIndex] = {
          ...this.currentUser,
          lastLogin: this.users[userIndex].lastLogin
        };
      }
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: this.currentUser.name,
        email: this.currentUser.email,
        role: this.currentUser.role,
        active: this.currentUser.active,
        createdAt: new Date()
      };
      this.users.push(newUser);
    }

    this.closeModal();
  }

  confirmDelete(): void {
    if (this.userToDelete) {
      this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
      this.closeDeleteModal();
    }
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'admin': 'Administrador',
      'manager': 'Gerente',
      'seller': 'Vendedor'
    };
    return labels[role] || role;
  }

  private loadUsers(): void {
    this.adminService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        // Transform role labels for display
        this.users = users.map(user => ({
          ...user,
          role: this.getRoleLabel(user.role)
        }));
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
