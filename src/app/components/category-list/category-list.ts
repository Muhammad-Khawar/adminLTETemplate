import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ICategory, CategoryService } from '../../services/category-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-category-list',
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList implements OnInit {
  // Categories array to display
  categories: ICategory[] = [];
  
  // Search term for filtering
  searchTerm: string = '';
  
  // Loading state
  loading: boolean = false;
  
  // Error message
  errorMessage: string | null = null;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    // Load categories when component initializes
    this.loadCategories();
  }

  /**
   * Load all categories from the service
   */
  loadCategories(): void {
    this.loading = true;
    this.errorMessage = null;
    
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.errorMessage = 'Failed to load categories. Please try again.';
        this.loading = false;
      }
    });
  }

  /**
   * Search categories by name or description
   */
  searchCategories(): void {
    if (!this.searchTerm.trim()) {
      // If search term is empty, load all categories
      this.loadCategories();
      return;
    }
    
    this.loading = true;
    this.errorMessage = null;
    
    this.categoryService.searchCategories(this.searchTerm).subscribe({
      next: (filteredCategories) => {
        this.categories = filteredCategories;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching categories:', error);
        this.errorMessage = 'Failed to search categories.';
        this.loading = false;
        this.categories = []; // Clear results on error
      }
    });
  }

  /**
   * Update category status
   * @param id - Category ID
   * @param newStatus - New status value
   */
  updateCategoryStatus(id: string, newStatus: ICategory['status']): void {
    this.categoryService.updateCategory(id, { status: newStatus }).subscribe({
      next: (updatedCategory) => {
        if (updatedCategory) {
          console.log(`Category status updated to ${newStatus}`);
          // Optional: Show success message or update local array
          const index = this.categories.findIndex(cat => cat.id === id);
          if (index !== -1) {
            this.categories[index].status = newStatus;
          }
        } else {
          alert('Failed to update category status');
          // Reload to get original status
          this.loadCategories();
        }
      },
      error: (error) => {
        console.error('Error updating category status:', error);
        alert('An error occurred while updating status');
        // Reload to get original status
        this.loadCategories();
      }
    });
  }

  /**
   * Delete a category
   * @param id - Category ID to delete
   * @param name - Category name (for confirmation message)
   */
  deleteCategory(id: string, name: string): void {
    // Confirm before deleting
    if (!confirm(`Are you sure you want to delete "${name}"?\nThis action cannot be undone.`)) {
      return;
    }
    
    this.categoryService.deleteCategory(id).subscribe({
      next: (success) => {
        if (success) {
          // Remove from local array without reloading
          this.categories = this.categories.filter(cat => cat.id !== id);
          alert(`"${name}" has been deleted successfully.`);
        } else {
          alert('Failed to delete category. It might have already been deleted.');
          this.loadCategories(); // Reload to sync
        }
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        alert('An error occurred while deleting the category.');
      }
    });
  }

  /**
   * Get status badge class based on status value
   * @param status - Category status
   * @returns Bootstrap badge class
   */
  getStatusBadgeClass(status: ICategory['status']): string {
    switch (status) {
      case 'active':
        return 'badge bg-success';
      case 'inactive':
        return 'badge bg-secondary';
      case 'draft':
        return 'badge bg-warning text-dark';
      default:
        return 'badge bg-info';
    }
  }

  /**
   * Get status text for display
   * @param status - Category status
   * @returns Formatted status text
   */
  getStatusText(status: ICategory['status']): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  /**
   * Clear search and show all categories
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.loadCategories();
  }

  /**
   * Refresh categories list
   */
  refresh(): void {
    this.loadCategories();
  }

  /**
   * Get featured categories count
   */
  getFeaturedCount(): number {
    return this.categories.filter(cat => cat.isFeatured).length;
  }

  /**
   * Get active categories count
   */
  getActiveCount(): number {
    return this.categories.filter(cat => cat.status === 'active').length;
  }
}