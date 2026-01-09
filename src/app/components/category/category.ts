import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService, ICategory } from '../../services/category-service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category implements OnInit {
  // Form
  categoryForm: FormGroup;
  
  // Data
  categories: ICategory[] = [];
  previewImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  
  // State
  isSubmitting = false;
  isLoading = false;
  isEditMode = false;
  currentCategoryId: string | null = null;
  pageTitle = 'Create New Category';
  buttonText = 'Create Category';
  
  // Form validation messages
  validationMessages: any = {
  name: {
    required: 'Category name is required.',
    minlength: 'Category name must be at least 3 characters.',
    maxlength: 'Category name cannot exceed 100 characters.'
  },
  slug: {
    pattern: 'Slug can only contain lowercase letters, numbers, and hyphens.',
    required: 'Slug is required.'
  },
  description: {
    maxlength: 'Description cannot exceed 500 characters.'
  },
  status: {
    required: 'Status is required.'
  },
  displayOrder: {
    min: 'Display order cannot be negative.'
  }
};

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      description: ['', [Validators.maxLength(500)]],
      parentId: [''],
      status: ['active', Validators.required],
      displayOrder: [0, [Validators.min(0)]],
      isFeatured: [false]
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode (has an ID parameter)
    this.route.params.subscribe(params => {
      const categoryId = params['id'];
      
      if (categoryId) {
        this.isEditMode = true;
        this.currentCategoryId = categoryId;
        this.pageTitle = 'Edit Category';
        this.buttonText = 'Update Category';
        this.loadCategoryForEdit(categoryId);
      } else {
        this.isEditMode = false;
        this.pageTitle = 'Create New Category';
        this.buttonText = 'Create Category';
      }
    });
    
    // Load categories for parent dropdown
    this.loadCategories();
    
    // Auto-generate slug from name (only for create mode)
    if (!this.isEditMode) {
      this.categoryForm.get('name')?.valueChanges.subscribe(name => {
        if (name && !this.categoryForm.get('slug')?.dirty) {
          const slug = this.generateSlug(name);
          this.categoryForm.get('slug')?.setValue(slug);
        }
      });
    }
  }
  
  private generateSlug(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getTopLevelCategories().subscribe({
      next: (categories) => {
        // If in edit mode, exclude the current category from parent list
        if (this.isEditMode && this.currentCategoryId) {
          this.categories = categories.filter(cat => cat.id !== this.currentCategoryId);
        } else {
          this.categories = categories;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
        this.isLoading = false;
      }
    });
  }

  loadCategoryForEdit(categoryId: string): void {
    this.isLoading = true;
    this.categoryService.getCategoryById(categoryId).subscribe({
      next: (category) => {
        if (category) {
          // Populate form with category data
          this.categoryForm.patchValue({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            parentId: category.parentId || '',
            status: category.status,
            displayOrder: category.displayOrder,
            isFeatured: category.isFeatured
          });
          
          // If there's an image URL, set it as preview
          if (category.imageUrl) {
            this.previewImage = category.imageUrl;
          }
        } else {
          console.error('Category not found');
          this.router.navigate(['/home/categorylist']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load category:', error);
        this.router.navigate(['/home/categorylist']);
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should be less than 2MB');
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Only JPG, PNG, and GIF images are allowed');
        return;
      }
      
      this.selectedFile = file;
      
      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.previewImage = null;
    this.selectedFile = null;
    // Reset file input
    const fileInput = document.getElementById('categoryImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting = true;
    
    // Check if slug already exists (for create mode or if slug changed in edit mode)
    const slug = this.categoryForm.get('slug')?.value;
    const excludeId = this.isEditMode ? this.currentCategoryId : undefined;
    
    this.categoryService.isSlugExists(slug, excludeId).subscribe({
      next: (slugExists) => {
        if (slugExists) {
          alert('This slug already exists. Please use a different one.');
          this.isSubmitting = false;
          return;
        }
        
        // Prepare category data
        const categoryData = {
          name: this.categoryForm.get('name')?.value,
          slug: slug,
          description: this.categoryForm.get('description')?.value || '',
          parentId: this.categoryForm.get('parentId')?.value || '',
          status: this.categoryForm.get('status')?.value,
          displayOrder: this.categoryForm.get('displayOrder')?.value || 0,
          isFeatured: this.categoryForm.get('isFeatured')?.value || false
        };
        
        if (this.isEditMode && this.currentCategoryId) {
          // Update existing category
          this.categoryService.updateCategory(this.currentCategoryId, categoryData).subscribe({
            next: (updatedCategory) => {
              this.isSubmitting = false;
              if (updatedCategory) {
                alert(`Category "${updatedCategory.name}" updated successfully!`);
                this.router.navigate(['/home/categorylist']);
              } else {
                alert('Failed to update category');
              }
            },
            error: (error) => {
              this.isSubmitting = false;
              alert('Failed to update category');
              console.error('Error:', error);
            }
          });
        } else {
          // Create new category
          this.categoryService.createCategory(categoryData).subscribe({
            next: (newCategory) => {
              this.isSubmitting = false;
              alert(`Category "${newCategory.name}" created successfully!`);
              this.categoryForm.reset({
                status: 'active',
                displayOrder: 0,
                isFeatured: false
              });
              this.previewImage = null;
              this.selectedFile = null;
              this.loadCategories(); // Refresh the list
            },
            error: (error) => {
              this.isSubmitting = false;
              alert('Failed to create category');
              console.error('Error:', error);
            }
          });
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        alert('Error checking slug availability');
        console.error('Error:', error);
      }
    });
  }

  onReset(): void {
    if (this.isEditMode && this.currentCategoryId) {
      // Reload original data for edit mode
      this.loadCategoryForEdit(this.currentCategoryId);
    } else {
      // Reset to initial state for create mode
      this.categoryForm.reset({
        status: 'active',
        displayOrder: 0,
        isFeatured: false
      });
      this.previewImage = null;
      this.selectedFile = null;
      this.categoryForm.markAsUntouched();
    }
  }

  // Helper method to check if a field has errors
  hasError(controlName: string, errorType: string): boolean {
    const control = this.categoryForm.get(controlName);
    return control ? control.hasError(errorType) && (control.dirty || control.touched) : false;
  }

  // Get error message for a field
  getErrorMessage(controlName: string): string {
  const control = this.categoryForm.get(controlName);
  if (!control || !control.errors) return '';
  
  const errors = control.errors;
  const fieldMessages = this.validationMessages[controlName];
  
  if (errors['required']) return fieldMessages?.['required'] ?? 'This field is required';
  if (errors['minlength']) return fieldMessages?.['minlength'] ?? `Minimum ${errors['minlength'].requiredLength} characters required`;
  if (errors['maxlength']) return fieldMessages?.['maxlength'] ?? `Maximum ${errors['maxlength'].requiredLength} characters allowed`;
  if (errors['pattern']) return fieldMessages?.['pattern'] ?? 'Invalid format';
  if (errors['min']) return fieldMessages?.['min'] ?? `Minimum value is ${errors['min'].min}`;
  
  return '';
}
}